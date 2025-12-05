/**
 * User Plan Management
 * Get user plan, trial status, and related data from Supabase
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PlanTier } from "@/config/plans";

export interface UserPlanData {
  plan: PlanTier;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  trialDaysRemaining: number | null;
  isFirstVisit: boolean;
  hasCompletedPretest: boolean;
  hasConnectedEmail: boolean;
  hasCreatedWorkflow: boolean;
}

/**
 * Get user plan and trial data
 */
export async function getUserPlanData(userId: string): Promise<UserPlanData> {
  const supabase = await createServerSupabaseClient();

  // Get user profile with subscription info
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      id,
      subscription_tier,
      trial_started_at,
      created_at,
      pretest_completed,
      email_connected,
      workflows_created
    `)
    .eq("id", userId)
    .single();

  if (error || !profile) {
    // Default to free plan if user not found
    return {
      plan: "free",
      trialStartDate: null,
      trialEndDate: null,
      trialDaysRemaining: null,
      isFirstVisit: true,
      hasCompletedPretest: false,
      hasConnectedEmail: false,
      hasCreatedWorkflow: false,
    };
  }

  // Determine plan tier
  let plan: PlanTier = "free";
  if (profile.subscription_tier) {
    const tier = profile.subscription_tier.toLowerCase();
    if (tier === "starter" || tier === "pro") {
      plan = tier as PlanTier;
    } else if (tier === "trial" || profile.trial_started_at) {
      plan = "trial";
    }
  } else if (profile.trial_started_at) {
    plan = "trial";
  }

  // Calculate trial dates
  const trialStartDate = profile.trial_started_at
    ? new Date(profile.trial_started_at)
    : profile.created_at
    ? new Date(profile.created_at)
    : null;

  const trialEndDate = trialStartDate
    ? new Date(trialStartDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    : null;

  const trialDaysRemaining =
    trialEndDate && plan === "trial"
      ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  // Check if first visit (created in last 24 hours and no activity)
  const isFirstVisit =
    profile.created_at &&
    Date.now() - new Date(profile.created_at).getTime() < 24 * 60 * 60 * 1000 &&
    !profile.pretest_completed &&
    !profile.email_connected &&
    !profile.workflows_created;

  return {
    plan,
    trialStartDate,
    trialEndDate,
    trialDaysRemaining,
    isFirstVisit: !!isFirstVisit,
    hasCompletedPretest: profile.pretest_completed || false,
    hasConnectedEmail: profile.email_connected || false,
    hasCreatedWorkflow: profile.workflows_created || false,
  };
}

/**
 * Save pre-test answers to database
 */
export async function savePretestAnswers(
  userId: string,
  answers: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  try {
    // Save to pretest_answers table (create if doesn't exist)
    const { error: upsertError } = await supabase
      .from("pretest_answers")
      .upsert({
        user_id: userId,
        answers: answers,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      // If table doesn't exist, try updating profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          pretest_completed: true,
          pretest_answers: answers,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) {
        return { success: false, error: profileError.message };
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Mark email as connected
 */
export async function markEmailConnected(userId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  await supabase
    .from("profiles")
    .update({
      email_connected: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

/**
 * Mark workflow as created
 */
export async function markWorkflowCreated(userId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  await supabase
    .from("profiles")
    .update({
      workflows_created: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

/**
 * Start trial for user
 */
export async function startTrial(userId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  await supabase
    .from("profiles")
    .update({
      subscription_tier: "trial",
      trial_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}
