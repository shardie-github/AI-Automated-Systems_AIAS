import { NextRequest, NextResponse } from "next/server";
import { processTrialEmailsForUser, processAllTrialEmails } from "@/lib/email-cadence/sender";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging/structured-logger";

/**
 * POST /api/trial/emails/send
 * Send trial emails (can be called for specific user or all users)
 * 
 * Body: { userId?: string } - If userId provided, send for that user only
 * If no userId, process all trial users (for cron job)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId } = body;

    if (userId) {
      // Send for specific user
      await processTrialEmailsForUser(userId);
      return NextResponse.json({ success: true, message: "Email processed for user" });
    } else {
      // Process all trial users (for cron job)
      // Check for admin/auth token if needed
      const authHeader = request.headers.get("authorization");
      const cronSecret = process.env.CRON_SECRET;
      
      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      await processAllTrialEmails();
      return NextResponse.json({ success: true, message: "All trial emails processed" });
    }
  } catch (error) {
    logger.error(
      "Error processing trial emails",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trial/emails/send?userId=xxx
 * Trigger email send for specific user (for testing)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const targetUserId = searchParams.get("userId") || user.id;

    await processTrialEmailsForUser(targetUserId);
    return NextResponse.json({ success: true, message: "Email processed" });
  } catch (error) {
    logger.error(
      "Error processing trial email",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
