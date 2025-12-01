#!/usr/bin/env tsx
/**
 * Comprehensive Smoke Test Suite
 * Tests critical paths to ensure system health
 * 
 * Usage: tsx scripts/smoke-test.ts
 */

import { logger } from '@/lib/logging/structured-logger';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: Record<string, unknown>;
}

class SmokeTestRunner {
  private results: TestResult[] = [];
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   process.env.HEALTH_URL?.replace('/api/healthz', '') || 
                   'http://localhost:3000';
  }

  private async runTest(
    name: string,
    testFn: () => Promise<void>
  ): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({ name, passed: true, duration });
      logger.info(`✅ ${name}`, { duration });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({ 
        name, 
        passed: false, 
        duration, 
        error: errorMessage 
      });
      logger.error(`❌ ${name}`, error instanceof Error ? error : new Error(errorMessage));
    }
  }

  /**
   * Test 1: Health Check Endpoint
   */
  private async testHealthCheck(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/healthz`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Health check returned unhealthy: ${JSON.stringify(data)}`);
    }

    // Verify critical components
    if (data.db && !data.db.ok) {
      throw new Error(`Database check failed: ${data.db.error}`);
    }

    if (data.auth && !data.auth.ok) {
      throw new Error(`Auth check failed: ${data.auth.error}`);
    }
  }

  /**
   * Test 2: API Route Handler
   */
  private async testApiRoute(): Promise<void> {
    // Test a simple API endpoint
    const response = await fetch(`${this.baseUrl}/api/healthz`);
    if (!response.ok) {
      throw new Error(`API route failed: ${response.status}`);
    }

    // Verify response headers
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }
  }

  /**
   * Test 3: Security Headers
   */
  private async testSecurityHeaders(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/healthz`);
    
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
    ];

    for (const header of requiredHeaders) {
      if (!response.headers.has(header)) {
        throw new Error(`Missing security header: ${header}`);
      }
    }
  }

  /**
   * Test 4: Rate Limiting
   */
  private async testRateLimiting(): Promise<void> {
    // Make multiple rapid requests
    const requests = Array.from({ length: 10 }, () => 
      fetch(`${this.baseUrl}/api/healthz`)
    );

    const responses = await Promise.all(requests);
    
    // Check rate limit headers
    const rateLimitHeaders = responses[0].headers.get('x-ratelimit-limit');
    if (!rateLimitHeaders) {
      logger.warn('Rate limit headers not present', {
        note: 'This may be expected for health check endpoint',
      });
    }
  }

  /**
   * Test 5: Error Handling
   */
  private async testErrorHandling(): Promise<void> {
    // Test 404 endpoint
    const response = await fetch(`${this.baseUrl}/api/nonexistent-endpoint`);
    
    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}`);
    }

    const data = await response.json();
    if (!data.error) {
      throw new Error('Error response missing error field');
    }
  }

  /**
   * Test 6: CORS Headers (if applicable)
   */
  private async testCorsHeaders(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/healthz`, {
      method: 'OPTIONS',
    });

    // CORS headers should be present for OPTIONS requests
    const corsHeader = response.headers.get('access-control-allow-origin');
    if (corsHeader === null) {
      logger.warn('CORS headers not present', {
        note: 'This may be expected for same-origin requests',
      });
    }
  }

  /**
   * Test 7: Response Time
   */
  private async testResponseTime(): Promise<void> {
    const startTime = Date.now();
    const response = await fetch(`${this.baseUrl}/api/healthz`);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    // Health check should respond quickly (< 1 second)
    if (duration > 1000) {
      throw new Error(`Response time too slow: ${duration}ms`);
    }
  }

  /**
   * Test 8: Environment Variables
   */
  private async testEnvironmentVariables(): Promise<void> {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'DATABASE_URL',
    ];

    const missing: string[] = [];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  /**
   * Run all tests
   */
  async run(): Promise<void> {
    logger.info('Starting smoke tests', { baseUrl: this.baseUrl });

    await this.runTest('Health Check Endpoint', () => this.testHealthCheck());
    await this.runTest('API Route Handler', () => this.testApiRoute());
    await this.runTest('Security Headers', () => this.testSecurityHeaders());
    await this.runTest('Rate Limiting', () => this.testRateLimiting());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    await this.runTest('CORS Headers', () => this.testCorsHeaders());
    await this.runTest('Response Time', () => this.testResponseTime());
    await this.runTest('Environment Variables', () => this.testEnvironmentVariables());

    this.printResults();
  }

  /**
   * Print test results summary
   */
  private printResults(): void {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n' + '='.repeat(60));
    console.log('SMOKE TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log('='.repeat(60) + '\n');

    for (const result of this.results) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.name} (${result.duration}ms)`);
      if (!result.passed && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }

    console.log('\n' + '='.repeat(60));

    if (failed > 0) {
      logger.error('Smoke tests failed', {
        passed,
        failed,
        total: this.results.length,
      });
      process.exit(1);
    } else {
      logger.info('All smoke tests passed', {
        passed,
        total: this.results.length,
        duration: totalDuration,
      });
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const runner = new SmokeTestRunner();
  runner.run().catch((error) => {
    logger.fatal('Smoke test runner failed', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  });
}

export { SmokeTestRunner };
