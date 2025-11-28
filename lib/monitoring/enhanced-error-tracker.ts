/**
 * Enhanced Error Tracking
 * Comprehensive error tracking with context, grouping, and analytics
 */

import { logger } from '@/lib/logging/structured-logger';
import { formatError } from '@/lib/errors';

export interface ErrorContext {
  userId?: string;
  tenantId?: string;
  requestId?: string;
  url?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: unknown;
}

export interface ErrorEvent {
  id: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    statusCode?: number;
  };
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fingerprint: string; // For grouping similar errors
}

class EnhancedErrorTracker {
  private errors: ErrorEvent[] = [];
  private maxErrors = 1000; // Keep last 1000 errors in memory

  /**
   * Track error with context
   */
  trackError(
    error: unknown,
    context: ErrorContext = {},
    severity: ErrorEvent['severity'] = 'medium'
  ): string {
    const errorId = this.generateErrorId();
    const formatted = formatError(error);
    
    const errorEvent: ErrorEvent = {
      id: errorId,
      timestamp: new Date().toISOString(),
      error: {
        name: formatted.code,
        message: formatted.message,
        stack: error instanceof Error ? error.stack : undefined,
        code: formatted.code,
        statusCode: formatted.statusCode,
      },
      context,
      severity,
      fingerprint: this.generateFingerprint(error, context),
    };

    // Add to in-memory store
    this.errors.push(errorEvent);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log error
    logger.error('Error tracked', error instanceof Error ? error : new Error(String(error)), {
      errorId,
      severity,
      context,
    });

    // Send to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(errorEvent).catch(() => {
        // Silent fail for error tracking
      });
    }

    return errorId;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate fingerprint for error grouping
   */
  private generateFingerprint(error: unknown, context: ErrorContext): string {
    const formatted = formatError(error);
    const key = `${formatted.code}:${context.url || 'unknown'}:${context.method || 'unknown'}`;
    return Buffer.from(key).toString('base64').substring(0, 16);
  }

  /**
   * Send error to external service (Sentry, etc.)
   */
  private async sendToExternalService(errorEvent: ErrorEvent): Promise<void> {
    // Send to telemetry endpoint
    try {
      await fetch('/api/telemetry/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'error',
          properties: errorEvent,
        }),
      });
    } catch {
      // Silent fail
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byCode: Record<string, number>;
    recentErrors: ErrorEvent[];
  } {
    const bySeverity: Record<string, number> = {};
    const byCode: Record<string, number> = {};
    
    for (const error of this.errors) {
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
      byCode[error.error.code || 'UNKNOWN'] = (byCode[error.error.code || 'UNKNOWN'] || 0) + 1;
    }

    return {
      total: this.errors.length,
      bySeverity,
      byCode,
      recentErrors: this.errors.slice(-10), // Last 10 errors
    };
  }

  /**
   * Get errors by fingerprint (grouped)
   */
  getErrorsByFingerprint(): Record<string, ErrorEvent[]> {
    const grouped: Record<string, ErrorEvent[]> = {};
    
    for (const error of this.errors) {
      if (!grouped[error.fingerprint]) {
        grouped[error.fingerprint] = [];
      }
      grouped[error.fingerprint].push(error);
    }

    return grouped;
  }

  /**
   * Clear error history
   */
  clear(): void {
    this.errors = [];
  }
}

// Singleton instance
export const errorTracker = new EnhancedErrorTracker();

/**
 * Track error with context
 */
export function trackError(
  error: unknown,
  context: ErrorContext = {},
  severity: ErrorEvent['severity'] = 'medium'
): string {
  return errorTracker.trackError(error, context, severity);
}
