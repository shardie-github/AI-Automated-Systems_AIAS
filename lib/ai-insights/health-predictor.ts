/**
 * Predictive Health Monitor
 * Detects patterns that precede failures and generates early warnings
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export interface HealthSignal {
  type: "performance_degradation" | "error_spike" | "integration_issue" | "resource_exhaustion" | "anomaly";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  confidence: number; // 0-100
  predictedImpact: string;
  recommendedAction: string;
  detectedAt: Date;
}

/**
 * Detect performance degradation
 */
async function detectPerformanceDegradation(): Promise<HealthSignal[]> {
  const signals: HealthSignal[] = [];

  try {
    // Get recent API response times
    const { data: recentEvents } = await supabase
      .from("app_events")
      .select("meta, created_at")
      .eq("event_type", "api_request")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1000);

    if (!recentEvents || recentEvents.length < 10) {
      return signals;
    }

    // Calculate average response time
    const responseTimes: number[] = [];
    recentEvents.forEach((event) => {
      const duration = (event.meta as Record<string, unknown>)?.duration_ms as number;
      if (duration) {
        responseTimes.push(duration);
      }
    });

    if (responseTimes.length < 10) {
      return signals;
    }

    const avgResponseTime = responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length;
    const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];

    // Compare with historical baseline (simplified - would use actual historical data)
    const baseline = 500; // 500ms baseline
    const threshold = baseline * 1.5; // 50% degradation

    if (avgResponseTime > threshold || p95ResponseTime > threshold * 2) {
      signals.push({
        type: "performance_degradation",
        severity: avgResponseTime > threshold * 2 ? "high" : "medium",
        message: `API response time degradation detected: avg ${Math.round(avgResponseTime)}ms, p95 ${Math.round(p95ResponseTime)}ms`,
        confidence: 75,
        predictedImpact: "User experience degradation, potential timeout errors",
        recommendedAction: "Check database performance, review slow queries, consider scaling resources",
        detectedAt: new Date(),
      });
    }
  } catch (error) {
    logger.error("Failed to detect performance degradation", error instanceof Error ? error : new Error(String(error)));
  }

  return signals;
}

/**
 * Detect error spikes
 */
async function detectErrorSpikes(): Promise<HealthSignal[]> {
  const signals: HealthSignal[] = [];

  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Get error counts for last hour and previous hour
    const { count: recentErrors } = await supabase
      .from("app_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "error")
      .gte("created_at", oneHourAgo.toISOString());

    const { count: previousErrors } = await supabase
      .from("app_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "error")
      .gte("created_at", twoHoursAgo.toISOString())
      .lt("created_at", oneHourAgo.toISOString());

    const recentCount = recentErrors || 0;
    const previousCount = previousErrors || 0;

    // Detect spike (2x increase)
    if (previousCount > 0 && recentCount > previousCount * 2) {
      signals.push({
        type: "error_spike",
        severity: recentCount > 100 ? "critical" : recentCount > 50 ? "high" : "medium",
        message: `Error spike detected: ${recentCount} errors in last hour (vs ${previousCount} in previous hour)`,
        confidence: 85,
        predictedImpact: "Potential system instability, user experience degradation",
        recommendedAction: "Investigate error patterns, check system logs, verify integrations",
        detectedAt: new Date(),
      });
    }
  } catch (error) {
    logger.error("Failed to detect error spikes", error instanceof Error ? error : new Error(String(error)));
  }

  return signals;
}

/**
 * Detect integration issues
 */
async function detectIntegrationIssues(): Promise<HealthSignal[]> {
  const signals: HealthSignal[] = [];

  try {
    // Get integration errors in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const { data: integrationErrors } = await supabase
      .from("app_events")
      .select("meta")
      .eq("event_type", "error")
      .gte("created_at", oneHourAgo.toISOString());

    // Group by integration
    const integrationErrorCounts: Record<string, number> = {};

    integrationErrors?.forEach((error) => {
      const integration = (error.meta as Record<string, unknown>)?.integration as string;
      if (integration) {
        integrationErrorCounts[integration] = (integrationErrorCounts[integration] || 0) + 1;
      }
    });

    // Check for high error rates (>10 errors/hour for an integration)
    for (const [integration, count] of Object.entries(integrationErrorCounts)) {
      if (count > 10) {
        signals.push({
          type: "integration_issue",
          severity: count > 50 ? "critical" : count > 20 ? "high" : "medium",
          message: `${integration} integration experiencing high error rate: ${count} errors in last hour`,
          confidence: 80,
          predictedImpact: "Workflows using this integration may fail",
          recommendedAction: `Check ${integration} API status, verify credentials, review integration configuration`,
          detectedAt: new Date(),
        });
      }
    }
  } catch (error) {
    logger.error("Failed to detect integration issues", error instanceof Error ? error : new Error(String(error)));
  }

  return signals;
}

/**
 * Detect anomalies (unusual patterns)
 */
async function detectAnomalies(): Promise<HealthSignal[]> {
  const signals: HealthSignal[] = [];

  try {
    // Example: Detect unusual user behavior patterns
    // This is a simplified heuristic - in production, would use statistical analysis

    // Get user activity patterns
    const { data: recentActivity } = await supabase
      .from("app_events")
      .select("user_id, event_type, created_at")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1000);

    // Group by user
    const userActivity: Record<string, number> = {};
    recentActivity?.forEach((event) => {
      const userId = event.user_id || "unknown";
      userActivity[userId] = (userActivity[userId] || 0) + 1;
    });

    // Detect unusually high activity (potential bot or issue)
    const avgActivity = Object.values(userActivity).reduce((sum, count) => sum + count, 0) / Object.keys(userActivity).length;
    const threshold = avgActivity * 5; // 5x average

    for (const [userId, count] of Object.entries(userActivity)) {
      if (count > threshold) {
        signals.push({
          type: "anomaly",
          severity: "low",
          message: `Unusual activity pattern detected for user ${userId}: ${count} events in 24h`,
          confidence: 60,
          predictedImpact: "Potential bot activity or system issue",
          recommendedAction: "Review user activity, check for automation issues",
          detectedAt: new Date(),
        });
      }
    }
  } catch (error) {
    logger.error("Failed to detect anomalies", error instanceof Error ? error : new Error(String(error)));
  }

  return signals;
}

/**
 * Get all predictive health signals
 */
export async function getPredictiveHealthSignals(): Promise<HealthSignal[]> {
  const signals: HealthSignal[] = [];

  // Run all detectors in parallel
  const [
    performanceSignals,
    errorSignals,
    integrationSignals,
    anomalySignals,
  ] = await Promise.all([
    detectPerformanceDegradation(),
    detectErrorSpikes(),
    detectIntegrationIssues(),
    detectAnomalies(),
  ]);

  signals.push(...performanceSignals);
  signals.push(...errorSignals);
  signals.push(...integrationSignals);
  signals.push(...anomalySignals);

  // Sort by severity (critical > high > medium > low)
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  return signals.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
}
