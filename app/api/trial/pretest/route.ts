import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { savePretestAnswers } from "@/lib/trial/user-plan";
import { logger } from "@/lib/logging/structured-logger";

/**
 * POST /api/trial/pretest
 * Save pre-test questionnaire answers
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { answers } = body;

    if (!answers) {
      return NextResponse.json(
        { error: "Answers are required" },
        { status: 400 }
      );
    }

    // Save to database
    const result = await savePretestAnswers(user.id, answers);

    if (!result.success) {
      logger.error("Failed to save pretest answers", new Error(result.error), {
        userId: user.id,
      });
      return NextResponse.json(
        { error: result.error || "Failed to save answers" },
        { status: 500 }
      );
    }

    logger.info("Pretest answers saved", { userId: user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(
      "Error saving pretest answers",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
