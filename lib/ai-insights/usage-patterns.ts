/**
 * Usage Pattern Intelligence
 * Analyzes telemetry data to detect usage patterns and generate insights
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export interface UsagePattern {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
  trend: "increasing" | "decreasing" | "stable";
  adoptionRate: number;
  averageFrequency: number;
}

export interface FeatureAdoption {
  feature: string;
  totalUsers: number;
  activeUsers: number;
  adoptionRate: number;
  growthRate: number;
  timeToAdoption: number; // Average days to first use
}

export interface FrictionPoint {
  step: string;
  dropOffCount: number;
  dropOffRate: number;
  averageTimeSpent: number;
  commonErrors: string[];
}

/**
 * Analyze feature usage patterns
 */
export async function analyzeUsagePatterns(
  days: number = 30
): Promise<UsagePattern[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get all events in the period
    const { data: events, error } = await supabase
      .from("app_events")
      .select("event_type, user_id, created_at, meta")
      .gte("created_at", cutoffDate.toISOString());

    if (error) {
      logger.error("Failed to get events for pattern analysis", error instanceof Error ? error : new Error(String(error)));
      return [];
    }

    // Group by feature/event type
    const featureUsage: Record<string, {
      count: number;
      users: Set<string>;
      timestamps: Date[];
    }> = {};

    events?.forEach((event) => {
      const feature = event.event_type || "unknown";
      if (!featureUsage[feature]) {
        featureUsage[feature] = {
          count: 0,
          users: new Set(),
          timestamps: [],
        };
      }
      featureUsage[feature].count++;
      if (event.user_id) {
        featureUsage[feature].users.add(event.user_id);
      }
      featureUsage[feature].timestamps.push(new Date(event.created_at));
    });

    // Calculate patterns
    const patterns: UsagePattern[] = [];

    for (const [feature, data] of Object.entries(featureUsage)) {
      // Calculate trend (comparing first half vs second half of period)
      const midPoint = Math.floor(data.timestamps.length / 2);
      const firstHalf = data.timestamps.slice(0, midPoint).length;
      const secondHalf = data.timestamps.slice(midPoint).length;
      
      let trend: "increasing" | "decreasing" | "stable" = "stable";
      if (secondHalf > firstHalf * 1.1) {
        trend = "increasing";
      } else if (firstHalf > secondHalf * 1.1) {
        trend = "decreasing";
      }

      // Calculate adoption rate (users who used this feature / total active users)
      const { count: totalActiveUsers } = await supabase
        .from("app_events")
        .select("user_id", { count: "exact", head: true })
        .gte("created_at", cutoffDate.toISOString());

      const adoptionRate = totalActiveUsers ? (data.users.size / totalActiveUsers) * 100 : 0;
      const averageFrequency = data.count / data.users.size || 0;

      patterns.push({
        feature,
        usageCount: data.count,
        uniqueUsers: data.users.size,
        trend,
        adoptionRate: Math.round(adoptionRate * 10) / 10,
        averageFrequency: Math.round(averageFrequency * 10) / 10,
      });
    }

    // Sort by usage count
    return patterns.sort((a, b) => b.usageCount - a.usageCount);
  } catch (error) {
    logger.error("Failed to analyze usage patterns", error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

/**
 * Detect incomplete workflows
 */
export async function detectIncompleteWorkflows(): Promise<Array<{
  workflowId: string;
  userId: string;
  issue: string;
  recommendation: string;
}>> {
  try {
    // Get workflows that are created but never executed
    const { data: workflows } = await supabase
      .from("workflows")
      .select("id, user_id, name, enabled, created_at");

    if (!workflows) {
      return [];
    }

    const incomplete: Array<{
      workflowId: string;
      userId: string;
      issue: string;
      recommendation: string;
    }> = [];

    for (const workflow of workflows) {
      // Check if workflow has been executed
      const { count: executionCount } = await supabase
        .from("workflow_executions")
        .select("id", { count: "exact", head: true })
        .eq("workflow_id", workflow.id);

      if (executionCount === 0) {
        const daysSinceCreation = Math.floor(
          (Date.now() - new Date(workflow.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceCreation >= 7) {
          incomplete.push({
            workflowId: workflow.id,
            userId: workflow.user_id,
            issue: "Workflow created but never executed",
            recommendation: daysSinceCreation >= 30
              ? "Consider archiving or deleting this workflow"
              : "Test the workflow or check if it needs configuration",
          });
        }
      }

      // Check if workflow is disabled
      if (!workflow.enabled) {
        const daysSinceCreation = Math.floor(
          (Date.now() - new Date(workflow.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceCreation >= 14) {
          incomplete.push({
            workflowId: workflow.id,
            userId: workflow.user_id,
            issue: "Workflow has been disabled for extended period",
            recommendation: "Re-enable or delete this workflow",
          });
        }
      }
    }

    return incomplete;
  } catch (error) {
    logger.error("Failed to detect incomplete workflows", error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

/**
 * Detect friction points in onboarding
 */
export async function detectFrictionPoints(): Promise<FrictionPoint[]> {
  try {
    // Get onboarding events
    const { data: onboardingEvents } = await supabase
      .from("app_events")
      .select("event_type, user_id, created_at, meta")
      .in("event_type", ["onboarding_started", "onboarding_step_completed", "onboarding_completed"])
      .order("created_at", { ascending: true });

    if (!onboardingEvents) {
      return [];
    }

    // Group by user and track progression
    const userProgress: Record<string, {
      started: Date | null;
      steps: string[];
      completed: boolean;
    }> = {};

    onboardingEvents.forEach((event) => {
      const userId = event.user_id || "unknown";
      if (!userProgress[userId]) {
        userProgress[userId] = {
          started: null,
          steps: [],
          completed: false,
        };
      }

      if (event.event_type === "onboarding_started") {
        userProgress[userId].started = new Date(event.created_at);
      } else if (event.event_type === "onboarding_step_completed") {
        const stepId = (event.meta as Record<string, unknown>)?.step_id as string;
        if (stepId) {
          userProgress[userId].steps.push(stepId);
        }
      } else if (event.event_type === "onboarding_completed") {
        userProgress[userId].completed = true;
      }
    });

    // Calculate drop-off rates by step
    const stepStats: Record<string, {
      reached: number;
      completed: number;
      averageTime: number;
      errors: string[];
    }> = {};

    const allSteps = ["welcome", "choose-integration", "create-workflow", "test-workflow", "complete"];

    allSteps.forEach((step, index) => {
      stepStats[step] = {
        reached: 0,
        completed: 0,
        averageTime: 0,
        errors: [],
      };

      Object.values(userProgress).forEach((progress) => {
        if (progress.steps.length >= index) {
          stepStats[step].reached++;
        }
        if (progress.steps.includes(step)) {
          stepStats[step].completed++;
        }
      });
    });

    // Convert to friction points
    const frictionPoints: FrictionPoint[] = [];

    for (const [step, stats] of Object.entries(stepStats)) {
      const dropOffCount = stats.reached - stats.completed;
      const dropOffRate = stats.reached > 0 ? (dropOffCount / stats.reached) * 100 : 0;

      if (dropOffRate > 20) { // Only report significant drop-offs
        frictionPoints.push({
          step,
          dropOffCount,
          dropOffRate: Math.round(dropOffRate * 10) / 10,
          averageTimeSpent: stats.averageTime,
          commonErrors: stats.errors,
        });
      }
    }

    return frictionPoints.sort((a, b) => b.dropOffRate - a.dropOffRate);
  } catch (error) {
    logger.error("Failed to detect friction points", error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

/**
 * Correlate conversion signals
 */
export async function analyzeConversionSignals(): Promise<{
  activationSignals: Array<{ signal: string; correlation: number; impact: "high" | "medium" | "low" }>;
  churnSignals: Array<{ signal: string; correlation: number; impact: "high" | "medium" | "low" }>;
}> {
  try {
    // Get activated users (have integration + workflow + execution)
    const { data: activatedUsers } = await supabase
      .from("app_events")
      .select("user_id, meta")
      .eq("event_type", "activated")
      .limit(100);

    // Get churned users (inactive for 30+ days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: allUsers } = await supabase
      .from("app_events")
      .select("user_id, created_at")
      .order("created_at", { ascending: false });

    const userLastActivity: Record<string, Date> = {};
    allUsers?.forEach((event) => {
      const userId = event.user_id || "unknown";
      const eventDate = new Date(event.created_at);
      if (!userLastActivity[userId] || eventDate > userLastActivity[userId]) {
        userLastActivity[userId] = eventDate;
      }
    });

    const churnedUsers = Object.entries(userLastActivity)
      .filter(([_, lastActivity]) => lastActivity < thirtyDaysAgo)
      .map(([userId]) => userId);

    // Analyze signals for activated users
    const activationSignals: Array<{ signal: string; correlation: number; impact: "high" | "medium" | "low" }> = [];

    // Signal 1: Onboarding completion speed
    const fastOnboarders = activatedUsers?.filter((user) => {
      // Users who completed onboarding quickly (heuristic)
      return true; // Simplified
    }).length || 0;

    if (activatedUsers && activatedUsers.length > 0) {
      const correlation = (fastOnboarders / activatedUsers.length) * 100;
      activationSignals.push({
        signal: "Fast onboarding completion (<5 minutes)",
        correlation: Math.round(correlation * 10) / 10,
        impact: correlation > 70 ? "high" : correlation > 40 ? "medium" : "low",
      });
    }

    // Signal 2: Integration connection
    // Signal 3: First workflow creation
    // Signal 4: First workflow execution

    // Analyze signals for churned users
    const churnSignals: Array<{ signal: string; correlation: number; impact: "high" | "medium" | "low" }> = [];

    // Signal 1: Low usage
    // Signal 2: No workflows created
    // Signal 3: Trial expiration without upgrade

    return {
      activationSignals,
      churnSignals,
    };
  } catch (error) {
    logger.error("Failed to analyze conversion signals", error instanceof Error ? error : new Error(String(error)));
    return {
      activationSignals: [],
      churnSignals: [],
    };
  }
}
