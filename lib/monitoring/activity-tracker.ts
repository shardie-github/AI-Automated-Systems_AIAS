/**
 * Activity Tracker
 * Monitors user activity to detect inactivity and churn risk
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export interface ActivityMetrics {
  userId: string;
  lastActivityDate: Date | null;
  daysSinceLastActivity: number;
  totalWorkflows: number;
  totalExecutions: number;
  lastExecutionDate: Date | null;
  riskLevel: "low" | "medium" | "high" | "critical";
}

/**
 * Get user activity metrics
 */
export async function getUserActivityMetrics(userId: string): Promise<ActivityMetrics> {
  try {
    // Get user's last activity from app_events
    const { data: lastEvent } = await supabase
      .from("app_events")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Get workflow count
    const { data: workflows, count: workflowCount } = await supabase
      .from("workflows")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    // Get execution count and last execution
    const { data: lastExecution } = await supabase
      .from("workflow_executions")
      .select("started_at")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    const { data: executions, count: executionCount } = await supabase
      .from("workflow_executions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    const lastActivityDate = lastEvent?.created_at ? new Date(lastEvent.created_at) : null;
    const lastExecutionDate = lastExecution?.started_at ? new Date(lastExecution.started_at) : null;

    const now = new Date();
    const daysSinceLastActivity = lastActivityDate
      ? Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    if (daysSinceLastActivity >= 30) {
      riskLevel = "critical";
    } else if (daysSinceLastActivity >= 14) {
      riskLevel = "high";
    } else if (daysSinceLastActivity >= 7) {
      riskLevel = "medium";
    }

    return {
      userId,
      lastActivityDate,
      daysSinceLastActivity,
      totalWorkflows: workflowCount || 0,
      totalExecutions: executionCount || 0,
      lastExecutionDate,
      riskLevel,
    };
  } catch (error) {
    logger.error("Failed to get user activity metrics", error instanceof Error ? error : new Error(String(error)), {
      userId,
    });
    throw error;
  }
}

/**
 * Get all inactive users (no activity for 7+ days)
 */
export async function getInactiveUsers(daysInactive: number = 7): Promise<ActivityMetrics[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    // Get users with no activity since cutoff
    const { data: users } = await supabase
      .from("profiles")
      .select("id")
      .not("id", "is", null);

    if (!users) {
      return [];
    }

    const inactiveUsers: ActivityMetrics[] = [];

    for (const user of users) {
      const metrics = await getUserActivityMetrics(user.id);
      if (metrics.daysSinceLastActivity >= daysInactive) {
        inactiveUsers.push(metrics);
      }
    }

    return inactiveUsers.sort((a, b) => b.daysSinceLastActivity - a.daysSinceLastActivity);
  } catch (error) {
    logger.error("Failed to get inactive users", error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

/**
 * Track user activity
 */
export async function trackActivity(
  userId: string,
  activityType: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from("app_events").insert({
      user_id: userId,
      event_type: "user_activity",
      meta: {
        activity_type: activityType,
        ...metadata,
      },
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn("Failed to track activity", {
      userId,
      activityType,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
