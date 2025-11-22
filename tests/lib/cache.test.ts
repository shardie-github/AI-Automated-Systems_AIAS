/**
 * Tests for Cache Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheService } from '@/lib/performance/cache';

describe('lib/performance/cache', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  describe('cacheService', () => {
    it('should store and retrieve cached values', () => {
      cacheService.set('test-key', { data: 'test-value' }, { ttl: 60 });
      
      const result = cacheService.get<{ data: string }>('test-key');
      
      expect(result).toEqual({ data: 'test-value' });
    });

    it('should return null for non-existent keys', () => {
      const result = cacheService.get('non-existent');
      
      expect(result).toBeNull();
    });

    it('should expire cached values after TTL', async () => {
      cacheService.set('test-key', 'value', { ttl: 1 }); // 1 second TTL
      
      // Should be available immediately
      expect(cacheService.get('test-key')).toBe('value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should be expired
      expect(cacheService.get('test-key')).toBeNull();
    });

    it('should use default TTL when not specified', () => {
      cacheService.set('test-key', 'value');
      
      const result = cacheService.get('test-key');
      expect(result).toBe('value');
    });

    it('should invalidate cache by tag', () => {
      cacheService.set('key1', 'value1', { tags: ['tag1'] });
      cacheService.set('key2', 'value2', { tags: ['tag2'] });
      cacheService.set('key3', 'value3', { tags: ['tag1'] });
      
      cacheService.invalidateByTag('tag1');
      
      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBe('value2');
      expect(cacheService.get('key3')).toBeNull();
    });

    it('should clear all cache', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      
      cacheService.clear();
      
      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
    });

    it('should return cache stats', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      
      const stats = cacheService.getStats();
      
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(1000);
    });

    it('should evict oldest entries when cache is full', () => {
      // Fill cache to max size
      for (let i = 0; i < 1001; i++) {
        cacheService.set(`key-${i}`, `value-${i}`);
      }
      
      const stats = cacheService.getStats();
      expect(stats.size).toBeLessThanOrEqual(1000);
      
      // First key should be evicted
      expect(cacheService.get('key-0')).toBeNull();
    });
  });
});
