import { describe, it, expect, vi, beforeEach } from 'vitest';
import { retry, CircuitBreaker } from '@/lib/utils/retry';

describe('Retry Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retry failed operations', async () => {
    let attempts = 0;
    const fn = vi.fn(async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Failed');
      }
      return 'success';
    });

    const result = await retry(fn, { maxRetries: 3, delay: 10 } as any);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should fail after max retries', async () => {
    const fn = vi.fn(async () => {
      throw new Error('Always fails');
    });

    await expect(retry(fn, { maxRetries: 2, delay: 10 } as any)).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('should respect retry delay', async () => {
    const start = Date.now();
    const fn = vi.fn(async () => {
      throw new Error('Fail');
    });

    try {
      await retry(fn, { maxRetries: 1, delay: 100 } as any);
    } catch {
      // Expected to fail
    }

    const duration = Date.now() - start;
    expect(duration).toBeGreaterThanOrEqual(100);
  });
});

describe('Circuit Breaker', () => {
  it('should open after failure threshold', async () => {
    const breaker = new CircuitBreaker(3) as any;
    (breaker as any).resetTimeout = 1000;

    // Fail 3 times
    for (let i = 0; i < 3; i++) {
      (breaker as any).recordFailure();
    }

    expect((breaker as any).isOpen()).toBe(true);
  });

  it('should reset after timeout', async () => {
    const breaker = new CircuitBreaker(2) as any;
    (breaker as any).resetTimeout = 100;

    (breaker as any).recordFailure();
    (breaker as any).recordFailure();
    expect((breaker as any).isOpen()).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 150));
    expect((breaker as any).isOpen()).toBe(false);
  });
});
