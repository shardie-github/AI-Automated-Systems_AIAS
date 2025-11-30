import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerClient();

    // Get signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: signups } = await supabase
      .from("profiles")
      .select("id")
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Get onboarding started (users who started onboarding)
    const { data: onboardingStarted } = await supabase
      .from("user_activations")
      .select("id")
      .not("signup_date", "is", null)
      .gte("signup_date", thirtyDaysAgo.toISOString());

    // Get onboarding completed (users who completed onboarding - approximation: created first workflow)
    const { data: onboardingCompleted } = await supabase
      .from("user_activations")
      .select("id")
      .not("first_workflow_created_at", "is", null)
      .gte("signup_date", thirtyDaysAgo.toISOString());

    // Get activations (users who created first workflow)
    const activations = onboardingCompleted;

    // Get upgrades (users with paid subscriptions) - TODO: Query Stripe
    const upgrades = 0; // TODO: Query Stripe for paid subscriptions

    // Get referrals (users who referred friends)
    const { data: referrals } = await supabase
      .from("referrals")
      .select("id")
      .gte("created_at", thirtyDaysAgo.toISOString());

    const signupCount = signups?.length || 0;
    const onboardingStartedCount = onboardingStarted?.length || 0;
    const onboardingCompletedCount = onboardingCompleted?.length || 0;
    const activationCount = activations?.length || 0;
    const upgradeCount = upgrades;
    const referralCount = referrals?.length || 0;

    const calculateRate = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return (current / previous) * 100;
    };

    const funnel = {
      signups: signupCount,
      onboardingStarted: onboardingStartedCount,
      onboardingCompleted: onboardingCompletedCount,
      activations: activationCount,
      upgrades: upgradeCount,
      referrals: referralCount,
      conversionRates: {
        signupToOnboarding: calculateRate(onboardingStartedCount, signupCount),
        onboardingToCompletion: calculateRate(onboardingCompletedCount, onboardingStartedCount),
        completionToActivation: calculateRate(activationCount, onboardingCompletedCount),
        activationToUpgrade: upgradeCount > 0 ? calculateRate(upgradeCount, activationCount) : 0,
        upgradeToReferral: upgradeCount > 0 ? calculateRate(referralCount, upgradeCount) : 0,
      },
      dropOffRates: {
        signupToOnboarding: 100 - calculateRate(onboardingStartedCount, signupCount),
        onboardingToCompletion: 100 - calculateRate(onboardingCompletedCount, onboardingStartedCount),
        completionToActivation: 100 - calculateRate(activationCount, onboardingCompletedCount),
        activationToUpgrade: 100 - (upgradeCount > 0 ? calculateRate(upgradeCount, activationCount) : 0),
      },
    };

    return NextResponse.json(funnel);
  } catch (error) {
    console.error("Error fetching PLG funnel:", error);
    return NextResponse.json(
      { error: "Failed to fetch PLG funnel" },
      { status: 500 }
    );
  }
}
