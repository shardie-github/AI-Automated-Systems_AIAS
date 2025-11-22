import { NextRequest, NextResponse } from "next/server";
import { createGETHandler } from "@/lib/api/route-handler";
import { getAllActivationMetrics, getFunnelMetrics } from "@/lib/analytics/metrics";

export const runtime = "edge";

/**
 * GET /api/admin/metrics
 * Get activation metrics for dashboard
 */
export const GET = createGETHandler(
  async (context) => {
    const { request } = context;

    // Get date range from query params (default to last 30 days)
    const days = parseInt(request.nextUrl.searchParams.get("days") || "30");

    try {
      const metrics = await getAllActivationMetrics(days);
      const funnel = await getFunnelMetrics(days);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return NextResponse.json({
        metrics: {
          activation_rate: Math.round(metrics.activationRate * 100) / 100,
          time_to_activation_ms: metrics.timeToActivation,
          time_to_activation_hours: Math.round((metrics.timeToActivation / (1000 * 60 * 60)) * 100) / 100,
          day_7_retention: Math.round(metrics.day7Retention * 100) / 100,
          total_signups: metrics.totalSignups,
          total_integrations: metrics.totalIntegrations,
          total_workflows: metrics.totalWorkflows,
          total_activations: metrics.totalActivations,
          unique_active_users: metrics.uniqueActiveUsers,
        },
        funnel: {
          signups: funnel.signups,
          integrations: funnel.integrations,
          workflows: funnel.workflows,
          activations: funnel.activations,
        },
        period: {
          days,
          start_date: startDate.toISOString(),
          end_date: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error calculating metrics", error);
      return NextResponse.json(
        { error: "Failed to calculate metrics" },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    cache: { enabled: true, ttl: 300 }, // Cache for 5 minutes
  }
);
