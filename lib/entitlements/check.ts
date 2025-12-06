/**
 * Entitlement Checking
 * Verifies user access to features based on their plan
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export type PlanTier = "free" | "trial" | "starter" | "pro" | "enterprise";

export interface FeatureAccess {
  allowed: boolean;
  reason?: string;
  upgradePlan?: PlanTier;
}

/**
 * Feature definitions with plan requirements
 */
export const FEATURES = {
  workflows: {
    free: { max: 3 },
    trial: { max: 3 },
    starter: { max: 5 },
    pro: { max: 20 },
    enterprise: { max: -1 }, // unlimited
  },
  automations: {
    free: { monthly: 100 },
    trial: { monthly: 100 },
    starter: { monthly: 10000 },
    pro: { monthly: 50000 },
    enterprise: { monthly: -1 }, // unlimited
  },
  integrations: {
    free: { max: 1 },
    trial: { max: 2 },
    starter: { max: 5 },
    pro: { max: 15 },
    enterprise: { max: -1 }, // unlimited
  },
  api_access: {
    free: false,
    trial: false,
    starter: false,
    pro: true,
    enterprise: true,
  },
  team_collaboration: {
    free: false,
    trial: false,
    starter: false,
    pro: false, // coming soon
    enterprise: true,
  },
  advanced_analytics: {
    free: false,
    trial: false,
    starter: false,
    pro: true,
    enterprise: true,
  },
  white_label: {
    free: false,
    trial: false,
    starter: false,
    pro: false,
    enterprise: true,
  },
} as const;

/**
 * Check if user can access a feature
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof typeof FEATURES
): Promise<FeatureAccess> {
  try {
    // Get user plan
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("plan_id, subscription_plans(tier)")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    let plan: PlanTier = "free";
    if (subscription?.subscription_plans?.tier) {
      plan = subscription.subscription_plans.tier as PlanTier;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, trial_started_at")
        .eq("id", userId)
        .single();

      if (profile?.subscription_tier) {
        plan = profile.subscription_tier.toLowerCase() as PlanTier;
      } else if (profile?.trial_started_at) {
        plan = "trial";
      }
    }

    // Normalize plan
    if (plan === "professional") plan = "pro";
    if (plan === "standard") plan = "starter";

    const featureConfig = FEATURES[feature];
    const planAccess = featureConfig[plan];

    // Check boolean features
    if (typeof planAccess === "boolean") {
      if (planAccess) {
        return { allowed: true };
      } else {
        // Find which plan has this feature
        const upgradePlan = Object.keys(featureConfig).find(
          (p) => featureConfig[p as PlanTier] === true
        ) as PlanTier | undefined;

        return {
          allowed: false,
          reason: `This feature requires ${upgradePlan || "Pro"} plan`,
          upgradePlan: upgradePlan || "pro",
        };
      }
    }

    // Check limit-based features
    if (typeof planAccess === "object") {
      // For now, just check if feature exists for plan
      // Actual limit checking is done elsewhere (usage tracking)
      return { allowed: true };
    }

    return { allowed: false, reason: "Feature not available" };
  } catch (error) {
    logger.error("Failed to check feature access", error instanceof Error ? error : new Error(String(error)), {
      userId,
      feature,
    });
    return { allowed: false, reason: "Error checking access" };
  }
}

/**
 * Check if user can create more workflows
 */
export async function canCreateWorkflow(userId: string): Promise<FeatureAccess> {
  try {
    const access = await checkFeatureAccess(userId, "workflows");
    if (!access.allowed) {
      return access;
    }

    // Get current workflow count
    const { count } = await supabase
      .from("workflows")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    // Get user plan
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("plan_id, subscription_plans(tier)")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    let plan: PlanTier = "free";
    if (subscription?.subscription_plans?.tier) {
      plan = subscription.subscription_plans.tier as PlanTier;
    }

    const maxWorkflows = FEATURES.workflows[plan]?.max || 3;

    if (maxWorkflows === -1) {
      return { allowed: true }; // Unlimited
    }

    if ((count || 0) >= maxWorkflows) {
      return {
        allowed: false,
        reason: `You've reached your workflow limit (${maxWorkflows}). Upgrade to create more.`,
        upgradePlan: plan === "free" || plan === "trial" ? "starter" : "pro",
      };
    }

    return { allowed: true };
  } catch (error) {
    logger.error("Failed to check workflow creation", error instanceof Error ? error : new Error(String(error)), {
      userId,
    });
    return { allowed: false, reason: "Error checking workflow limit" };
  }
}
