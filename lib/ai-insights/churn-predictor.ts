/**
 * Churn Predictor
 * Heuristic-based prediction of user churn risk
 */

import { getUserActivityMetrics } from "../monitoring/activity-tracker";
import { logger } from "@/lib/logging/structured-logger";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export interface ChurnSignal {
  signal: string;
  weight: number;
  present: boolean;
  severity: "critical" | "high" | "medium" | "low";
}

export interface ChurnPrediction {
  userId: string;
  churnRisk: number; // 0-100
  signals: ChurnSignal[];
  daysUntilChurn: number | null;
  recommendedInterventions: string[];
  urgency: "critical" | "high" | "medium" | "low";
}

/**
 * Predict user churn risk
 */
export async function predictChurn(userId: string): Promise<ChurnPrediction> {
  try {
    const metrics = await getUserActivityMetrics(userId);
    const signals: ChurnSignal[] = [];

    // Signal 1: Inactivity (critical weight)
    signals.push({
      signal: "Inactive for 30+ days",
      weight: 40,
      present: metrics.daysSinceLastActivity >= 30,
      severity: "critical",
    });

    signals.push({
      signal: "Inactive for 14+ days",
      weight: 25,
      present: metrics.daysSinceLastActivity >= 14 && metrics.daysSinceLastActivity < 30,
      severity: "high",
    });

    signals.push({
      signal: "Inactive for 7+ days",
      weight: 15,
      present: metrics.daysSinceLastActivity >= 7 && metrics.daysSinceLastActivity < 14,
      severity: "medium",
    });

    // Signal 2: No workflows created (high weight)
    signals.push({
      signal: "No workflows created",
      weight: 20,
      present: metrics.totalWorkflows === 0,
      severity: "high",
    });

    // Signal 3: No workflow executions (medium weight)
    signals.push({
      signal: "Workflows never executed",
      weight: 15,
      present: metrics.totalWorkflows > 0 && metrics.totalExecutions === 0,
      severity: "medium",
    });

    // Signal 4: Trial expiration without upgrade
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

      signals.push({
        signal: "Trial expired without upgrade",
        weight: 30,
        present: daysSinceTrialStart >= 30 && metrics.totalWorkflows > 0,
        severity: "critical",
      });
    }

    // Calculate churn risk
    let churnRisk = 0;
    signals.forEach((signal) => {
      if (signal.present) {
        churnRisk += signal.weight;
      }
    });

    // Determine urgency
    const criticalSignals = signals.filter((s) => s.present && s.severity === "critical").length;
    const highSignals = signals.filter((s) => s.present && s.severity === "high").length;

    let urgency: "critical" | "high" | "medium" | "low" = "low";
    if (criticalSignals > 0 || churnRisk >= 70) {
      urgency = "critical";
    } else if (highSignals > 0 || churnRisk >= 50) {
      urgency = "high";
    } else if (churnRisk >= 30) {
      urgency = "medium";
    }

    // Generate interventions
    const recommendedInterventions: string[] = [];
    if (metrics.daysSinceLastActivity >= 14) {
      recommendedInterventions.push("Send 'We miss you' email");
    }
    if (metrics.totalWorkflows === 0) {
      recommendedInterventions.push("Offer setup call or guided onboarding");
    }
    if (metrics.totalExecutions === 0 && metrics.totalWorkflows > 0) {
      recommendedInterventions.push("Send workflow testing guide");
    }
    if (profile?.subscription_tier === "trial") {
      recommendedInterventions.push("Offer trial extension or discount");
    }

    // Estimate days until churn
    let daysUntilChurn: number | null = null;
    if (churnRisk >= 70) {
      daysUntilChurn = 0; // Already churned or about to
    } else if (churnRisk >= 50) {
      daysUntilChurn = 7; // High risk - likely within a week
    } else if (churnRisk >= 30) {
      daysUntilChurn = 14; // Medium risk - likely within 2 weeks
    }

    return {
      userId,
      churnRisk: Math.min(100, churnRisk),
      signals,
      daysUntilChurn,
      recommendedInterventions,
      urgency,
    };
  } catch (error) {
    logger.error("Failed to predict churn", error instanceof Error ? error : new Error(String(error)), {
      userId,
    });
    return {
      userId,
      churnRisk: 0,
      signals: [],
      daysUntilChurn: null,
      recommendedInterventions: [],
      urgency: "low",
    };
  }
}

/**
 * Get all users at churn risk
 */
export async function getChurnRiskUsers(riskThreshold: number = 50): Promise<ChurnPrediction[]> {
  try {
    // Get all users (simplified - in production would paginate)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .limit(1000); // Limit for performance

    if (!profiles) {
      return [];
    }

    const predictions: ChurnPrediction[] = [];

    for (const profile of profiles) {
      const prediction = await predictChurn(profile.id);
      if (prediction.churnRisk >= riskThreshold) {
        predictions.push(prediction);
      }
    }

    // Sort by risk (highest first)
    return predictions.sort((a, b) => b.churnRisk - a.churnRisk);
  } catch (error) {
    logger.error("Failed to get churn risk users", error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}
