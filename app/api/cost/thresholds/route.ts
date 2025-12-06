/**
 * Cost Thresholds API
 * 
 * Manage cost thresholds and alerts.
 */

import { NextRequest, NextResponse } from "next/server";
import { costMonitor } from "@/lib/cost-tracking/cost-monitor";
import { CostThreshold } from "@/lib/cost-tracking/cost-monitor";
import { addSecurityHeaders } from "@/lib/middleware/security";

export const dynamic = "force-dynamic";

/**
 * GET /api/cost/thresholds
 * Get all cost thresholds
 */
export async function GET() {
  try {
    const thresholds = costMonitor.getThresholds();
    const response = NextResponse.json({ thresholds });
    addSecurityHeaders(response);
    return response;
  } catch (error) {
    console.error("Error fetching thresholds:", error);
    return NextResponse.json(
      { error: "Failed to fetch thresholds" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cost/thresholds
 * Add a new cost threshold
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const threshold: CostThreshold = {
      service: body.service,
      category: body.category,
      daily: body.daily ? parseFloat(body.daily) : undefined,
      monthly: body.monthly ? parseFloat(body.monthly) : undefined,
      alertEmail: body.alertEmail,
    };

    // Validate
    if (!threshold.daily && !threshold.monthly) {
      return NextResponse.json(
        { error: "Must specify daily or monthly threshold" },
        { status: 400 }
      );
    }

    costMonitor.addThreshold(threshold);

    const response = NextResponse.json({ success: true, threshold });
    addSecurityHeaders(response);
    return response;
  } catch (error) {
    console.error("Error adding threshold:", error);
    return NextResponse.json(
      { error: "Failed to add threshold" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cost/thresholds
 * Remove a cost threshold
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get("service");

    costMonitor.removeThreshold(service || undefined);

    const response = NextResponse.json({ success: true });
    addSecurityHeaders(response);
    return response;
  } catch (error) {
    console.error("Error removing threshold:", error);
    return NextResponse.json(
      { error: "Failed to remove threshold" },
      { status: 500 }
    );
  }
}
