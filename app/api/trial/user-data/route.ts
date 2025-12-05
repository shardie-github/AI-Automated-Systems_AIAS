import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserPlanData } from "@/lib/trial/user-plan";
import { logger } from "@/lib/logging/structured-logger";

/**
 * GET /api/trial/user-data
 * Get user plan and trial data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userData = await getUserPlanData(user.id);

    return NextResponse.json(userData);
  } catch (error) {
    logger.error(
      "Error getting user plan data",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
