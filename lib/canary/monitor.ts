/**
 * Canary Deployment Monitor
 * Tracks error rates and latency for canary deployments
 * Triggers automatic rollback on threshold breach
 */

import { cacheService } from '@/lib/performance/cache';

export interface CanaryMetrics {
  errorCount: number;
  requestCount: number;
  latencies: number[];
  windowStart: number;
}

export interface CanaryConfig {
  errorRateThreshold: number; // 0.05 = 5%
  latencyThreshold: number; // milliseconds (p95)
  windowMs: number; // 5 minutes = 300000
}

const DEFAULT_CONFIG: CanaryConfig = {
  errorRateThreshold: 0.05, // 5%
  latencyThreshold: 1000, // 1 second
  windowMs: 5 * 60 * 1000, // 5 minutes
};

export class CanaryMonitor {
  private metrics: Map<string, CanaryMetrics> = new Map();
  private config: CanaryConfig;

  constructor(config: Partial<CanaryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Record a request (success or failure)
   */
  async recordRequest(
    canaryId: string,
    success: boolean,
    latency?: number
  ): Promise<void> {
    const now = Date.now();
    let metrics = this.metrics.get(canaryId);

    if (!metrics || now - metrics.windowStart > this.config.windowMs) {
      // New window
      metrics = {
        errorCount: 0,
        requestCount: 0,
        latencies: [],
        windowStart: now,
      };
      this.metrics.set(canaryId, metrics);
    }

    metrics.requestCount++;
    if (!success) {
      metrics.errorCount++;
    }

    if (latency !== undefined) {
      metrics.latencies.push(latency);
      // Keep only last 1000 latencies to avoid memory issues
      if (metrics.latencies.length > 1000) {
        metrics.latencies.shift();
      }
    }

    // Check thresholds
    await this.checkThresholds(canaryId, metrics);
  }

  /**
   * Check if thresholds are exceeded
   */
  private async checkThresholds(
    canaryId: string,
    metrics: CanaryMetrics
  ): Promise<void> {
    // Check error rate
    if (metrics.requestCount > 0) {
      const errorRate = metrics.errorCount / metrics.requestCount;
      if (errorRate > this.config.errorRateThreshold) {
        await this.triggerRollback(canaryId, 'error_rate_exceeded', {
          errorRate,
          threshold: this.config.errorRateThreshold,
        });
        return;
      }
    }

    // Check latency (p95)
    if (metrics.latencies.length > 0) {
      const sorted = [...metrics.latencies].sort((a, b) => a - b);
      const p95Index = Math.floor(sorted.length * 0.95);
      const p95 = sorted[p95Index];

      if (p95 > this.config.latencyThreshold) {
        await this.triggerRollback(canaryId, 'latency_exceeded', {
          p95,
          threshold: this.config.latencyThreshold,
        });
        return;
      }
    }
  }

  /**
   * Trigger rollback
   */
  private async triggerRollback(
    canaryId: string,
    reason: string,
    details: Record<string, unknown>
  ): Promise<void> {
    console.error(`🚨 Canary rollback triggered: ${canaryId}`, { reason, details });

    // Disable canary flag (update environment variable or feature flag)
    // This would typically call your feature flag service or update Vercel env vars
    await this.disableCanary(canaryId);

    // Log rollback event
    await this.logRollbackEvent(canaryId, reason, details);

    // Notify team (implement notification service)
    await this.notifyTeam(canaryId, reason, details);
  }

  /**
   * Disable canary deployment
   */
  private async disableCanary(canaryId: string): Promise<void> {
    // Update feature flag or environment variable
    // Example: Update Vercel env var via API
    const flagName = `CANARY_${canaryId.toUpperCase()}_ENABLED`;
    
    // Store in cache as fallback (if env var update fails)
    await cacheService.set(`canary:${canaryId}:enabled`, false, { ttl: 3600 });
    
    console.log(`Canary ${canaryId} disabled via ${flagName}`);
    
    // TODO: Implement actual flag update via:
    // - Vercel API: vercel env rm ${flagName} production
    // - Feature flag service API
    // - Database update
  }

  /**
   * Log rollback event
   */
  private async logRollbackEvent(
    canaryId: string,
    reason: string,
    details: Record<string, unknown>
  ): Promise<void> {
    const event = {
      type: 'canary_rollback',
      canaryId,
      reason,
      details,
      timestamp: new Date().toISOString(),
    };

    // Log to audit log or telemetry
    console.log('Rollback event:', event);
    
    // TODO: Send to telemetry/audit service
    // await telemetry.track('canary_rollback', event);
  }

  /**
   * Notify team of rollback
   */
  private async notifyTeam(
    canaryId: string,
    reason: string,
    details: Record<string, unknown>
  ): Promise<void> {
    // TODO: Implement notification via:
    // - Slack webhook
    // - Email
    // - PagerDuty
    // - Teams webhook
    
    console.log(`Team notification: Canary ${canaryId} rolled back - ${reason}`);
  }

  /**
   * Get current metrics for a canary
   */
  getMetrics(canaryId: string): CanaryMetrics | undefined {
    return this.metrics.get(canaryId);
  }

  /**
   * Get error rate for a canary
   */
  getErrorRate(canaryId: string): number {
    const metrics = this.metrics.get(canaryId);
    if (!metrics || metrics.requestCount === 0) {
      return 0;
    }
    return metrics.errorCount / metrics.requestCount;
  }

  /**
   * Get p95 latency for a canary
   */
  getP95Latency(canaryId: string): number | null {
    const metrics = this.metrics.get(canaryId);
    if (!metrics || metrics.latencies.length === 0) {
      return null;
    }
    const sorted = [...metrics.latencies].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    return sorted[p95Index];
  }

  /**
   * Reset metrics for a canary
   */
  reset(canaryId: string): void {
    this.metrics.delete(canaryId);
  }

  /**
   * Cleanup old metrics (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [canaryId, metrics] of this.metrics.entries()) {
      if (now - metrics.windowStart > this.config.windowMs * 2) {
        // Window expired, remove
        this.metrics.delete(canaryId);
      }
    }
  }
}

// Singleton instance
export const canaryMonitor = new CanaryMonitor();

// Cleanup old metrics every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    canaryMonitor.cleanup();
  }, 60000);
}
