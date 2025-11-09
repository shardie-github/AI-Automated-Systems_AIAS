/**
 * Enhanced Telemetry and Instrumentation
 * Provides comprehensive monitoring, analytics, and user engagement tracking
 */

export interface TelemetryEvent {
  name: string;
  category: 'user' | 'performance' | 'error' | 'business' | 'security';
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  tags?: Record<string, string>;
}

export interface UserEngagement {
  sessionId: string;
  userId?: string;
  pageViews: number;
  interactions: number;
  timeOnSite: number;
  events: TelemetryEvent[];
  conversionFunnel?: string[];
}

export class EnhancedTelemetry {
  private events: TelemetryEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private engagement: Map<string, UserEngagement> = new Map();

  /**
   * Track user event
   */
  track(event: Omit<TelemetryEvent, 'timestamp'>): void {
    const fullEvent: TelemetryEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);
    this.updateEngagement(fullEvent);
    this.sendToBackend(fullEvent);
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: PerformanceMetric): void {
    this.performanceMetrics.push(metric);
    this.sendToBackend({ name: 'performance', category: 'performance', properties: metric, timestamp: Date.now() });
  }

  /**
   * Track page view
   */
  trackPageView(path: string, properties?: Record<string, any>): void {
    this.track({
      name: 'page_view',
      category: 'user',
      properties: {
        path,
        ...properties,
      },
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(element: string, action: string, properties?: Record<string, any>): void {
    this.track({
      name: 'interaction',
      category: 'user',
      properties: {
        element,
        action,
        ...properties,
      },
    });
  }

  /**
   * Track conversion event
   */
  trackConversion(funnel: string, step: string, properties?: Record<string, any>): void {
    this.track({
      name: 'conversion',
      category: 'business',
      properties: {
        funnel,
        step,
        ...properties,
      },
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track({
      name: 'error',
      category: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        ...context,
      },
    });
  }

  /**
   * Track security event
   */
  trackSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', details?: Record<string, any>): void {
    this.track({
      name: 'security_event',
      category: 'security',
      properties: {
        event,
        severity,
        ...details,
      },
    });
  }

  /**
   * Get user engagement metrics
   */
  getEngagement(sessionId: string): UserEngagement | undefined {
    return this.engagement.get(sessionId);
  }

  /**
   * Get all performance metrics
   */
  getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  private updateEngagement(event: TelemetryEvent): void {
    const sessionId = event.sessionId || 'anonymous';
    let engagement = this.engagement.get(sessionId);

    if (!engagement) {
      engagement = {
        sessionId,
        userId: event.userId,
        pageViews: 0,
        interactions: 0,
        timeOnSite: 0,
        events: [],
      };
      this.engagement.set(sessionId, engagement);
    }

    engagement.events.push(event);

    if (event.name === 'page_view') {
      engagement.pageViews++;
    }

    if (event.name === 'interaction') {
      engagement.interactions++;
    }

    if (event.category === 'business' && event.name === 'conversion') {
      const funnel = event.properties?.funnel as string;
      const step = event.properties?.step as string;
      if (funnel && step) {
        if (!engagement.conversionFunnel) {
          engagement.conversionFunnel = [];
        }
        engagement.conversionFunnel.push(`${funnel}:${step}`);
      }
    }
  }

  private async sendToBackend(event: TelemetryEvent): Promise<void> {
    // Send to backend API
    try {
      await fetch('/api/telemetry/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send telemetry:', error);
    }
  }
}

// Singleton instance
export const telemetry = new EnhancedTelemetry();

/**
 * React hook for telemetry
 */
export function useTelemetry() {
  return {
    track: telemetry.track.bind(telemetry),
    trackPageView: telemetry.trackPageView.bind(telemetry),
    trackInteraction: telemetry.trackInteraction.bind(telemetry),
    trackConversion: telemetry.trackConversion.bind(telemetry),
    trackError: telemetry.trackError.bind(telemetry),
    trackPerformance: telemetry.trackPerformance.bind(telemetry),
  };
}
