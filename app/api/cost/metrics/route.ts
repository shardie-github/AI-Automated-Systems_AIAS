/**
 * Cost Metrics API
 * 
 * Provides cost metrics and analytics for executive dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { CostAggregator } from "@/lib/cost-tracking/service-costs";
import { costMonitor } from "@/lib/cost-tracking/cost-monitor";
import { CostOptimizer } from "@/lib/cost-tracking/cost-optimizer";
import { ServiceCost } from "@/lib/cost-tracking/service-costs";
import { addSecurityHeaders } from "@/lib/middleware/security";
import { addCacheHeaders } from "@/lib/middleware/cache";

export const dynamic = "force-dynamic";

/**
 * GET /api/cost/metrics
 * Get aggregated cost metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Get cost history from monitor
    const costHistory = costMonitor.getCostHistory(90); // Last 90 days

    // If no cost history, return empty metrics (in production, fetch from database)
    if (costHistory.length === 0) {
      // TODO: Fetch actual costs from service APIs or database
      // For now, return structure with zero costs
      const emptyMetrics = {
        totalMonthly: 0,
        totalDaily: 0,
        byService: [],
        trends: [],
        forecast: {
          nextMonth: 0,
          nextQuarter: 0,
          nextYear: 0,
        },
      };

      const response = NextResponse.json(emptyMetrics);
      addSecurityHeaders(response);
      addCacheHeaders(response, { maxAge: 300, private: true }); // Cache for 5 minutes
      return response;
    }

    // Aggregate costs
    const metrics = CostAggregator.aggregateCosts(costHistory);

    // Get alerts
    const alerts = costMonitor.getActiveAlerts();

    // Get recommendations
    const recommendations = CostOptimizer.analyzeAndRecommend(metrics);

    // Get potential savings
    const potentialSavings = CostOptimizer.calculatePotentialSavings(recommendations);
    const quickWins = CostOptimizer.getQuickWins(recommendations);

    const response = NextResponse.json({
      metrics,
      alerts,
      recommendations,
      potentialSavings,
      quickWins: quickWins.length,
      lastUpdated: new Date().toISOString(),
    });

    addSecurityHeaders(response);
    addCacheHeaders(response, { maxAge: 300, private: true }); // Cache for 5 minutes
    return response;
  } catch (error) {
    console.error("Error fetching cost metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost metrics" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cost/metrics
 * Record a cost (for manual entry or webhook)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cost: ServiceCost = {
      service: body.service,
      category: body.category || "general",
      amount: parseFloat(body.amount),
      currency: body.currency || "USD",
      period: body.period || "monthly",
      timestamp: body.timestamp || Date.now(),
      metadata: body.metadata,
    };

    // Validate
    if (!cost.service || !cost.amount || cost.amount < 0) {
      return NextResponse.json(
        { error: "Invalid cost data" },
        { status: 400 }
      );
    }

    // Record cost
    costMonitor.recordCost(cost);

    const response = NextResponse.json({ success: true, cost });
    addSecurityHeaders(response);
    return response;
  } catch (error) {
    console.error("Error recording cost:", error);
    return NextResponse.json(
      { error: "Failed to record cost" },
      { status: 500 }
    );
  }
}
