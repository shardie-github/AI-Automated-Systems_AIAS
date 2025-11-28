/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by stopping requests to failing services
 * 
 * Features:
 * - Configurable failure thresholds
 * - Automatic recovery attempts
 * - Half-open state for testing recovery
 * - Comprehensive metrics and logging
 */

import { logger } from '@/lib/logging/structured-logger';

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  /**
   * Number of failures before opening circuit
   * @default 5
   */
  failureThreshold?: number;
  
  /**
   * Time in milliseconds before attempting recovery
   * @default 60000 (1 minute)
   */
  timeout?: number;
  
  /**
   * Number of successful calls in half-open state to close circuit
   * @default 2
   */
  successThreshold?: number;
  
  /**
   * Time window in milliseconds for counting failures
   * @default 60000 (1 minute)
   */
  resetTimeout?: number;
  
  /**
   * Service name for logging
   */
  name: string;
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;
  private nextAttemptTime: number = 0;
  
  private readonly config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      timeout: config.timeout ?? 60000,
      successThreshold: config.successThreshold ?? 2,
      resetTimeout: config.resetTimeout ?? 60000,
      name: config.name,
    };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    this.totalRequests++;

    // Check if circuit should be opened
    if (this.state === 'open') {
      if (Date.now() < this.nextAttemptTime) {
        logger.warn('Circuit breaker is open, using fallback', {
          service: this.config.name,
          nextAttemptTime: new Date(this.nextAttemptTime).toISOString(),
        });
        
        if (fallback) {
          return await fallback();
        }
        
        throw new Error(`Circuit breaker is open for ${this.config.name}`);
      }
      
      // Attempt recovery - move to half-open
      this.state = 'half-open';
      this.successes = 0;
      logger.info('Circuit breaker entering half-open state', {
        service: this.config.name,
      });
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      
      if (fallback) {
        logger.warn('Request failed, using fallback', {
          service: this.config.name,
          error: error instanceof Error ? error.message : String(error),
        });
        return await fallback();
      }
      
      throw error;
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.totalSuccesses++;
    this.lastSuccessTime = Date.now();
    
    if (this.state === 'half-open') {
      this.successes++;
      
      if (this.successes >= this.config.successThreshold) {
        // Circuit recovered - close it
        this.state = 'closed';
        this.failures = 0;
        this.successes = 0;
        logger.info('Circuit breaker closed - service recovered', {
          service: this.config.name,
        });
      }
    } else {
      // Reset failure count on success in closed state
      this.failures = 0;
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(): void {
    this.totalFailures++;
    this.lastFailureTime = Date.now();
    this.failures++;
    
    // Check if we should open the circuit
    if (this.state === 'closed' && this.failures >= this.config.failureThreshold) {
      this.state = 'open';
      this.nextAttemptTime = Date.now() + this.config.timeout;
      const errorObj = new Error('Circuit breaker opened - service failing');
      logger.error('Circuit breaker opened - service failing', errorObj, {
        service: this.config.name,
        failures: this.failures,
        nextAttemptTime: new Date(this.nextAttemptTime).toISOString(),
      });
    } else if (this.state === 'half-open') {
      // Failed in half-open state - open circuit again
      this.state = 'open';
      this.nextAttemptTime = Date.now() + this.config.timeout;
      this.successes = 0;
      logger.warn('Circuit breaker reopened - recovery failed', {
        service: this.config.name,
      });
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    };
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.nextAttemptTime = 0;
    logger.info('Circuit breaker manually reset', {
      service: this.config.name,
    });
  }

  /**
   * Check if circuit is open
   */
  isOpen(): boolean {
    if (this.state === 'open' && Date.now() >= this.nextAttemptTime) {
      // Time to attempt recovery
      this.state = 'half-open';
      this.successes = 0;
      return false;
    }
    return this.state === 'open';
  }
}

/**
 * Circuit breaker registry for managing multiple breakers
 */
class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create circuit breaker for service
   */
  get(name: string, config?: Omit<CircuitBreakerConfig, 'name'>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(
        name,
        new CircuitBreaker({ ...config, name })
      );
    }
    return this.breakers.get(name)!;
  }

  /**
   * Get all circuit breakers
   */
  getAll(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Get metrics for all circuit breakers
   */
  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    for (const [name, breaker] of this.breakers.entries()) {
      metrics[name] = breaker.getMetrics();
    }
    return metrics;
  }
}

// Singleton instance
export const circuitBreakerRegistry = new CircuitBreakerRegistry();

/**
 * Create circuit breaker wrapper for external service calls
 */
export function withCircuitBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>,
  fallback?: () => Promise<T>,
  config?: Omit<CircuitBreakerConfig, 'name'>
): Promise<T> {
  const breaker = circuitBreakerRegistry.get(serviceName, config);
  return breaker.execute(fn, fallback);
}
