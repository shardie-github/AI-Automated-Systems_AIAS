#!/usr/bin/env tsx
/**
 * Performance Benchmarking Script
 * Measures and reports performance metrics for critical paths
 */

import { logger } from '@/lib/logging/structured-logger';

interface BenchmarkResult {
  name: string;
  duration: number;
  success: boolean;
  error?: string;
}

class PerformanceBenchmark {
  private baseUrl: string;
  private results: BenchmarkResult[] = [];

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   process.env.HEALTH_URL?.replace('/api/healthz', '') || 
                   'http://localhost:3000';
  }

  private async benchmark(
    name: string,
    fn: () => Promise<void>
  ): Promise<void> {
    const startTime = Date.now();
    try {
      await fn();
      const duration = Date.now() - startTime;
      this.results.push({ name, duration, success: true });
      logger.info(`✅ ${name}`, { duration: `${duration}ms` });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({ name, duration, success: false, error: errorMessage });
      logger.error(`❌ ${name}`, error instanceof Error ? error : new Error(errorMessage));
    }
  }

  /**
   * Benchmark health check endpoint
   */
  private async benchmarkHealthCheck(): Promise<void> {
    const startTime = Date.now();
    const response = await fetch(`${this.baseUrl}/api/healthz`);
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    // Health check should be fast (< 500ms)
    if (duration > 500) {
      logger.warn('Health check is slow', { duration });
    }
  }

  /**
   * Benchmark cache operations
   */
  private async benchmarkCache(): Promise<void> {
    const { cacheService } = await import('@/lib/performance/cache');
    
    // Benchmark set operation
    const setStart = Date.now();
    await cacheService.set('benchmark-key', { test: 'data' }, { ttl: 60 });
    const setDuration = Date.now() - setStart;
    
    // Benchmark get operation
    const getStart = Date.now();
    await cacheService.get('benchmark-key');
    const getDuration = Date.now() - getStart;
    
    logger.info('Cache benchmark', {
      setDuration: `${setDuration}ms`,
      getDuration: `${getDuration}ms`,
    });
    
    // Cleanup
    await cacheService.clear();
  }

  /**
   * Benchmark rate limiting
   */
  private async benchmarkRateLimiting(): Promise<void> {
    const { rateLimiter } = await import('@/lib/performance/rate-limiter');
    
    const startTime = Date.now();
    await rateLimiter.checkRateLimit('/api/test', 'test-identifier', {
      windowMs: 60000,
      maxRequests: 100,
    });
    const duration = Date.now() - startTime;
    
    // Rate limiting should be fast (< 50ms)
    if (duration > 50) {
      logger.warn('Rate limiting is slow', { duration });
    }
  }

  /**
   * Run all benchmarks
   */
  async run(): Promise<void> {
    logger.info('Starting performance benchmarks', { baseUrl: this.baseUrl });

    await this.benchmark('Health Check Endpoint', () => this.benchmarkHealthCheck());
    await this.benchmark('Cache Operations', () => this.benchmarkCache());
    await this.benchmark('Rate Limiting', () => this.benchmarkRateLimiting());

    this.printResults();
  }

  /**
   * Print benchmark results
   */
  private printResults(): void {
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;

    console.log('\n' + '='.repeat(60));
    console.log('PERFORMANCE BENCHMARK RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Benchmarks: ${this.results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);
    console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);
    console.log('='.repeat(60) + '\n');

    for (const result of this.results) {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.name} (${result.duration}ms)`);
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }

    console.log('\n' + '='.repeat(60));

    // Performance thresholds
    const thresholds = {
      healthCheck: 500,
      cache: 10,
      rateLimiting: 50,
    };

    console.log('\nPerformance Thresholds:');
    for (const result of successful) {
      const threshold = thresholds[result.name.toLowerCase().replace(/\s+/g, '') as keyof typeof thresholds];
      if (threshold && result.duration > threshold) {
        console.log(`⚠️  ${result.name} exceeded threshold (${result.duration}ms > ${threshold}ms)`);
      }
    }
  }
}

// Run benchmarks if executed directly
if (require.main === module) {
  const benchmark = new PerformanceBenchmark();
  benchmark.run().catch((error) => {
    logger.fatal('Performance benchmark failed', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  });
}

export { PerformanceBenchmark };
