/**
 * Plan Definitions
 * Centralized plan configuration and limits
 */

export type PlanTier = "free" | "trial" | "starter" | "pro" | "enterprise";

export interface PlanLimits {
  workflows: number; // -1 for unlimited
  automationsMonthly: number; // -1 for unlimited
  integrations: number; // -1 for unlimited
  apiAccess: boolean;
  teamCollaboration: boolean;
  advancedAnalytics: boolean;
  whiteLabel: boolean;
  supportLevel: "community" | "email" | "priority" | "dedicated";
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    workflows: 3,
    automationsMonthly: 100,
    integrations: 1,
    apiAccess: false,
    teamCollaboration: false,
    advancedAnalytics: false,
    whiteLabel: false,
    supportLevel: "community",
  },
  trial: {
    workflows: 3,
    automationsMonthly: 100,
    integrations: 2,
    apiAccess: false,
    teamCollaboration: false,
    advancedAnalytics: false,
    whiteLabel: false,
    supportLevel: "email",
  },
  starter: {
    workflows: 5,
    automationsMonthly: 10000,
    integrations: 5,
    apiAccess: false,
    teamCollaboration: false,
    advancedAnalytics: false,
    whiteLabel: false,
    supportLevel: "email",
  },
  pro: {
    workflows: 20,
    automationsMonthly: 50000,
    integrations: 15,
    apiAccess: true,
    teamCollaboration: false, // coming soon
    advancedAnalytics: true,
    whiteLabel: false,
    supportLevel: "priority",
  },
  enterprise: {
    workflows: -1, // unlimited
    automationsMonthly: -1, // unlimited
    integrations: -1, // unlimited
    apiAccess: true,
    teamCollaboration: true,
    advancedAnalytics: true,
    whiteLabel: true,
    supportLevel: "dedicated",
  },
};

/**
 * Get plan limits
 */
export function getPlanLimits(plan: PlanTier): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

/**
 * Check if plan has feature
 */
export function planHasFeature(plan: PlanTier, feature: keyof Omit<PlanLimits, "workflows" | "automationsMonthly" | "integrations" | "supportLevel">): boolean {
  const limits = getPlanLimits(plan);
  return limits[feature] === true;
}

/**
 * Get minimum plan for feature
 */
export function getMinimumPlanForFeature(
  feature: keyof Omit<PlanLimits, "workflows" | "automationsMonthly" | "integrations" | "supportLevel">
): PlanTier {
  const plans: PlanTier[] = ["free", "trial", "starter", "pro", "enterprise"];
  for (const plan of plans) {
    if (planHasFeature(plan, feature)) {
      return plan;
    }
  }
  return "enterprise";
}
