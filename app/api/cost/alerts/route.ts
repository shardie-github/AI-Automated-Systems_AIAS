/**
 * Cost Alerts API
 * 
 * Get cost alerts and notifications.
 */

import { NextRequest, NextResponse } from "next/server";
import { costMonitor } from "@/lib/cost-tracking/cost-monitor";
import { addSecurityHeaders } from "@/lib/middleware/security";

export const dynamic = "force-dynamic";

/**
 * GET /api/cost/alerts
 * Get cost alerts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const activeOnly = searchParams.get("active") === "true";

    const alerts = activeOnly
      ? costMonitor.getActiveAlerts()
      : costMonitor.getAlerts(limit);

    const response = NextResponse.json({
      alerts,
      count: alerts.length,
      activeCount: costMonitor.getActiveAlerts().length,
    });

    addSecurityHeaders(response);
    return response;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
