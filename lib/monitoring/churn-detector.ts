/**
 * Churn Detector
 * Detects users at risk of churning and triggers rescue actions
 */

import { getUserActivityMetrics, getInactiveUsers } from "./activity-tracker";
import { logger } from "@/lib/logging/structured-logger";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export interface ChurnRisk {
  userId: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  reasons: string[];
  daysInactive: number;
  lastActivityDate: Date | null;
  recommendedAction: "none" | "email" | "in_app" | "support_reach_out";
}

/**
 * Detect churn risk for a user
 */
export async function detectChurnRisk(userId: string): Promise<ChurnRisk> {
  try {
    const metrics = await getUserActivityMetrics(userId);

    const reasons: string[] = [];
    let recommendedAction: ChurnRisk["recommendedAction"] = "none";

    // Check inactivity
    if (metrics.daysSinceLastActivity >= 7) {
      reasons.push(`No activity for ${metrics.daysSinceLastActivity} days`);
      if (metrics.daysSinceLastActivity >= 14) {
        recommendedAction = "email";
      }
      if (metrics.daysSinceLastActivity >= 30) {
        recommendedAction = "support_reach_out";
      }
    }

    // Check low usage
    if (metrics.totalWorkflows === 0) {
      reasons.push("No workflows created");
      if (metrics.daysSinceLastActivity >= 3) {
        recommendedAction = "in_app";
      }
    }

    if (metrics.totalExecutions === 0 && metrics.totalWorkflows > 0) {
      reasons.push("Workflows created but never executed");
      recommendedAction = "in_app";
    }

    // Check trial expiration without upgrade
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier, trial_started_at")
      .eq("id", userId)
      .single();

    if (profile?.subscription_tier === "trial" && profile.trial_started_at) {
      const trialStart = new Date(profile.trial_started_at);
      const daysSinceTrialStart = Math.floor(
        (Date.now() - trialStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceTrialStart >= 30 && metrics.totalWorkflows > 0) {
        reasons.push("Trial expired without upgrade");
        recommendedAction = "email";
      }
    }

    return {
      userId,
      riskLevel: metrics.riskLevel,
      reasons,
      daysInactive: metrics.daysSinceLastActivity,
      lastActivityDate: metrics.lastActivityDate,
      recommendedAction,
    };
  } catch (error) {
    logger.error("Failed to detect churn risk", error instanceof Error ? error : new Error(String(error)), {
      userId,
    });
    return {
      userId,
      riskLevel: "low",
      reasons: [],
      daysInactive: 0,
      lastActivityDate: null,
      recommendedAction: "none",
    };
  }
}

/**
 * Get all users at churn risk
 */
export async function getChurnRiskUsers(riskLevel: "medium" | "high" | "critical" = "medium"): Promise<ChurnRisk[]> {
  try {
    const inactiveUsers = await getInactiveUsers(7);
    const riskUsers: ChurnRisk[] = [];

    for (const user of inactiveUsers) {
      const risk = await detectChurnRisk(user.userId);
      if (
        risk.riskLevel === riskLevel ||
        (riskLevel === "medium" && (risk.riskLevel === "high" || risk.riskLevel === "critical")) ||
        (riskLevel === "high" && risk.riskLevel === "critical")
      ) {
        riskUsers.push(risk);
      }
    }

    return riskUsers;
  } catch (error) {
    logger.error("Failed to get churn risk users", error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}
