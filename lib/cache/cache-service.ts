/**
 * Distributed Caching Service
 * 
 * Supports Redis (ioredis) and Vercel KV with in-memory fallback
 * Provides query result caching and API response caching
 */

import Redis from 'ioredis';
import { logger } from '@/lib/logging/structured-logger';

interface CacheConfig {
  ttlSeconds: number;
  keyPrefix?: string;
}

interface CacheResult<T> {
  hit: boolean;
  value?: T;
  error?: string;
}

class CacheService {
  private redis: Redis | null = null;
  private inMemoryStore: Map<string, { value: any; expiresAt: number }> = new Map();
  private useRedis: boolean = false;
  private useVercelKV: boolean = false;
  private keyPrefix: string = 'cache:';

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
        logger.info('Cache service initialized with Redis', {
          provider: 'redis',
        });
        return;
      } catch (error) {
        logger.warn('Redis connection failed, falling back to in-memory cache', {
          error: error instanceof Error ? error.message : String(error),
        });
        this.redis = null;
      }
    }

    // Try Vercel KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      this.useVercelKV = true;
      logger.info('Cache service initialized with Vercel KV', {
        provider: 'vercel-kv',
      });
      return;
    }

    // Fallback to in-memory
    logger.warn('Using in-memory cache (not suitable for production)', {
      warning: 'Cache will reset on serverless cold starts',
      recommendation: 'Configure REDIS_URL or KV_REST_API_URL for production',
    });
  }

  /**
   * Generate cache key
   */
  private getCacheKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || this.keyPrefix;
    return `${keyPrefix}${key}`;
  }

  /**
   * Get from Redis
   */
  private async getFromRedis<T>(key: string): Promise<CacheResult<T>> {
    if (!this.redis) {
      throw new Error('Redis not initialized');
    }

    try {
      const value = await this.redis.get(key);
      if (value === null) {
        return { hit: false };
      }

      return {
        hit: true,
        value: JSON.parse(value) as T,
      };
    } catch (error) {
      logger.error('Redis get failed', error instanceof Error ? error : new Error(String(error)), {
        key,
      });
      return {
        hit: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Set in Redis
   */
  private async setInRedis(key: string, value: any, ttlSeconds: number): Promise<void> {
    if (!this.redis) {
      throw new Error('Redis not initialized');
    }

    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error('Redis set failed', error instanceof Error ? error : new Error(String(error)), {
        key,
        ttlSeconds,
      });
      throw error;
    }
  }

  /**
   * Get from Vercel KV
   */
  private async getFromVercelKV<T>(key: string): Promise<CacheResult<T>> {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;

    if (!kvUrl || !kvToken) {
      throw new Error('Vercel KV not configured');
    }

    try {
      const response = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
        headers: {
          Authorization: `Bearer ${kvToken}`,
        },
      });

      if (!response.ok) {
        return { hit: false };
      }

      const data = await response.json();
      if (!data.result) {
        return { hit: false };
      }

      return {
        hit: true,
        value: JSON.parse(data.result) as T,
      };
    } catch (error) {
      logger.error('Vercel KV get failed', error instanceof Error ? error : new Error(String(error)), {
        key,
      });
      return {
        hit: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Set in Vercel KV
   */
  private async setInVercelKV(key: string, value: any, ttlSeconds: number): Promise<void> {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;

    if (!kvUrl || !kvToken) {
      throw new Error('Vercel KV not configured');
    }

    try {
      await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: JSON.stringify(value),
          expiration: ttlSeconds,
        }),
      });
    } catch (error) {
      logger.error('Vercel KV set failed', error instanceof Error ? error : new Error(String(error)), {
        key,
        ttlSeconds,
      });
      throw error;
    }
  }

  /**
   * Get from in-memory cache
   */
  private getFromMemory<T>(key: string): CacheResult<T> {
    const entry = this.inMemoryStore.get(key);
    if (!entry) {
      return { hit: false };
    }

    // Check expiration
    if (entry.expiresAt < Date.now()) {
      this.inMemoryStore.delete(key);
      return { hit: false };
    }

    return {
      hit: true,
      value: entry.value as T,
    };
  }

  /**
   * Set in in-memory cache
   */
  private setInMemory(key: string, value: any, ttlSeconds: number): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.inMemoryStore.set(key, {
      value,
      expiresAt,
    });

    // Cleanup expired entries periodically
    if (this.inMemoryStore.size > 1000) {
      this.cleanupMemory();
    }
  }

  /**
   * Cleanup expired in-memory entries
   */
  private cleanupMemory(): void {
    const now = Date.now();
    for (const [key, entry] of this.inMemoryStore.entries()) {
      if (entry.expiresAt < now) {
        this.inMemoryStore.delete(key);
      }
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, prefix?: string): Promise<CacheResult<T>> {
    const cacheKey = this.getCacheKey(key, prefix);

    // Try Redis first
    if (this.useRedis && this.redis) {
      try {
        return await this.getFromRedis<T>(cacheKey);
      } catch (error) {
        logger.warn('Redis get failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
          key: cacheKey,
        });
        // Fall through to in-memory
      }
    }

    // Try Vercel KV
    if (this.useVercelKV) {
      try {
        return await this.getFromVercelKV<T>(cacheKey);
      } catch (error) {
        logger.warn('Vercel KV get failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
          key: cacheKey,
        });
        // Fall through to in-memory
      }
    }

    // Fallback to in-memory
    return this.getFromMemory<T>(cacheKey);
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, config: CacheConfig): Promise<void> {
    const cacheKey = this.getCacheKey(key, config.keyPrefix);
    const ttlSeconds = config.ttlSeconds;

    // Try Redis first
    if (this.useRedis && this.redis) {
      try {
        await this.setInRedis(cacheKey, value, ttlSeconds);
        return;
      } catch (error) {
        logger.warn('Redis set failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
          key: cacheKey,
        });
        // Fall through to in-memory
      }
    }

    // Try Vercel KV
    if (this.useVercelKV) {
      try {
        await this.setInVercelKV(cacheKey, value, ttlSeconds);
        return;
      } catch (error) {
        logger.warn('Vercel KV set failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
          key: cacheKey,
        });
        // Fall through to in-memory
      }
    }

    // Fallback to in-memory
    this.setInMemory(cacheKey, value, ttlSeconds);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, prefix?: string): Promise<void> {
    const cacheKey = this.getCacheKey(key, prefix);

    // Try Redis first
    if (this.useRedis && this.redis) {
      try {
        await this.redis.del(cacheKey);
        return;
      } catch (error) {
        logger.warn('Redis delete failed', {
          error: error instanceof Error ? error.message : String(error),
          key: cacheKey,
        });
      }
    }

    // Try Vercel KV
    if (this.useVercelKV) {
      try {
        const kvUrl = process.env.KV_REST_API_URL;
        const kvToken = process.env.KV_REST_API_TOKEN;
        if (kvUrl && kvToken) {
          await fetch(`${kvUrl}/delete/${encodeURIComponent(cacheKey)}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${kvToken}`,
            },
          });
        }
        return;
      } catch (error) {
        logger.warn('Vercel KV delete failed', {
          error: error instanceof Error ? error.message : String(error),
          key: cacheKey,
        });
      }
    }

    // Delete from in-memory
    this.inMemoryStore.delete(cacheKey);
  }

  /**
   * Generate cache key from query parameters
   */
  generateQueryKey(table: string, filters: Record<string, any>): string {
    const filterStr = JSON.stringify(filters);
    const hash = Buffer.from(filterStr).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    return `query:${table}:${hash}`;
  }

  /**
   * Generate cache key from API route
   */
  generateApiKey(pathname: string, params: Record<string, any>): string {
    const paramStr = JSON.stringify(params);
    const hash = Buffer.from(paramStr).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    return `api:${pathname}:${hash}`;
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
export const cacheService = new CacheService();

/**
 * Cache decorator for API routes
 */
export function withCache<T>(
  key: string,
  config: CacheConfig,
  fn: () => Promise<T>
): Promise<T> {
  return cacheService.get<T>(key, config.keyPrefix).then(async (result) => {
    if (result.hit && result.value !== undefined) {
      return result.value;
    }

    const value = await fn();
    await cacheService.set(key, value, config);
    return value;
  });
}
