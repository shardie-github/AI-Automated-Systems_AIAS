/**
 * Insight Collector
 * Aggregates insights from various sources and generates improvement suggestions
 */

import { analyzeUsagePatterns, detectIncompleteWorkflows, detectFrictionPoints } from "./usage-patterns";
import { analyzeErrors } from "./error-analyzer";
import { getPredictiveHealthSignals } from "./health-predictor";
import { logger } from "@/lib/logging/structured-logger";

export interface Insight {
  type: "usage" | "error" | "health" | "friction" | "optimization";
  category: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  priority: number; // 0-100
  data: Record<string, unknown>;
  recommendedAction: string;
}

export interface WeeklyInsights {
  period: string;
  insights: Insight[];
  summary: {
    totalInsights: number;
    highImpact: number;
    lowEffort: number;
    quickWins: Insight[];
  };
}

/**
 * Collect all insights
 */
export async function collectInsights(): Promise<WeeklyInsights> {
  try {
    const insights: Insight[] = [];

    // 1. Usage pattern insights
    const usagePatterns = await analyzeUsagePatterns(30);
    const topFeatures = usagePatterns.slice(0, 5);
    const lowAdoptionFeatures = usagePatterns.filter((p) => p.adoptionRate < 10);

    if (lowAdoptionFeatures.length > 0) {
      insights.push({
        type: "usage",
        category: "feature_adoption",
        title: "Low Feature Adoption Detected",
        description: `${lowAdoptionFeatures.length} features have <10% adoption rate`,
        impact: "medium",
        effort: "low",
        priority: 60,
        data: { features: lowAdoptionFeatures.map((f) => f.feature) },
        recommendedAction: "Consider improving feature discoverability or adding tooltips",
      });
    }

    // 2. Incomplete workflow insights
    const incompleteWorkflows = await detectIncompleteWorkflows();
    if (incompleteWorkflows.length > 0) {
      insights.push({
        type: "friction",
        category: "workflow_completion",
        title: "Incomplete Workflows Detected",
        description: `${incompleteWorkflows.length} workflows created but never executed`,
        impact: "high",
        effort: "medium",
        priority: 75,
        data: { count: incompleteWorkflows.length, workflows: incompleteWorkflows },
        recommendedAction: "Send workflow testing prompts or offer setup assistance",
      });
    }

    // 3. Friction point insights
    const frictionPoints = await detectFrictionPoints();
    if (frictionPoints.length > 0) {
      const topFriction = frictionPoints[0];
      insights.push({
        type: "friction",
        category: "onboarding",
        title: "Onboarding Friction Detected",
        description: `Step "${topFriction.step}" has ${topFriction.dropOffRate.toFixed(1)}% drop-off rate`,
        impact: "high",
        effort: "medium",
        priority: 80,
        data: { step: topFriction.step, dropOffRate: topFriction.dropOffRate },
        recommendedAction: `Improve step "${topFriction.step}" with better guidance or simplify the process`,
      });
    }

    // 4. Error insights
    const errorAnalysis = await analyzeErrors(7);
    if (errorAnalysis.topErrors.length > 0) {
      const topError = errorAnalysis.topErrors[0];
      if (topError.count > 20) {
        insights.push({
          type: "error",
          category: "error_pattern",
          title: "Frequent Error Pattern",
          description: `"${topError.message}" occurred ${topError.count} times affecting ${topError.affectedUsers} users`,
          impact: topError.affectedUsers > 10 ? "high" : "medium",
          effort: "medium",
          priority: 70,
          data: { error: topError },
          recommendedAction: topError.suggestedFix,
        });
      }
    }

    // 5. Health signal insights
    const healthSignals = await getPredictiveHealthSignals();
    const criticalSignals = healthSignals.filter((s) => s.severity === "critical" || s.severity === "high");
    if (criticalSignals.length > 0) {
      insights.push({
        type: "health",
        category: "system_health",
        title: "System Health Issues Detected",
        description: `${criticalSignals.length} critical/high severity health signals detected`,
        impact: "high",
        effort: "high",
        priority: 90,
        data: { signals: criticalSignals },
        recommendedAction: "Review health signals and take immediate action",
      });
    }

    // 6. Optimization opportunities
    if (usagePatterns.length > 0) {
      const trendingDown = usagePatterns.filter((p) => p.trend === "decreasing" && p.usageCount > 10);
      if (trendingDown.length > 0) {
        insights.push({
          type: "optimization",
          category: "feature_optimization",
          title: "Features with Declining Usage",
          description: `${trendingDown.length} features showing declining usage trends`,
          impact: "medium",
          effort: "low",
          priority: 50,
          data: { features: trendingDown.map((f) => f.feature) },
          recommendedAction: "Investigate why usage is declining and consider improvements or deprecation",
        });
      }
    }

    // Calculate summary
    const highImpact = insights.filter((i) => i.impact === "high").length;
    const lowEffort = insights.filter((i) => i.effort === "low").length;
    const quickWins = insights.filter((i) => i.impact === "high" && i.effort === "low");

    // Sort by priority
    insights.sort((a, b) => b.priority - a.priority);

    return {
      period: `Last 7 days (${new Date().toISOString().split("T")[0]})`,
      insights,
      summary: {
        totalInsights: insights.length,
        highImpact,
        lowEffort,
        quickWins,
      },
    };
  } catch (error) {
    logger.error("Failed to collect insights", error instanceof Error ? error : new Error(String(error)));
    return {
      period: `Last 7 days`,
      insights: [],
      summary: {
        totalInsights: 0,
        highImpact: 0,
        lowEffort: 0,
        quickWins: [],
      },
    };
  }
}
