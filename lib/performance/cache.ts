/**
 * API Response Caching
 * Simple in-memory cache for API responses
 */

interface CacheEntry {
  data: unknown;
  expiresAt: number;
  tags?: string[];
}

class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize = 1000; // Maximum number of entries

  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached value
   */
  set(
    key: string,
    data: unknown,
    options: {
      ttl?: number; // Time to live in seconds
      tags?: string[];
    } = {}
  ): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const ttl = options.ttl || 300; // Default 5 minutes
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(key, {
      data,
      expiresAt,
      tags: options.tags,
    });
  }

  /**
   * Invalidate cache by tag
   */
  invalidateByTag(tag: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

export const cacheService = typeof window === "undefined" 
  ? new CacheService() 
  : {
      get: () => null,
      set: () => {},
      invalidateByTag: () => {},
      clear: () => {},
      getStats: () => ({ size: 0, maxSize: 1000 }),
    } as CacheService;
