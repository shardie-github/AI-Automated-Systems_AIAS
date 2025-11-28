/**
 * Distributed Caching Service
 * Supports Redis, Vercel KV, and in-memory fallback
 * 
 * Production-ready caching with:
 * - Distributed state via Redis/Vercel KV
 * - Automatic fallback to in-memory for development
 * - Tag-based invalidation
 * - TTL support
 * - Performance monitoring
 */

import Redis from 'ioredis';
import { logger } from '@/lib/logging/structured-logger';

interface CacheEntry {
  data: unknown;
  expiresAt: number;
  tags?: string[];
}

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[];
  tenantId?: string;
}

class CacheService {
  private redis: Redis | null = null;
  private inMemoryCache: Map<string, CacheEntry> = new Map();
  private useRedis: boolean = false;
  private useVercelKV: boolean = false;
  private maxSize = 1000; // Maximum number of in-memory entries

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
          url: redisUrl.replace(/:[^:@]+@/, ':****@'), // Mask password
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
   * Get cached value from Redis
   */
  private async getFromRedis<T>(key: string): Promise<T | null> {
    if (!this.redis) {
      throw new Error('Redis not initialized');
    }

    try {
      const value = await this.redis.get(key);
      if (!value) return null;

      const entry: CacheEntry = JSON.parse(value);
      if (Date.now() > entry.expiresAt) {
        await this.redis.del(key);
        return null;
      }

      return entry.data as T;
    } catch (error) {
      logger.error('Redis cache get failed', error instanceof Error ? error : new Error(String(error)), {
        key,
      });
      throw error;
    }
  }

