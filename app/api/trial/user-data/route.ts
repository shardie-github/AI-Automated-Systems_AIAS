import { NextRequest, NextResponse } from "next/server";
import { getUserPlanData } from "@/lib/trial/user-plan";
import { handleApiError } from "@/lib/api/route-handler";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /api/trial/user-data
 * Get current user's trial and plan data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userData = await getUserPlanData(user.id);

    return NextResponse.json({
      plan: userData.plan,
      trialStartDate: userData.trialStartDate?.toISOString(),
      trialEndDate: userData.trialEndDate?.toISOString(),
      trialDaysRemaining: userData.trialDaysRemaining,
      isFirstVisit: userData.isFirstVisit,
      hasCompletedPretest: userData.hasCompletedPretest,
      hasConnectedEmail: userData.hasConnectedEmail,
      hasCreatedWorkflow: userData.hasCreatedWorkflow,
    });
  } catch (error) {
    return handleApiError(error, "Failed to get user data");
  }
}
