/**
 * Scalability Stress Test
 * Simulates 10x peak user load to validate system performance
 * 
 * Usage:
 *   pnpm tsx scripts/load-test/stress-test.ts --users 1000 --duration 300
 */

import { performance } from 'perf_hooks';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface LoadTestConfig {
  baseUrl: string;
  targetUsers: number; // Target concurrent users (10x peak load)
  duration: number; // Test duration in seconds
  rampUpTime: number; // Time to ramp up to target users (seconds)
  endpoints: Array<{
    path: string;
    method: 'GET' | 'POST';
    weight: number; // Relative weight for this endpoint
    body?: any;
  }>;
}

interface RequestMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number; // milliseconds
  timestamp: number;
  error?: string;
}

interface TestReport {
  config: LoadTestConfig;
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalDuration: number;
    averageResponseTime: number;
    p50: number; // 50th percentile latency
    p95: number; // 95th percentile latency
    p99: number; // 99th percentile latency
    requestsPerSecond: number;
    errorRate: number;
  };
  endpointStats: Record<string, {
    requests: number;
    success: number;
    failures: number;
    avgResponseTime: number;
    p50: number;
    p95: number;
    p99: number;
  }>;
  statusCodeDistribution: Record<number, number>;
  timeline: Array<{
    timestamp: number;
    activeUsers: number;
    requestsPerSecond: number;
    avgResponseTime: number;
    errorRate: number;
  }>;
  resourceConsumption?: {
    cpu?: number;
    memory?: number;
    network?: number;
  };
  costPerUser?: number;
  recommendations: string[];
}

class LoadTester {
  private config: LoadTestConfig;
  private metrics: RequestMetrics[] = [];
  private startTime: number = 0;
  private activeUsers: number = 0;
  private isRunning: boolean = false;

  constructor(config: LoadTestConfig) {
    this.config = config;
  }

  async run(): Promise<TestReport> {
    console.log('🚀 Starting load test...');
    console.log(`   Target users: ${this.config.targetUsers}`);
    console.log(`   Duration: ${this.config.duration}s`);
    console.log(`   Ramp up: ${this.config.rampUpTime}s`);
    console.log(`   Base URL: ${this.config.baseUrl}`);

    this.startTime = Date.now();
    this.isRunning = true;
    this.metrics = [];

    // Start user simulation
    const userPromises: Promise<void>[] = [];
    const rampUpInterval = (this.config.rampUpTime * 1000) / this.config.targetUsers;

    for (let i = 0; i < this.config.targetUsers; i++) {
      const delay = i * rampUpInterval;
      userPromises.push(
        new Promise((resolve) => {
          setTimeout(() => {
            this.simulateUser(i).finally(() => resolve());
          }, delay);
        })
      );
    }

    // Wait for test duration
    await new Promise((resolve) => setTimeout(resolve, this.config.duration * 1000));
    this.isRunning = false;

    // Wait for all requests to complete
    await Promise.all(userPromises);

    console.log('✅ Load test completed');
    return this.generateReport();
  }

  private async simulateUser(userId: number): Promise<void> {
    while (this.isRunning) {
      const endpoint = this.selectEndpoint();
      await this.makeRequest(endpoint.path, endpoint.method, endpoint.body);
      
      // Random delay between requests (100ms - 2s)
      await new Promise((resolve) => 
        setTimeout(resolve, 100 + Math.random() * 1900)
      );
    }
  }

  private selectEndpoint() {
    const totalWeight = this.config.endpoints.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const endpoint of this.config.endpoints) {
      random -= endpoint.weight;
      if (random <= 0) {
        return endpoint;
      }
    }
    
