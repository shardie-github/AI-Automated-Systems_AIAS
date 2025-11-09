/**
 * Automated Error Detection and Alerting
 * Monitors errors and sends alerts when thresholds are exceeded
 */

import { SystemError, formatError } from '@/src/lib/errors';

export interface ErrorAlert {
  id: string;
  timestamp: Date;
  error: Error;
  context: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
}

export interface ErrorDetectionConfig {
  errorThreshold?: number; // Errors per minute
  alertThreshold?: number; // Alerts per hour
  severityThresholds?: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

const DEFAULT_CONFIG: Required<ErrorDetectionConfig> = {
  errorThreshold: 10,
  alertThreshold: 5,
  severityThresholds: {
    low: 1,
    medium: 5,
    high: 10,
    critical: 50,
  },
};

class ErrorDetector {
  private errors: Array<{ timestamp: Date; error: Error; context: Record<string, unknown> }> = [];
  private alerts: ErrorAlert[] = [];
  private config: Required<ErrorDetectionConfig>;

  constructor(config: ErrorDetectionConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Record an error
   */
  recordError(error: Error, context: Record<string, unknown> = {}): void {
    const timestamp = new Date();
    this.errors.push({ timestamp, error, context });

    // Clean old errors (older than 1 hour)
    const oneHourAgo = new Date(timestamp.getTime() - 60 * 60 * 1000);
    this.errors = this.errors.filter(e => e.timestamp > oneHourAgo);

    // Check if alert should be triggered
    this.checkThresholds(error, context);
  }

  /**
   * Check if error thresholds are exceeded
   */
  private checkThresholds(error: Error, context: Record<string, unknown>): void {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Count errors in last minute
    const recentErrors = this.errors.filter(e => e.timestamp > oneMinuteAgo);
    const errorCount = recentErrors.length;

    // Determine severity
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (errorCount >= this.config.severityThresholds.critical) {
      severity = 'critical';
    } else if (errorCount >= this.config.severityThresholds.high) {
      severity = 'high';
    } else if (errorCount >= this.config.severityThresholds.medium) {
      severity = 'medium';
    }

    // Check if threshold exceeded
    if (errorCount >= this.config.errorThreshold) {
      this.createAlert(error, context, severity, errorCount);
    }
  }

  /**
   * Create an alert
   */
  private createAlert(
    error: Error,
    context: Record<string, unknown>,
    severity: 'low' | 'medium' | 'high' | 'critical',
    count: number
  ): void {
    const alert: ErrorAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      error,
      context,
      severity,
      count,
    };

    this.alerts.push(alert);

    // Clean old alerts (older than 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(a => a.timestamp > oneDayAgo);

    // Send alert (implement notification logic here)
    this.sendAlert(alert);
  }

  /**
   * Send alert notification
   */
  private sendAlert(alert: ErrorAlert): void {
    // Only send if alert threshold not exceeded
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAlerts = this.alerts.filter(a => a.timestamp > oneHourAgo);

    if (recentAlerts.length > this.config.alertThreshold) {
      console.warn('Alert threshold exceeded, suppressing alerts');
      return;
    }

    // Log alert (in production, send to monitoring service)
    console.error('Error Alert:', {
      id: alert.id,
      severity: alert.severity,
      error: formatError(alert.error),
      context: alert.context,
      count: alert.count,
    });

    // TODO: Integrate with monitoring service (e.g., Sentry, Datadog)
    // monitoringService.sendAlert(alert);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(minutes: number = 5): Array<{ timestamp: Date; error: Error; context: Record<string, unknown> }> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.errors.filter(e => e.timestamp > cutoff);
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(hours: number = 1): ErrorAlert[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.alerts.filter(a => a.timestamp > cutoff);
  }

  /**
   * Reset error tracking
   */
  reset(): void {
    this.errors = [];
    this.alerts = [];
  }
}

// Singleton instance
export const errorDetector = new ErrorDetector();

/**
 * Record error with automatic detection
 */
export function recordError(error: Error, context: Record<string, unknown> = {}): void {
  errorDetector.recordError(error, context);
}
