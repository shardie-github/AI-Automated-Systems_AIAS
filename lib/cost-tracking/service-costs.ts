/**
 * Service Cost Tracking
 * 
 * Tracks and calculates costs for all services in the stack:
 * - Supabase (Database, Storage, Functions, Edge Functions)
 * - Upstash (Redis, Database)
 * - Vercel (Hosting, Functions, Bandwidth)
 * - Resend (Email)
 * - Stripe (Payment processing)
 * - OpenAI (AI API calls)
 * - Other third-party services
 */

export interface ServiceCost {
  service: string;
  category: string;
  amount: number;
  currency: string;
  period: "daily" | "monthly" | "yearly";
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface CostBreakdown {
  service: string;
  total: number;
  breakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  trend: "up" | "down" | "stable";
  forecast?: number;
}

export interface CostMetrics {
  totalMonthly: number;
  totalDaily: number;
  byService: CostBreakdown[];
  trends: {
    period: string;
    total: number;
  }[];
  forecast: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
}

/**
 * Supabase Cost Calculator
 */
export class SupabaseCostCalculator {
  /**
   * Calculate database costs
   */
  static calculateDatabaseCost(
    storageGB: number,
    computeHours: number,
    plan: "free" | "pro" | "team" | "enterprise" = "pro"
  ): number {
    if (plan === "free") return 0;

    const baseCost = plan === "pro" ? 25 : plan === "team" ? 599 : 0; // Base monthly
    const storageCost = Math.max(0, storageGB - 8) * 0.125; // $0.125/GB over 8GB
    const computeCost = computeHours * 0.000004; // Approximate compute cost

    return baseCost + storageCost + computeCost;
  }

  /**
   * Calculate storage costs
   */
  static calculateStorageCost(storageGB: number, plan: string = "pro"): number {
    if (plan === "free") return 0;
    const freeTier = 1; // 1GB free
    return Math.max(0, storageGB - freeTier) * 0.021; // $0.021/GB/month
  }

  /**
   * Calculate function invocations cost
   */
  static calculateFunctionsCost(
    invocations: number,
    executionTimeMs: number
  ): number {
    const freeInvocations = 500000; // 500k free per month
    const freeCompute = 360000; // 360k GB-seconds free

    const paidInvocations = Math.max(0, invocations - freeInvocations);
    const totalCompute = (invocations * executionTimeMs) / 1000; // GB-seconds
    const paidCompute = Math.max(0, totalCompute - freeCompute);

    const invocationCost = (paidInvocations / 1000000) * 2; // $2 per million
    const computeCost = (paidCompute / 1000) * 0.0000166667; // $0.0000166667 per GB-second

    return invocationCost + computeCost;
  }

  /**
   * Calculate edge function costs
   */
  static calculateEdgeFunctionsCost(
    invocations: number,
    executionTimeMs: number
  ): number {
    // Similar to regular functions but different pricing
    const freeInvocations = 500000;
    const paidInvocations = Math.max(0, invocations - freeInvocations);
    return (paidInvocations / 1000000) * 2;
  }
}

/**
 * Upstash Cost Calculator
 */
export class UpstashCostCalculator {
  /**
   * Calculate Redis costs
   */
  static calculateRedisCost(
    requests: number,
    dataSizeGB: number,
    plan: "free" | "pay_as_you_go" = "pay_as_you_go"
  ): number {
    if (plan === "free") {
      const freeRequests = 10000; // 10k requests/day free
      const freeData = 0.1; // 100MB free
      if (requests <= freeRequests && dataSizeGB <= freeData) return 0;
    }

    // Pay-as-you-go pricing
    const requestCost = (requests / 100000) * 0.2; // $0.20 per 100k requests
    const dataCost = dataSizeGB * 0.20; // $0.20/GB/month

    return requestCost + dataCost;
  }

