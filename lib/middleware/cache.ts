/**
 * Caching Middleware
 * 
 * Provides intelligent caching strategies for API routes and pages.
 * Supports ETags, Cache-Control headers, and in-memory caching.
 */

import { NextRequest, NextResponse } from "next/server";

export interface CacheConfig {
  maxAge?: number; // seconds
  staleWhileRevalidate?: number; // seconds
  mustRevalidate?: boolean;
  private?: boolean;
  noStore?: boolean;
  noCache?: boolean;
}

/**
 * Generate ETag from content
 */
export function generateETag(content: string | object): string {
  const contentString = typeof content === "string" ? content : JSON.stringify(content);
  // Simple hash function (for production, use crypto.createHash)
  let hash = 0;
  for (let i = 0; i < contentString.length; i++) {
    const char = contentString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `"${hash.toString(16)}"`;
}

/**
 * Check if request has matching ETag (304 Not Modified)
 */
export function checkETag(
  request: NextRequest,
  etag: string
): { notModified: boolean; response?: NextResponse } {
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch === etag) {
    return {
      notModified: true,
      response: new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "public, max-age=3600",
        },
      }),
    };
  }
  return { notModified: false };
}

/**
 * Add cache headers to response
 */
export function addCacheHeaders(
  response: NextResponse,
  config: CacheConfig
): NextResponse {
  if (config.noStore) {
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  if (config.noCache) {
    response.headers.set("Cache-Control", "no-cache, must-revalidate");
    return response;
  }

  const directives: string[] = [];

  if (config.private) {
    directives.push("private");
  } else {
    directives.push("public");
  }

  if (config.maxAge !== undefined) {
    directives.push(`max-age=${config.maxAge}`);
  }

  if (config.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }

  if (config.mustRevalidate) {
    directives.push("must-revalidate");
  }

  response.headers.set("Cache-Control", directives.join(", "));

  return response;
}

/**
 * In-memory cache store
 */
class MemoryCache {
  private store: Map<string, { data: any; expires: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  get(key: string): any | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any, ttl: number): void {
    this.store.set(key, {
      data,
      expires: Date.now() + ttl * 1000,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expires) {
        this.store.delete(key);
      }
    }
  }
}

export const memoryCache = new MemoryCache();

/**
 * Cache key generator
 */
export function generateCacheKey(
  path: string,
  query?: Record<string, string>
): string {
  const queryString = query
    ? "?" + new URLSearchParams(query).toString()
    : "";
  return `cache:${path}${queryString}`;
}

/**
 * Cached response wrapper
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  // Check cache
  const cached = memoryCache.get(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch and cache
  const data = await fetcher();
  memoryCache.set(key, data, ttl);
  return data;
}