    return this.config.endpoints[0];
  }

  private async makeRequest(path: string, method: string, body?: any): Promise<void> {
    const startTime = performance.now();
    const timestamp = Date.now();
    
    try {
      const url = `${this.config.baseUrl}${path}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && method === 'POST') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const responseTime = performance.now() - startTime;

      this.metrics.push({
        endpoint: path,
        method,
        statusCode: response.status,
        responseTime,
        timestamp,
      });
    } catch (error) {
      const responseTime = performance.now() - startTime;
      this.metrics.push({
        endpoint: path,
        method,
        statusCode: 0,
        responseTime,
        timestamp,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private generateReport(): TestReport {
    const totalDuration = (Date.now() - this.startTime) / 1000;
    const successfulRequests = this.metrics.filter(m => m.statusCode >= 200 && m.statusCode < 300);
    const failedRequests = this.metrics.filter(m => m.statusCode < 200 || m.statusCode >= 300);
    
    const responseTimes = this.metrics.map(m => m.responseTime).sort((a, b) => a - b);
    const p50 = this.percentile(responseTimes, 50);
    const p95 = this.percentile(responseTimes, 95);
    const p99 = this.percentile(responseTimes, 99);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    // Endpoint statistics
    const endpointStats: Record<string, any> = {};
    for (const endpoint of this.config.endpoints) {
      const endpointMetrics = this.metrics.filter(m => m.endpoint === endpoint.path);
      const endpointResponseTimes = endpointMetrics.map(m => m.responseTime).sort((a, b) => a - b);
      
      endpointStats[endpoint.path] = {
        requests: endpointMetrics.length,
        success: endpointMetrics.filter(m => m.statusCode >= 200 && m.statusCode < 300).length,
        failures: endpointMetrics.filter(m => m.statusCode < 200 || m.statusCode >= 300).length,
        avgResponseTime: endpointResponseTimes.reduce((a, b) => a + b, 0) / endpointResponseTimes.length || 0,
        p50: this.percentile(endpointResponseTimes, 50),
        p95: this.percentile(endpointResponseTimes, 95),
        p99: this.percentile(endpointResponseTimes, 99),
      };
    }

    // Status code distribution
    const statusCodeDistribution: Record<number, number> = {};
    for (const metric of this.metrics) {
      statusCodeDistribution[metric.statusCode] = (statusCodeDistribution[metric.statusCode] || 0) + 1;
    }

    // Timeline (sample every 10 seconds)
    const timeline: any[] = [];
    const interval = 10000; // 10 seconds
    for (let t = this.startTime; t < Date.now(); t += interval) {
      const windowMetrics = this.metrics.filter(
        m => m.timestamp >= t && m.timestamp < t + interval
      );
      const windowResponseTimes = windowMetrics.map(m => m.responseTime);
      
      timeline.push({
        timestamp: t,
        activeUsers: this.config.targetUsers, // Simplified
        requestsPerSecond: windowMetrics.length / (interval / 1000),
        avgResponseTime: windowResponseTimes.reduce((a, b) => a + b, 0) / windowResponseTimes.length || 0,
        errorRate: windowMetrics.filter(m => m.statusCode < 200 || m.statusCode >= 300).length / windowMetrics.length || 0,
      });
    }

    // Calculate cost per user (simplified - would need actual infrastructure costs)
    const estimatedCostPerHour = 50; // Example: $50/hour for infrastructure
    const costPerUser = (estimatedCostPerHour / 3600) * (totalDuration / this.config.targetUsers);

    const recommendations: string[] = [];
    if (avgResponseTime > 1000) {
      recommendations.push('Average response time exceeds 1s - consider optimizing slow endpoints');
    }
    if (p95 > 2000) {
      recommendations.push('95th percentile latency exceeds 2s - investigate performance bottlenecks');
    }
    if (failedRequests.length / this.metrics.length > 0.01) {
      recommendations.push('Error rate exceeds 1% - investigate failures');
    }
    if (avgResponseTime < 200 && p95 < 500) {
      recommendations.push('Performance is excellent - system can handle higher load');
    }

    return {
      config: this.config,
      summary: {
        totalRequests: this.metrics.length,
        successfulRequests: successfulRequests.length,
        failedRequests: failedRequests.length,
        totalDuration,
        averageResponseTime: avgResponseTime,
        p50,
        p95,
        p99,
        requestsPerSecond: this.metrics.length / totalDuration,
        errorRate: failedRequests.length / this.metrics.length,
      },
      endpointStats,
      statusCodeDistribution,
      timeline,
      costPerUser,
      recommendations,
    };
  }

  private percentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }
}

// Default configuration
const defaultConfig: LoadTestConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  targetUsers: parseInt(process.env.TARGET_USERS || '1000'), // 10x peak load (assuming 100 peak users)
  duration: parseInt(process.env.DURATION || '300'), // 5 minutes
  rampUpTime: parseInt(process.env.RAMP_UP_TIME || '60'), // 1 minute ramp up
  endpoints: [
    { path: '/api/healthz', method: 'GET', weight: 10 },
    { path: '/api/workflows', method: 'GET', weight: 30 },
    { path: '/api/workflows/execute', method: 'POST', weight: 20, body: { workflowId: 'test' } },
    { path: '/api/analytics/track', method: 'POST', weight: 40, body: { event: 'test' } },
  ],
};

async function main() {
  const args = process.argv.slice(2);
  const config = { ...defaultConfig };

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    
    if (key === 'users') config.targetUsers = parseInt(value || '1000');
    if (key === 'duration') config.duration = parseInt(value || '300');
    if (key === 'ramp-up') config.rampUpTime = parseInt(value || '60');
    if (key === 'base-url') config.baseUrl = value || 'http://localhost:3000';
  }

  const tester = new LoadTester(config);
  const report = await tester.run();

  // Save report
  const reportPath = join(process.cwd(), 'reports', `load-test-${Date.now()}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📊 Report saved to: ${reportPath}`);

  // Print summary
  console.log('\n📈 Test Summary:');
  console.log(`   Total Requests: ${report.summary.totalRequests}`);
  console.log(`   Successful: ${report.summary.successfulRequests}`);
  console.log(`   Failed: ${report.summary.failedRequests}`);
  console.log(`   Error Rate: ${(report.summary.errorRate * 100).toFixed(2)}%`);
  console.log(`   Avg Response Time: ${report.summary.averageResponseTime.toFixed(2)}ms`);
  console.log(`   P50: ${report.summary.p50.toFixed(2)}ms`);
  console.log(`   P95: ${report.summary.p95.toFixed(2)}ms`);
  console.log(`   P99: ${report.summary.p99.toFixed(2)}ms`);
  console.log(`   Requests/sec: ${report.summary.requestsPerSecond.toFixed(2)}`);
  if (report.costPerUser) {
    console.log(`   Estimated Cost/User: $${report.costPerUser.toFixed(6)}`);
  }

  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`   - ${rec}`));
  }

  // Exit with error if test failed
  if (report.summary.errorRate > 0.05) {
    console.log('\n❌ Test failed: Error rate exceeds 5%');
    process.exit(1);
  }

  if (report.summary.p95 > 3000) {
    console.log('\n⚠️  Warning: 95th percentile latency exceeds 3s');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { LoadTester, LoadTestConfig, TestReport };