  /**
   * Calculate database costs
   */
  static calculateDatabaseCost(
    readRequests: number,
    writeRequests: number,
    storageGB: number
  ): number {
    const readCost = (readRequests / 100000) * 0.1; // $0.10 per 100k reads
    const writeCost = (writeRequests / 100000) * 0.2; // $0.20 per 100k writes
    const storageCost = storageGB * 0.10; // $0.10/GB/month

    return readCost + writeCost + storageCost;
  }
}

/**
 * Vercel Cost Calculator
 */
export class VercelCostCalculator {
  /**
   * Calculate hosting costs
   */
  static calculateHostingCost(
    bandwidthGB: number,
    functionInvocations: number,
    functionExecutionTimeMs: number,
    plan: "hobby" | "pro" | "enterprise" = "pro"
  ): number {
    if (plan === "hobby") return 0; // Free for hobby

    const baseCost = plan === "pro" ? 20 : 0; // $20/month base for Pro

    // Bandwidth: 100GB included, then $0.15/GB
    const freeBandwidth = 100;
    const paidBandwidth = Math.max(0, bandwidthGB - freeBandwidth);
    const bandwidthCost = paidBandwidth * 0.15;

    // Functions: 100GB-hours included, then $0.0000025/GB-second
    const totalGBSeconds = (functionInvocations * functionExecutionTimeMs) / 1000;
    const freeGBSeconds = 100 * 3600; // 100GB-hours in GB-seconds
    const paidGBSeconds = Math.max(0, totalGBSeconds - freeGBSeconds);
    const functionCost = paidGBSeconds * 0.0000025;

    return baseCost + bandwidthCost + functionCost;
  }
}

/**
 * Resend Cost Calculator
 */
export class ResendCostCalculator {
  static calculateEmailCost(emailsSent: number, plan: "free" | "pro" = "pro"): number {
    if (plan === "free") {
      const freeEmails = 3000; // 3k emails/month free
      if (emailsSent <= freeEmails) return 0;
    }

    const baseCost = plan === "pro" ? 20 : 0; // $20/month base
    const freeEmails = 50000; // 50k emails included in pro
    const paidEmails = Math.max(0, emailsSent - freeEmails);
    const emailCost = (paidEmails / 1000) * 0.30; // $0.30 per 1k emails

    return baseCost + emailCost;
  }
}

/**
 * OpenAI Cost Calculator
 */
export class OpenAICostCalculator {
  static calculateAPICost(
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    // Pricing as of 2024 (adjust as needed)
    const pricing: Record<string, { prompt: number; completion: number }> = {
      "gpt-4": { prompt: 0.03 / 1000, completion: 0.06 / 1000 },
      "gpt-4-turbo": { prompt: 0.01 / 1000, completion: 0.03 / 1000 },
      "gpt-3.5-turbo": { prompt: 0.0005 / 1000, completion: 0.0015 / 1000 },
      "gpt-4o": { prompt: 0.005 / 1000, completion: 0.015 / 1000 },
    };

    const modelPricing = pricing[model] || pricing["gpt-3.5-turbo"];
    const promptCost = promptTokens * modelPricing.prompt;
    const completionCost = completionTokens * modelPricing.completion;

    return promptCost + completionCost;
  }
}

/**
 * Stripe Cost Calculator
 */
export class StripeCostCalculator {
  static calculateProcessingCost(amount: number, currency: string = "usd"): number {
    // Stripe charges 2.9% + $0.30 per transaction
    const percentage = 0.029;
    const fixed = 0.30;
    return amount * percentage + fixed;
  }
}

/**
 * Aggregate cost calculator
 */
export class CostAggregator {
  static aggregateCosts(costs: ServiceCost[]): CostMetrics {
    const now = Date.now();
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Filter to last 30 days
    const recentCosts = costs.filter((c) => c.timestamp >= oneMonthAgo);

    // Calculate totals
    const totalMonthly = recentCosts.reduce((sum, cost) => {
      if (cost.period === "monthly") return sum + cost.amount;
      if (cost.period === "daily") return sum + cost.amount * 30;
      if (cost.period === "yearly") return sum + cost.amount / 12;
      return sum;
    }, 0);

    const totalDaily = totalMonthly / 30;

    // Group by service
    const byService = new Map<string, ServiceCost[]>();
    recentCosts.forEach((cost) => {
      const existing = byService.get(cost.service) || [];
      existing.push(cost);
      byService.set(cost.service, existing);
    });

    const serviceBreakdowns: CostBreakdown[] = Array.from(byService.entries()).map(
      ([service, serviceCosts]) => {
        const total = serviceCosts.reduce((sum, cost) => {
          if (cost.period === "monthly") return sum + cost.amount;
          if (cost.period === "daily") return sum + cost.amount * 30;
          if (cost.period === "yearly") return sum + cost.amount / 12;
          return sum;
        }, 0);

        // Group by category
        const byCategory = new Map<string, number>();
        serviceCosts.forEach((cost) => {
          const amount =
            cost.period === "monthly"
              ? cost.amount
              : cost.period === "daily"
              ? cost.amount * 30
              : cost.amount / 12;
          const existing = byCategory.get(cost.category) || 0;
          byCategory.set(cost.category, existing + amount);
        });

        const breakdown = Array.from(byCategory.entries()).map(([category, amount]) => ({
          category,
          amount,
          percentage: (amount / total) * 100,
        }));

        // Calculate trend (simplified - compare last 15 days to previous 15 days)
        const midPoint = now - 15 * 24 * 60 * 60 * 1000;
        const recent = serviceCosts.filter((c) => c.timestamp >= midPoint);
        const previous = serviceCosts.filter(
          (c) => c.timestamp < midPoint && c.timestamp >= oneMonthAgo
        );

        const recentTotal = recent.reduce((sum, cost) => {
          if (cost.period === "monthly") return sum + cost.amount;
          if (cost.period === "daily") return sum + cost.amount * 15;
          return sum;
        }, 0);

        const previousTotal = previous.reduce((sum, cost) => {
          if (cost.period === "monthly") return sum + cost.amount;
          if (cost.period === "daily") return sum + cost.amount * 15;
          return sum;
        }, 0);

        let trend: "up" | "down" | "stable" = "stable";
        if (recentTotal > previousTotal * 1.1) trend = "up";
        else if (recentTotal < previousTotal * 0.9) trend = "down";

        // Simple forecast (extrapolate trend)
        const forecast = trend === "up" ? total * 1.2 : trend === "down" ? total * 0.9 : total;

        return {
          service,
          total,
          breakdown,
          trend,
          forecast,
        };
      }
    );

    // Calculate trends over time
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const periodStart = now - i * 5 * 24 * 60 * 60 * 1000; // 5-day periods
      const periodEnd = periodStart + 5 * 24 * 60 * 60 * 1000;
      const periodCosts = costs.filter(
        (c) => c.timestamp >= periodStart && c.timestamp < periodEnd
      );
      const periodTotal = periodCosts.reduce((sum, cost) => {
        if (cost.period === "monthly") return sum + cost.amount / 6; // Pro-rate
        if (cost.period === "daily") return sum + cost.amount * 5;
        return sum;
      }, 0);
      trends.push({
        period: new Date(periodStart).toISOString().split("T")[0],
        total: periodTotal,
      });
    }

    // Forecast (simple linear extrapolation)
    const avgDailyGrowth =
      trends.length > 1
        ? (trends[trends.length - 1].total - trends[0].total) / (trends.length - 1)
        : 0;
    const nextMonth = totalMonthly + avgDailyGrowth * 30;
    const nextQuarter = totalMonthly + avgDailyGrowth * 90;
    const nextYear = totalMonthly + avgDailyGrowth * 365;

    return {
      totalMonthly,
      totalDaily,
      byService: serviceBreakdowns.sort((a, b) => b.total - a.total),
      trends,
      forecast: {
        nextMonth,
        nextQuarter,
        nextYear,
      },
    };
  }
}
