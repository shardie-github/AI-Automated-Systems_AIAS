/**
 * Error Alerting System
 * Detects error spikes and sends alerts
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export interface ErrorAlert {
  type: "error_spike" | "integration_failure" | "performance_degradation" | "usage_limit";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  details: Record<string, unknown>;
  timestamp: string;
}

/**
 * Check for error spikes in the last hour
 */
export async function checkErrorSpikes(): Promise<ErrorAlert[]> {
  const alerts: ErrorAlert[] = [];
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  try {
    // Get error count in last hour
    const { data: errors, error } = await supabase
      .from("app_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "error")
      .gte("created_at", oneHourAgo.toISOString());

    if (error) {
      logger.error("Failed to check error spikes", error instanceof Error ? error : new Error(String(error)));
      return alerts;
    }

    const errorCount = errors || 0;
    const threshold = 100; // Alert if more than 100 errors in an hour

    if (errorCount > threshold) {
      alerts.push({
        type: "error_spike",
        severity: errorCount > 500 ? "critical" : errorCount > 200 ? "high" : "medium",
        message: `Error spike detected: ${errorCount} errors in the last hour`,
        details: {
          errorCount,
          threshold,
          timeWindow: "1 hour",
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error("Error checking error spikes", error instanceof Error ? error : new Error(String(error)));
  }

  return alerts;
}

/**
 * Check for integration failures
 */
export async function checkIntegrationFailures(): Promise<ErrorAlert[]> {
  const alerts: ErrorAlert[] = [];
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  try {
    // Check for integration-related errors
    const { data: integrationErrors, error } = await supabase
      .from("app_events")
      .select("meta")
      .eq("event_type", "error")
      .gte("created_at", oneHourAgo.toISOString())
      .like("meta->>integration", "%");

    if (error) {
      logger.error("Failed to check integration failures", error instanceof Error ? error : new Error(String(error)));
      return alerts;
    }

    // Group by integration
    const integrationCounts: Record<string, number> = {};
    integrationErrors?.forEach((event) => {
      const integration = (event.meta as Record<string, unknown>)?.integration as string;
      if (integration) {
        integrationCounts[integration] = (integrationCounts[integration] || 0) + 1;
      }
    });

    // Alert if any integration has >10 errors
    for (const [integration, count] of Object.entries(integrationCounts)) {
      if (count > 10) {
        alerts.push({
          type: "integration_failure",
          severity: count > 50 ? "critical" : count > 20 ? "high" : "medium",
          message: `Integration failure detected: ${integration} has ${count} errors in the last hour`,
          details: {
            integration,
            errorCount: count,
            timeWindow: "1 hour",
          },
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    logger.error("Error checking integration failures", error instanceof Error ? error : new Error(String(error)));
  }

  return alerts;
}

/**
 * Send alert via email (placeholder - implement with your email service)
 */
export async function sendAlert(alert: ErrorAlert): Promise<void> {
  try {
    // Log alert
    logger.warn("Alert triggered", {
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      details: alert.details,
    });

    // In production, send email/Slack notification
    // For now, just log
    if (alert.severity === "critical" || alert.severity === "high") {
      // TODO: Send email to admin
      // TODO: Send Slack notification
      logger.error("CRITICAL ALERT", new Error(alert.message), alert.details);
    }
  } catch (error) {
    logger.error("Failed to send alert", error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Run all error checks and send alerts
 */
export async function runErrorChecks(): Promise<void> {
  const alerts: ErrorAlert[] = [];

  // Check for error spikes
  const errorSpikes = await checkErrorSpikes();
  alerts.push(...errorSpikes);

  // Check for integration failures
  const integrationFailures = await checkIntegrationFailures();
  alerts.push(...integrationFailures);

  // Send all alerts
  for (const alert of alerts) {
    await sendAlert(alert);
  }

  if (alerts.length > 0) {
    logger.info("Error checks completed", {
      alertCount: alerts.length,
      alerts: alerts.map((a) => ({ type: a.type, severity: a.severity })),
    });
  }
}
