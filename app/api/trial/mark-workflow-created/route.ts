import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { markWorkflowCreated } from "@/lib/trial/user-plan";
import { logger } from "@/lib/logging/structured-logger";

/**
 * POST /api/trial/mark-workflow-created
 * Mark user's first workflow as created
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

    await markWorkflowCreated(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(
      "Error marking workflow created",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
