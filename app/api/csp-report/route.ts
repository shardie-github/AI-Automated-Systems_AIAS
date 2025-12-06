/**
 * CSP Violation Reporting Endpoint
 * 
 * Receives and logs Content Security Policy violations.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();

    // Log CSP violation
    logger.warn("CSP violation detected", undefined, {
      "csp-report": report["csp-report"],
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    // In production, you might want to:
    // - Send to monitoring service (Sentry, LogRocket, etc.)
    // - Store in database for analysis
    // - Alert security team for critical violations

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to process CSP report", error as Error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
