#!/usr/bin/env tsx
/**
 * Enhanced Smoke Test Suite
 * Comprehensive critical path testing with additional scenarios
 */

import { SmokeTestRunner } from './smoke-test';

class EnhancedSmokeTestRunner extends SmokeTestRunner {
  /**
   * Test circuit breaker functionality
   */
  private async testCircuitBreaker(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/circuit-breaker/metrics`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test'}`,
      },
    });
    
    if (response.status === 401) {
      // Expected if not authenticated - that's okay for smoke test
      return;
    }
    
    if (!response.ok) {
      throw new Error(`Circuit breaker endpoint failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.circuitBreakers) {
      throw new Error('Circuit breaker metrics missing');
    }
  }

  /**
   * Test cache analytics
   */
  private async testCacheAnalytics(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/cache/analytics`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test'}`,
      },
    });
    
    if (response.status === 401) {
      // Expected if not authenticated
      return;
    }
    
    if (!response.ok) {
      throw new Error(`Cache analytics endpoint failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.cache) {
      throw new Error('Cache analytics data missing');
    }
  }

  /**
   * Test monitoring dashboard
   */
  private async testMonitoringDashboard(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/monitoring/dashboard`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test'}`,
      },
    });
    
    if (response.status === 401) {
      // Expected if not authenticated
      return;
    }
    
    if (!response.ok) {
      throw new Error(`Monitoring dashboard endpoint failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.system) {
      throw new Error('Monitoring dashboard data missing');
    }
  }

  /**
   * Test OpenAPI documentation
   */
  private async testOpenAPI(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/openapi`);
    
    if (!response.ok) {
      throw new Error(`OpenAPI endpoint failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.openapi || !data.paths) {
      throw new Error('OpenAPI specification invalid');
    }
  }

  /**
   * Run enhanced tests
   */
  async runEnhanced(): Promise<void> {
    // Run base tests
    await this.run();
    
    // Run enhanced tests
    await this.runTest('Circuit Breaker Metrics', () => this.testCircuitBreaker());
    await this.runTest('Cache Analytics', () => this.testCacheAnalytics());
    await this.runTest('Monitoring Dashboard', () => this.testMonitoringDashboard());
    await this.runTest('OpenAPI Documentation', () => this.testOpenAPI());
  }
}

// Run enhanced tests if executed directly
if (require.main === module) {
  const runner = new EnhancedSmokeTestRunner();
  runner.runEnhanced().catch((error) => {
    console.error('Enhanced smoke tests failed:', error);
    process.exit(1);
  });
}

export { EnhancedSmokeTestRunner };
