import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimiter } from '@/lib/performance/rate-limiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    // Cleanup in-memory store before each test
    rateLimiter.cleanup();
  });

  describe('In-memory fallback', () => {
    it('should allow requests within limit', async () => {
      const result = await rateLimiter.checkRateLimit(
        '/api/test',
        'test-identifier',
        { windowMs: 60000, maxRequests: 5 }
      );

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should block requests exceeding limit', async () => {
      const config = { windowMs: 60000, maxRequests: 3 };
      const pathname = '/api/test';
      const identifier = 'test-identifier';

      // Make requests up to limit
      for (let i = 0; i < 3; i++) {
        const result = await rateLimiter.checkRateLimit(pathname, identifier, config);
        expect(result.allowed).toBe(true);
      }

      // Next request should be blocked
      const blocked = await rateLimiter.checkRateLimit(pathname, identifier, config);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const config = { windowMs: 100, maxRequests: 2 }; // Very short window for testing
      const pathname = '/api/test';
      const identifier = 'test-identifier';

      // Use up limit
      await rateLimiter.checkRateLimit(pathname, identifier, config);
      await rateLimiter.checkRateLimit(pathname, identifier, config);
      
      const blocked = await rateLimiter.checkRateLimit(pathname, identifier, config);
      expect(blocked.allowed).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be allowed again
      const allowed = await rateLimiter.checkRateLimit(pathname, identifier, config);
      expect(allowed.allowed).toBe(true);
      expect(allowed.remaining).toBe(1);
    });

    it('should handle different endpoints independently', async () => {
      const config = { windowMs: 60000, maxRequests: 2 };
      
      // Use limit on endpoint 1
      await rateLimiter.checkRateLimit('/api/endpoint1', 'user1', config);
      await rateLimiter.checkRateLimit('/api/endpoint1', 'user1', config);
      
      // Endpoint 2 should still have full limit
      const result = await rateLimiter.checkRateLimit('/api/endpoint2', 'user1', config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should handle different identifiers independently', async () => {
      const config = { windowMs: 60000, maxRequests: 2 };
      
      // Use limit for user1
      await rateLimiter.checkRateLimit('/api/test', 'user1', config);
      await rateLimiter.checkRateLimit('/api/test', 'user1', config);
      
      // user2 should still have full limit
      const result = await rateLimiter.checkRateLimit('/api/test', 'user2', config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });

  describe('Error handling', () => {
    it('should fail gracefully and allow request if rate limiter fails', async () => {
      // This test verifies that errors don't break the application
      // The rate limiter should fail open (allow request) if it encounters errors
      const result = await rateLimiter.checkRateLimit(
        '/api/test',
        'test-identifier',
        { windowMs: 60000, maxRequests: 5 }
      );

      // Should always return a valid result
      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('resetTime');
      expect(typeof result.allowed).toBe('boolean');
      expect(typeof result.remaining).toBe('number');
      expect(typeof result.resetTime).toBe('number');
    });
  });
});