  /**
   * Set cached value in Redis
   */
  private async setInRedis(key: string, data: unknown, options: CacheOptions): Promise<void> {
    if (!this.redis) {
      throw new Error('Redis not initialized');
    }

    try {
      const ttl = options.ttl || 300; // Default 5 minutes
      const expiresAt = Date.now() + ttl * 1000;

      const entry: CacheEntry = {
        data,
        expiresAt,
        tags: options.tags,
      };

      await this.redis.setex(key, ttl, JSON.stringify(entry));

      // Store tag mappings for invalidation
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          const tagKey = `cache:tag:${tag}`;
          await this.redis.sadd(tagKey, key);
          await this.redis.expire(tagKey, ttl);
        }
      }
    } catch (error) {
      logger.error('Redis cache set failed', error instanceof Error ? error : new Error(String(error)), {
        key,
      });
      throw error;
    }
  }

  /**
   * Get cached value from Vercel KV
   */
  private async getFromVercelKV<T>(key: string): Promise<T | null> {
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
        return null;
      }

      const data = await response.json();
      if (!data.result) return null;

      const entry: CacheEntry = JSON.parse(data.result);
      if (Date.now() > entry.expiresAt) {
        await this.deleteFromVercelKV(key);
        return null;
      }

      return entry.data as T;
    } catch (error) {
      logger.error('Vercel KV cache get failed', error instanceof Error ? error : new Error(String(error)), {
        key,
      });
      throw error;
    }
  }

  /**
   * Set cached value in Vercel KV
   */
  private async setInVercelKV(key: string, data: unknown, options: CacheOptions): Promise<void> {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;

    if (!kvUrl || !kvToken) {
      throw new Error('Vercel KV not configured');
    }

    try {
      const ttl = options.ttl || 300; // Default 5 minutes
      const expiresAt = Date.now() + ttl * 1000;

      const entry: CacheEntry = {
        data,
        expiresAt,
        tags: options.tags,
      };

      await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: JSON.stringify(entry),
          expiration: ttl,
        }),
      });

      // Store tag mappings for invalidation
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          const tagKey = `cache:tag:${tag}`;
          const tagResponse = await fetch(`${kvUrl}/get/${encodeURIComponent(tagKey)}`, {
            headers: {
              Authorization: `Bearer ${kvToken}`,
            },
          });

          let tagKeys: string[] = [];
          if (tagResponse.ok) {
            const tagData = await tagResponse.json();
            if (tagData.result) {
              tagKeys = JSON.parse(tagData.result);
            }
          }

          tagKeys.push(key);
          await fetch(`${kvUrl}/set/${encodeURIComponent(tagKey)}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${kvToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              value: JSON.stringify(tagKeys),
              expiration: ttl,
            }),
          });
        }
      }
    } catch (error) {
      logger.error('Vercel KV cache set failed', error instanceof Error ? error : new Error(String(error)), {
        key,
      });
      throw error;
    }
  }

  /**
   * Delete from Vercel KV
   */
  private async deleteFromVercelKV(key: string): Promise<void> {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;

    if (!kvUrl || !kvToken) return;

    try {
      await fetch(`${kvUrl}/delete/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
        },
      });
    } catch (error) {
      logger.warn('Vercel KV cache delete failed', {
        error: error instanceof Error ? error.message : String(error),
        key,
      });
    }
  }

  /**
   * Get cached value (tries Redis/KV first, falls back to in-memory)
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    // Add tenant prefix if provided
    const fullKey = options.tenantId ? `tenant:${options.tenantId}:${key}` : key;

    // Try Redis first
    if (this.useRedis && this.redis) {
      try {
        return await this.getFromRedis<T>(fullKey);
      } catch (error) {
        logger.warn('Redis cache get failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
          key: fullKey,
        });
        // Fall through to in-memory
      }
    }

    // Try Vercel KV
    if (this.useVercelKV) {
      try {
        return await this.getFromVercelKV<T>(fullKey);
      } catch (error) {
        logger.warn('Vercel KV cache get failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
          key: fullKey,
        });
        // Fall through to in-memory
      }
    }

    // Fallback to in-memory
    return this.getFromMemory<T>(fullKey);
  }

  /**
   * Set cached value (tries Redis/KV first, falls back to in-memory)
   */
  async set(key: string, data: unknown, options: CacheOptions = {}): Promise<void> {
    // Add tenant prefix if provided
    const fullKey = options.tenantId ? `tenant:${options.tenantId}:${key}` : key;

    // Try Redis first
    if (this.useRedis && this.redis) {
      try {
        await this.setInRedis(fullKey, data, options);
        return;
      } catch (error) {
        logger.warn('Redis cache set failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
          key: fullKey,
        });
        // Fall through to in-memory
      }
    }

    // Try Vercel KV
    if (this.useVercelKV) {
      try {
        await this.setInVercelKV(fullKey, data, options);
        return;
      } catch (error) {
        logger.warn('Vercel KV cache set failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
          key: fullKey,
        });
        // Fall through to in-memory
      }
    }

    // Fallback to in-memory
    this.setInMemory(fullKey, data, options);
  }

  /**
   * Get from in-memory cache
   */
  private getFromMemory<T>(key: string): T | null {
    const entry = this.inMemoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.inMemoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set in in-memory cache
   */
  private setInMemory(key: string, data: unknown, options: CacheOptions): void {
    // Evict oldest entries if cache is full
    if (this.inMemoryCache.size >= this.maxSize) {
      const firstKey = this.inMemoryCache.keys().next().value;
      if (firstKey) {
        this.inMemoryCache.delete(firstKey);
      }
    }

    const ttl = options.ttl || 300; // Default 5 minutes
    const expiresAt = Date.now() + ttl * 1000;

    this.inMemoryCache.set(key, {
      data,
      expiresAt,
      tags: options.tags,
    });
  }

  /**
   * Invalidate cache by tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    // Try Redis first
    if (this.useRedis && this.redis) {
      try {
        const tagKey = `cache:tag:${tag}`;
        const keys = await this.redis.smembers(tagKey);
        if (keys && keys.length > 0) {
          await this.redis.del(...keys);
        }
        await this.redis.del(tagKey);
        return;
      } catch (error) {
        logger.warn('Redis tag invalidation failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
          tag,
        });
        // Fall through to in-memory
      }
    }

    // Try Vercel KV
    if (this.useVercelKV) {
      try {
        const tagKey = `cache:tag:${tag}`;
        const kvUrl = process.env.KV_REST_API_URL;
        const kvToken = process.env.KV_REST_API_TOKEN;

        if (kvUrl && kvToken) {
          const response = await fetch(`${kvUrl}/get/${encodeURIComponent(tagKey)}`, {
            headers: {
              Authorization: `Bearer ${kvToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.result) {
              const keys: string[] = JSON.parse(data.result);
              for (const key of keys) {
                await this.deleteFromVercelKV(key);
              }
            }
          }

          await this.deleteFromVercelKV(tagKey);
        }
        return;
      } catch (error) {
        logger.warn('Vercel KV tag invalidation failed, falling back to in-memory', {
          error: error instanceof Error ? error.message : String(error),
          tag,
        });
        // Fall through to in-memory
      }
    }

    // Fallback to in-memory
    for (const [key, entry] of this.inMemoryCache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.inMemoryCache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    // Clear Redis
    if (this.useRedis && this.redis) {
      try {
        await this.redis.flushdb();
        return;
      } catch (error) {
        logger.warn('Redis cache clear failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Clear in-memory
    this.inMemoryCache.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; maxSize: number; provider: string } {
    return {
      size: this.inMemoryCache.size,
      maxSize: this.maxSize,
      provider: this.useRedis ? 'redis' : this.useVercelKV ? 'vercel-kv' : 'in-memory',
    };
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

// Singleton instance (server-side only)
export const cacheService = typeof window === 'undefined'
  ? new CacheService()
  : ({
      get: async () => null,
      set: async () => {},
      invalidateByTag: async () => {},
      clear: async () => {},
      getStats: () => ({ size: 0, maxSize: 1000, provider: 'client-side' }),
      close: async () => {},
    } as unknown as CacheService);
