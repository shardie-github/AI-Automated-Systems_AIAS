import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { markEmailConnected } from "@/lib/trial/user-plan";
import { logger } from "@/lib/logging/structured-logger";

/**
 * POST /api/trial/mark-email-connected
 * Mark user's email as connected
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await markEmailConnected(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(
      "Error marking email connected",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
