/**
 * Distributed Rate Limiting Service
 * Supports Redis (ioredis) and Vercel KV with in-memory fallback
 * 
 * Production-ready rate limiting with:
 * - Distributed state via Redis/Vercel KV
 * - Automatic fallback to in-memory for development
 * - Comprehensive error handling and logging
 * - Performance monitoring
 */

import Redis from 'ioredis';
import { kv } from '@vercel/kv';
import { logger } from '@/lib/logging/structured-logger';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

class RateLimiter {
  private redis: Redis | null = null;
  private inMemoryStore: Map<string, { count: number; resetTime: number }> = new Map();
  private useRedis: boolean = false;
  private useVercelKV: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Try Redis first
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          enableReadyCheck: true,
          lazyConnect: true,
        });

        await this.redis.connect();
        this.useRedis = true;
        logger.info('Rate limiter initialized with Redis', {
          provider: 'redis',
          url: redisUrl.replace(/:[^:@]+@/, ':****@'), // Mask password
        });
        return;
      } catch (error) {
        logger.warn('Redis connection failed, falling back to in-memory rate limiting', {
          error: error instanceof Error ? error.message : String(error),
        });
        this.redis = null;
      }
    }

    // Try Vercel KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      this.useVercelKV = true;
      logger.info('Rate limiter initialized with Vercel KV', {
        provider: 'vercel-kv',
      });
      return;
    }

    // Fallback to in-memory
    logger.warn('Using in-memory rate limiting (not suitable for production)', {
      warning: 'Rate limits will reset on serverless cold starts',
      recommendation: 'Configure REDIS_URL or KV_REST_API_URL for production',
    });
  }

  /**
   * Check rate limit using Redis
   */
  private async checkRateLimitRedis(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    if (!this.redis) {
      throw new Error('Redis not initialized');
    }

    const now = Date.now();
    const windowSeconds = Math.ceil(config.windowMs / 1000);

    try {
      // Use Redis INCR with TTL
      const count = await this.redis.incr(key);
      
      if (count === 1) {
        // First request in window, set TTL
        await this.redis.expire(key, windowSeconds);
      }

      const ttl = await this.redis.ttl(key);
      const resetTime = now + (ttl * 1000);

      if (count > config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
        };
      }

      return {
        allowed: true,
        remaining: config.maxRequests - count,
        resetTime,
      };
    } catch (error) {
      logger.error('Redis rate limit check failed', error instanceof Error ? error : new Error(String(error)), {
        key,
        config,
      });
      throw error;
    }
  }

  /**
   * Check rate limit using Vercel KV SDK
   */
  private async checkRateLimitVercelKV(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error('Vercel KV not configured');
    }

    const now = Date.now();
    const windowSeconds = Math.ceil(config.windowMs / 1000);

    try {
      // Get current count using Vercel KV SDK
      const entry = await kv.get<{ count: number; resetTime: number }>(key);
      
      let count = 1;
      if (entry && entry.resetTime > now) {
        count = entry.count + 1;
      }

      // Set count with TTL using Vercel KV SDK
      const resetTime = now + config.windowMs;
      await kv.set(key, { count, resetTime }, { ex: windowSeconds });

      if (count > config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
        };
      }

      return {
        allowed: true,
        remaining: config.maxRequests - count,
        resetTime,
      };
    } catch (error) {
      logger.error('Vercel KV rate limit check failed', error instanceof Error ? error : new Error(String(error)), {
        key,
        config,
      });
      throw error;
    }
  }

  /**
   * Check rate limit using in-memory store (fallback)
   */
  private checkRateLimitInMemory(
    key: string,
    config: RateLimitConfig
  ): RateLimitResult {
    const now = Date.now();
    const entry = this.inMemoryStore.get(key);

    // Cleanup expired entries
    if (entry && entry.resetTime < now) {
      this.inMemoryStore.delete(key);
    }

    const currentEntry = this.inMemoryStore.get(key);

    if (!currentEntry) {
      // New window
      const resetTime = now + config.windowMs;
      this.inMemoryStore.set(key, {
        count: 1,
        resetTime,
      });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime,
      };
    }

    // Increment count
    currentEntry.count++;
    this.inMemoryStore.set(key, currentEntry);

    if (currentEntry.count > config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: currentEntry.resetTime,
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - currentEntry.count,
      resetTime: currentEntry.resetTime,
    };
  }

  /**
   * Check rate limit (tries Redis/KV first, falls back to in-memory)
   */
  async checkRateLimit(
    pathname: string,
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = `rate_limit:${pathname}:${identifier}`;

    // Try Redis first
    if (this.useRedis && this.redis) {
      try {
        return await this.checkRateLimitRedis(key, config);
      } catch (error) {
        logger.warn('Redis rate limit check failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
          key,
          fallback: 'in-memory',
        });
        // Fall through to in-memory
      }
    }

    // Try Vercel KV
    if (this.useVercelKV) {
      try {
        return await this.checkRateLimitVercelKV(key, config);
      } catch (error) {
        logger.warn('Vercel KV rate limit check failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
          key,
          fallback: 'in-memory',
        });
        // Fall through to in-memory
      }
    }

    // Fallback to in-memory
    return this.checkRateLimitInMemory(key, config);
  }

  /**
   * Cleanup in-memory store (for testing)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.inMemoryStore.entries()) {
      if (value.resetTime < now) {
        this.inMemoryStore.delete(key);
      }
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
      this.useRedis = false;
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();
