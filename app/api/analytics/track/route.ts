import { NextRequest, NextResponse } from "next/server";
import { conversionTracker } from "@/lib/analytics/conversion-tracking";
import { databasePMFTracker } from "@/lib/analytics/database-integration";
import { logger } from "@/lib/logging/structured-logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Track the event in memory
    await conversionTracker.track(body.event, body.properties);
    
    // Also track in database
    try {
      await databasePMFTracker.trackConversionEvent(
        body.event,
        body.properties?.userId,
        body.sessionId || "unknown",
        body.properties
      );
    } catch (dbError) {
      // Continue even if database fails
      logger.warn("Database tracking failed, using in-memory only", { error: dbError instanceof Error ? dbError.message : "Unknown error" });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const funnelMetrics = conversionTracker.getFunnelMetrics();
    return NextResponse.json({ funnel: funnelMetrics });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
