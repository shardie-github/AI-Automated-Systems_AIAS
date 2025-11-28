/**
 * Circuit Breaker Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreaker, circuitBreakerRegistry, withCircuitBreaker } from '@/lib/resilience/circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      name: 'test-service',
      failureThreshold: 3,
      timeout: 1000,
      successThreshold: 2,
    });
  });

  it('should start in closed state', () => {
    expect(breaker.getState()).toBe('closed');
  });

  it('should execute successful function', async () => {
    const result = await breaker.execute(async () => 'success');
    expect(result).toBe('success');
    expect(breaker.getState()).toBe('closed');
  });

  it('should count failures', async () => {
    const failingFn = async () => {
      throw new Error('Test error');
    };

    for (let i = 0; i < 2; i++) {
      try {
        await breaker.execute(failingFn);
      } catch {
        // Expected
      }
    }

    const metrics = breaker.getMetrics();
    expect(metrics.failures).toBe(2);
    expect(metrics.totalFailures).toBe(2);
  });

  it('should open circuit after failure threshold', async () => {
    const failingFn = async () => {
      throw new Error('Test error');
    };

    // Trigger failures up to threshold
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(failingFn);
      } catch {
        // Expected
      }
    }

    expect(breaker.getState()).toBe('open');
  });

  it('should use fallback when circuit is open', async () => {
    const failingFn = async () => {
      throw new Error('Test error');
    };

    const fallbackFn = async () => 'fallback';

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(failingFn);
      } catch {
        // Expected
      }
    }

    // Should use fallback
    const result = await breaker.execute(failingFn, fallbackFn);
    expect(result).toBe('fallback');
  });

  it('should enter half-open state after timeout', async () => {
    const failingFn = async () => {
      throw new Error('Test error');
    };

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(failingFn);
      } catch {
        // Expected
      }
    }

    expect(breaker.getState()).toBe('open');

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Next call should enter half-open
    try {
      await breaker.execute(failingFn);
    } catch {
      // Expected
    }

    // State should be half-open or open again
    const state = breaker.getState();
    expect(['half-open', 'open']).toContain(state);
  });

  it('should close circuit after success threshold in half-open', async () => {
    breaker = new CircuitBreaker({
      name: 'test-service',
      failureThreshold: 3,
      timeout: 100, // Short timeout for testing
      successThreshold: 2,
    });

    const failingFn = async () => {
      throw new Error('Test error');
    };

    const successFn = async () => 'success';

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(failingFn);
      } catch {
        // Expected
      }
    }

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 150));

    // Succeed twice to close circuit
    await breaker.execute(successFn);
    await breaker.execute(successFn);

    expect(breaker.getState()).toBe('closed');
  });

  it('should reset manually', () => {
    breaker.reset();
    expect(breaker.getState()).toBe('closed');
    const metrics = breaker.getMetrics();
    expect(metrics.failures).toBe(0);
    expect(metrics.successes).toBe(0);
  });

  it('should track metrics', async () => {
    await breaker.execute(async () => 'success');
    
    try {
      await breaker.execute(async () => {
        throw new Error('Test error');
      });
    } catch {
      // Expected
    }

    const metrics = breaker.getMetrics();
    expect(metrics.totalRequests).toBe(2);
    expect(metrics.totalSuccesses).toBe(1);
    expect(metrics.totalFailures).toBe(1);
  });
});

describe('circuitBreakerRegistry', () => {
  let registry: typeof circuitBreakerRegistry;

  beforeEach(() => {
    registry = circuitBreakerRegistry;
  });

  it('should create circuit breaker on get', () => {
    const breaker = registry.get('test-service');
    expect(breaker).toBeDefined();
    expect(breaker.getState()).toBe('closed');
  });

  it('should return same instance for same name', () => {
    const breaker1 = registry.get('test-service');
    const breaker2 = registry.get('test-service');
    expect(breaker1).toBe(breaker2);
  });

  it('should reset all breakers', () => {
    const breaker1 = registry.get('service1');
    const breaker2 = registry.get('service2');
    
    registry.resetAll();
    
    expect(breaker1.getState()).toBe('closed');
    expect(breaker2.getState()).toBe('closed');
  });

  it('should get all metrics', () => {
    registry.get('service1');
    registry.get('service2');
    
    const metrics = registry.getAllMetrics();
    expect(Object.keys(metrics)).toContain('service1');
    expect(Object.keys(metrics)).toContain('service2');
  });
});

describe('withCircuitBreaker helper', () => {
  it('should execute function with circuit breaker', async () => {
    const result = await withCircuitBreaker(
      'test-service',
      async () => 'success'
    );
    expect(result).toBe('success');
  });

  it('should use fallback when provided', async () => {
    const result = await withCircuitBreaker(
      'test-service',
      async () => {
        throw new Error('Test error');
      },
      async () => 'fallback'
    );
    expect(result).toBe('fallback');
  });
});
