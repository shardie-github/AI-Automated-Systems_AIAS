import { NextRequest, NextResponse } from "next/server";
import { processAllTrialEmails } from "@/lib/email-cadence/sender";
import { logger } from "@/lib/logging/structured-logger";

/**
 * POST /api/cron/trial-emails
 * Cron job endpoint to process all trial emails
 * 
 * Set up in Vercel Cron or similar:
 * - Schedule: Daily at 9 AM UTC
 * - Endpoint: /api/cron/trial-emails
 * - Method: POST
 * - Headers: Authorization: Bearer ${CRON_SECRET}
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn("Unauthorized cron request", { 
        hasAuth: !!authHeader,
        hasSecret: !!cronSecret,
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    logger.info("Starting trial email processing cron job");

    // Process all trial emails
    await processAllTrialEmails();

    logger.info("Trial email processing cron job completed");

    return NextResponse.json({ 
      success: true, 
      message: "Trial emails processed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(
      "Error in trial emails cron job",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support GET for manual triggering (with auth)
export async function GET(request: NextRequest) {
  return POST(request);
}
