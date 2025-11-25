/**
 * Cache Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheService } from '@/lib/cache/cache-service';

// Mock Redis
vi.mock('ioredis', () => {
  return {
    default: vi.fn(() => ({
      connect: vi.fn(),
      get: vi.fn(),
      setex: vi.fn(),
      del: vi.fn(),
      quit: vi.fn(),
    })),
  };
});

describe('CacheService', () => {
  beforeEach(() => {
    // Clear in-memory cache
    vi.clearAllMocks();
  });

  it('should generate query key correctly', () => {
    const key = cacheService.generateQueryKey('users', { id: '123' });
    expect(key).toContain('query:users:');
  });

  it('should generate API key correctly', () => {
    const key = cacheService.generateApiKey('/api/users', { id: '123' });
    expect(key).toContain('api:/api/users:');
  });

  it('should set and get value from cache', async () => {
    const testKey = 'test-key';
    const testValue = { data: 'test' };
    
    await cacheService.set(testKey, testValue, { ttlSeconds: 60 });
    
    const result = await cacheService.get(testKey);
    
    // In-memory cache should work
    expect(result.hit).toBe(true);
    expect(result.value).toEqual(testValue);
  });

  it('should return cache miss for non-existent key', async () => {
    const result = await cacheService.get('non-existent-key');
    expect(result.hit).toBe(false);
  });

  it('should delete cached value', async () => {
    const testKey = 'test-key';
    const testValue = { data: 'test' };
    
    await cacheService.set(testKey, testValue, { ttlSeconds: 60 });
    await cacheService.delete(testKey);
    
    const result = await cacheService.get(testKey);
    expect(result.hit).toBe(false);
  });
});
