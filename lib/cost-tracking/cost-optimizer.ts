/**
 * Cost Optimizer
 * 
 * Analyzes costs and provides optimization recommendations.
 */

import { CostMetrics, CostBreakdown } from "./service-costs";

export interface OptimizationRecommendation {
  id: string;
  service: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  estimatedSavings: number;
  effort: "low" | "medium" | "high";
  actionItems: string[];
}

export class CostOptimizer {
  /**
   * Analyze costs and generate recommendations
   */
  static analyzeAndRecommend(metrics: CostMetrics): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Analyze each service
    for (const service of metrics.byService) {
      // Check for high costs
      if (service.total > metrics.totalMonthly * 0.3) {
        recommendations.push({
          id: `high-cost-${service.service}`,
          service: service.service,
          category: "cost",
          priority: "high",
          title: `High cost for ${service.service}`,
          description: `${service.service} accounts for ${((service.total / metrics.totalMonthly) * 100).toFixed(1)}% of total costs. Consider optimization.`,
          estimatedSavings: service.total * 0.2, // 20% potential savings
          effort: "medium",
          actionItems: [
            `Review ${service.service} usage patterns`,
            `Identify unused or underutilized resources`,
            `Consider downgrading plan if appropriate`,
            `Implement caching to reduce API calls`,
          ],
        });
      }

      // Check for upward trends
      if (service.trend === "up" && service.total > 100) {
        recommendations.push({
          id: `trending-up-${service.service}`,
          service: service.service,
          category: "trend",
          priority: "medium",
          title: `Rising costs for ${service.service}`,
          description: `${service.service} costs are trending upward. Forecast: $${service.forecast?.toFixed(2)}/month.`,
          estimatedSavings: (service.forecast || service.total) - service.total,
          effort: "low",
          actionItems: [
            `Investigate cause of cost increase`,
            `Review usage metrics`,
            `Set up cost alerts`,
            `Consider rate limiting or caching`,
          ],
        });
      }

      // Check for inefficient resource usage
      for (const breakdown of service.breakdown) {
        if (breakdown.percentage > 50 && breakdown.amount > 50) {
          recommendations.push({
            id: `inefficient-${service.service}-${breakdown.category}`,
            service: service.service,
            category: breakdown.category,
            priority: "medium",
            title: `Optimize ${breakdown.category} in ${service.service}`,
            description: `${breakdown.category} accounts for ${breakdown.percentage.toFixed(1)}% of ${service.service} costs.`,
            estimatedSavings: breakdown.amount * 0.15, // 15% potential savings
            effort: "medium",
            actionItems: [
              `Review ${breakdown.category} usage`,
              `Implement caching if applicable`,
              `Optimize queries/requests`,
              `Consider alternative solutions`,
            ],
          });
        }
      }
    }

    // General recommendations
    if (metrics.totalMonthly > 1000) {
      recommendations.push({
        id: "general-enterprise",
        service: "all",
        category: "general",
        priority: "high",
        title: "Consider enterprise plans",
        description: "Monthly costs exceed $1000. Enterprise plans may offer better value.",
        estimatedSavings: metrics.totalMonthly * 0.1, // 10% potential savings
        effort: "low",
        actionItems: [
          "Contact service providers for enterprise pricing",
          "Negotiate volume discounts",
          "Review contract terms",
        ],
      });
    }

    // Check forecast
    if (metrics.forecast.nextMonth > metrics.totalMonthly * 1.2) {
      recommendations.push({
        id: "forecast-warning",
        service: "all",
        category: "forecast",
        priority: "critical",
        title: "Rapid cost growth forecasted",
        description: `Costs are forecasted to increase by ${(((metrics.forecast.nextMonth - metrics.totalMonthly) / metrics.totalMonthly) * 100).toFixed(1)}% next month.`,
        estimatedSavings: metrics.forecast.nextMonth - metrics.totalMonthly,
        effort: "high",
        actionItems: [
          "Immediately review all service usage",
          "Implement cost controls",
          "Set up strict budgets",
          "Consider scaling down non-essential services",
        ],
      });
    }

    // Sort by priority and potential savings
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.estimatedSavings - a.estimatedSavings;
    });
  }

  /**
   * Calculate potential savings from recommendations
   */
  static calculatePotentialSavings(
    recommendations: OptimizationRecommendation[]
  ): number {
    return recommendations.reduce((sum, rec) => sum + rec.estimatedSavings, 0);
  }

  /**
   * Get quick wins (low effort, high savings)
   */
  static getQuickWins(
    recommendations: OptimizationRecommendation[]
  ): OptimizationRecommendation[] {
    return recommendations.filter(
      (rec) => rec.effort === "low" && rec.estimatedSavings > 50
    );
  }
}
