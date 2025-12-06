/**
 * Security Monitoring
 * 
 * Tracks security events, suspicious activity, and potential threats.
 */

import { logger } from "@/lib/utils/logger";
import { telemetry } from "@/lib/monitoring/enhanced-telemetry";

export interface SecurityEvent {
  type: "rate_limit" | "csrf_failure" | "suspicious_activity" | "injection_attempt" | "unauthorized_access";
  severity: "low" | "medium" | "high" | "critical";
  ip: string;
  path: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: number;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private readonly maxEvents = 1000;

  /**
   * Log security event
   */
  logEvent(event: Omit<SecurityEvent, "timestamp">): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.warn(`[SECURITY] ${event.type}:`, event);
    }

    // Send to telemetry
    try {
      telemetry.trackSecurityEvent(event.type, event.severity, {
        ip: event.ip,
        path: event.path,
        userAgent: event.userAgent,
        ...event.details,
      });
    } catch (e) {
      // Silently fail if telemetry unavailable
    }

    // Log to server logger
    logger.warn(`Security event: ${event.type}`, undefined, {
      severity: event.severity,
      ip: event.ip,
      path: event.path,
      ...event.details,
    });

    // Alert on critical events
    if (event.severity === "critical") {
      this.alertCritical(event);
    }
  }

  /**
   * Get recent security events
   */
  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: SecurityEvent["type"]): SecurityEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Get events by severity
   */
  getEventsBySeverity(severity: SecurityEvent["severity"]): SecurityEvent[] {
    return this.events.filter((e) => e.severity === severity);
  }

  /**
   * Check if IP has suspicious activity
   */
  isSuspiciousIP(ip: string, threshold: number = 5): boolean {
    const recentEvents = this.events.filter(
      (e) => e.ip === ip && Date.now() - e.timestamp < 60 * 60 * 1000 // Last hour
    );
    return recentEvents.length >= threshold;
  }

  /**
   * Alert on critical security events
   */
  private alertCritical(event: SecurityEvent): void {
    // In production, this would:
    // - Send email/SMS alert
    // - Create incident in monitoring system
    // - Notify security team
    // - Log to external security monitoring service

    if (process.env.NODE_ENV === "production") {
      // TODO: Integrate with alerting system
      console.error("[CRITICAL SECURITY ALERT]", event);
    }
  }

  /**
   * Get security statistics
   */
  getStats(): {
    totalEvents: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recentCritical: number;
  } {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let recentCritical = 0;

    this.events.forEach((event) => {
      byType[event.type] = (byType[event.type] || 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;

      if (
        event.severity === "critical" &&
        Date.now() - event.timestamp < 24 * 60 * 60 * 1000
      ) {
        recentCritical++;
      }
    });

    return {
      totalEvents: this.events.length,
      byType,
      bySeverity,
      recentCritical,
    };
  }
}

export const securityMonitor = new SecurityMonitor();
