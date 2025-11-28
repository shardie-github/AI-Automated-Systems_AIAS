/**
 * API Response Caching Middleware
 * 
 * Provides easy-to-use caching for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from './cache-service';
import { logger } from '@/lib/logging/structured-logger';

export interface ApiCacheConfig {
  ttlSeconds: number;
  keyPrefix?: string;
  varyByHeaders?: string[];
  varyByQuery?: boolean;
  skipCache?: (request: NextRequest) => boolean;
}

const DEFAULT_CONFIG: ApiCacheConfig = {
  ttlSeconds: 300, // 5 minutes
  keyPrefix: 'api:',
  varyByQuery: true,
  varyByHeaders: [],
};

/**
 * Generate cache key from request
 */
function generateCacheKey(request: NextRequest, config: ApiCacheConfig): string {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  const parts: string[] = [pathname];
  
  // Include query params if configured
  if (config.varyByQuery) {
    const queryStr = url.searchParams.toString();
    if (queryStr) {
      parts.push(queryStr);
    }
  }
  
  // Include headers if configured
  if (config.varyByHeaders && config.varyByHeaders.length > 0) {
    const headerValues = config.varyByHeaders
      .map(header => request.headers.get(header) || '')
      .join(':');
    if (headerValues) {
      parts.push(headerValues);
    }
  }
  
  const key = parts.join(':');
  return cacheService.generateApiKey(pathname, { key });
}

/**
 * Cache API response
 */
export async function cacheApiResponse<T>(
  request: NextRequest,
  handler: () => Promise<NextResponse<T>>,
  config: Partial<ApiCacheConfig> = {}
): Promise<NextResponse<T>> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Skip cache if configured
  if (finalConfig.skipCache && finalConfig.skipCache(request)) {
    return handler();
  }
  
  // Only cache GET requests
  if (request.method !== 'GET') {
    return handler();
  }
  
  const cacheKey = generateCacheKey(request, finalConfig);
  
  // Try to get from cache
  const cached = await cacheService.get<{ body: any; headers: Record<string, string>; status: number }>(
    cacheKey,
    finalConfig.keyPrefix
  );
  
  if (cached.hit && cached.value) {
    logger.info('API cache hit', {
      pathname: new URL(request.url).pathname,
      cacheKey,
    });
    
    const response = NextResponse.json(cached.value.body, { status: cached.value.status });
    
    // Restore headers
    Object.entries(cached.value.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Add cache headers
    response.headers.set('X-Cache', 'HIT');
    response.headers.set('X-Cache-Key', cacheKey);
    
    return response;
  }
  
  // Cache miss - execute handler
  logger.info('API cache miss', {
    pathname: new URL(request.url).pathname,
    cacheKey,
  });
  
  const response = await handler();
  
  // Only cache successful responses
  if (response.status >= 200 && response.status < 300) {
    const body = await response.clone().json().catch(() => null);
    
    if (body !== null) {
      // Store in cache
      await cacheService.set(
        cacheKey,
        {
          body,
          headers: Object.fromEntries(response.headers.entries()),
          status: response.status,
        },
        {
          ttlSeconds: finalConfig.ttlSeconds,
          keyPrefix: finalConfig.keyPrefix,
        }
      );
      
      // Add cache headers
      response.headers.set('X-Cache', 'MISS');
      response.headers.set('X-Cache-Key', cacheKey);
    }
  }
  
  return response;
}

/**
 * Invalidate cache for a path pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  // This is a simplified version - in production, you'd want to use Redis SCAN
  // or maintain a cache key registry
  logger.info('Cache invalidation requested', { pattern });
  
  // For now, we'll need to track keys separately or use a pattern-based approach
  // This is a placeholder for future implementation
}
