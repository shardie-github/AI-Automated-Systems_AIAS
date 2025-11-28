/**
 * Experiment Tracking — AIAS Platform
 * Tracks events for pricing and offer experiments
 * Based on experiments.yaml requirements
 */

import { AnalyticsService } from "@/src/lib/analytics";

export interface ExperimentEvent {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  variant?: string;
}

/**
 * Required events from experiments.yaml
 */
export const EXPERIMENT_EVENTS = {
  PRICING_PAGE_VIEWED: "PricingPageViewed",
  PLAN_SELECTED: "PlanSelected",
  CHECKOUT_STARTED: "CheckoutStarted",
  CHECKOUT_COMPLETED: "CheckoutCompleted",
  TRIAL_ACTIVATED: "TrialActivated",
  TRIAL_CONVERTED: "TrialConverted",
  WORKFLOW_DEPLOYED: "WorkflowDeployed",
  UPGRADE_PROMPTED: "UpgradePrompted",
  UPGRADE_COMPLETED: "UpgradeCompleted",
} as const;

/**
 * Experiment tracking service
 */
export class ExperimentTracker {
  private analytics: AnalyticsService;

  constructor(analytics: AnalyticsService) {
    this.analytics = analytics;
  }

  /**
   * Track pricing page view with variant assignment
   */
  async trackPricingPageView(variant: string, userSegment?: string, referrer?: string) {
    await this.analytics.trackEvent(EXPERIMENT_EVENTS.PRICING_PAGE_VIEWED, {
      variant,
      user_segment: userSegment,
      referrer: referrer || (typeof window !== "undefined" ? document.referrer : undefined),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track plan selection
   */
  async trackPlanSelected(
    planName: string,
    price: number,
    billingPeriod: "month" | "year",
    variant: string,
    userId?: string
  ) {
    await this.analytics.trackEvent(
      EXPERIMENT_EVENTS.PLAN_SELECTED,
      {
        plan_name: planName,
        price,
        billing_period: billingPeriod,
        variant,
      },
      userId
    );
  }

  /**
   * Track checkout started
   */
  async trackCheckoutStarted(planName: string, price: number, variant: string, userId?: string) {
    await this.analytics.trackEvent(
      EXPERIMENT_EVENTS.CHECKOUT_STARTED,
      {
        plan_name: planName,
        price,
        variant,
      },
      userId
    );
  }

  /**
   * Track checkout completed
   */
  async trackCheckoutCompleted(
    planName: string,
    price: number,
    _userId: string,
    variant: string,
    transactionId?: string
  ) {
    await this.analytics.trackRevenue(
      EXPERIMENT_EVENTS.CHECKOUT_COMPLETED,
      price,
      "USD", // TODO: Get from user's currency preference
      {
        plan_name: planName,
        variant,
        transaction_id: transactionId,
      }
    );
  }

  /**
   * Track trial activation
   */
  async trackTrialActivated(planName: string, variant: string, userId: string) {
    await this.analytics.trackEvent(
      EXPERIMENT_EVENTS.TRIAL_ACTIVATED,
      {
        plan_name: planName,
        variant,
      },
      userId
    );
  }

  /**
   * Track trial conversion to paid
   */
  async trackTrialConverted(
    planName: string,
    conversionDate: Date,
    variant: string,
    userId: string
  ) {
    await this.analytics.trackEvent(
      EXPERIMENT_EVENTS.TRIAL_CONVERTED,
      {
        plan_name: planName,
        conversion_date: conversionDate.toISOString(),
        variant,
      },
      userId
    );
  }

  /**
   * Track workflow deployment (activation metric)
   */
  async trackWorkflowDeployed(
    workflowId: string,
    userId: string,
    variant: string,
    daysSinceSignup: number
  ) {
    await this.analytics.trackEvent(
      EXPERIMENT_EVENTS.WORKFLOW_DEPLOYED,
      {
        workflow_id: workflowId,
        variant,
        days_since_signup: daysSinceSignup,
      },
      userId
    );
  }

  /**
   * Track upgrade prompt shown
   */
  async trackUpgradePrompted(
    fromPlan: string,
    toPlan: string,
    variant: string,
    userId: string
  ) {
    await this.analytics.trackEvent(
      EXPERIMENT_EVENTS.UPGRADE_PROMPTED,
      {
        from_plan: fromPlan,
        to_plan: toPlan,
        variant,
      },
      userId
    );
  }

  /**
   * Track upgrade completed
   */
  async trackUpgradeCompleted(
    fromPlan: string,
    toPlan: string,
    variant: string,
    userId: string
  ) {
    await this.analytics.trackEvent(
      EXPERIMENT_EVENTS.UPGRADE_COMPLETED,
      {
        from_plan: fromPlan,
        to_plan: toPlan,
        variant,
      },
      userId
    );
  }
}

/**
 * Helper function to get experiment variant assignment
 * Uses consistent hashing based on user ID for stable assignment
 */
export function getExperimentVariant(
  experimentId: string,
  userId?: string,
  sessionId?: string
): string {
  // Use user ID if available, otherwise session ID
  const identifier = userId || sessionId || Math.random().toString();
  
  // Simple hash function for consistent assignment
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Get experiment configuration (would come from feature flag system)
  const experimentConfig = getExperimentConfig(experimentId);
  const variants = experimentConfig.variants || ["control"];
  
  // Assign to variant based on hash
  const variantIndex = Math.abs(hash) % variants.length;
  return variants[variantIndex];
}

/**
 * Get experiment configuration
 * TODO: Replace with actual feature flag system (LaunchDarkly, Split.io, etc.)
 */
function getExperimentConfig(experimentId: string) {
  // Default configurations from experiments.yaml
  const configs: Record<string, { variants: string[] }> = {
    exp_price_starter: {
      variants: ["variant_a_lower", "variant_b_control", "variant_c_higher"],
    },
    exp_free_tier: {
      variants: ["variant_a_free_tier", "variant_b_trial", "variant_c_hybrid"],
    },
    exp_value_metric: {
      variants: ["variant_a_agent_focused", "variant_b_automation_focused", "variant_c_outcome_focused"],
    },
    exp_annual_discount: {
      variants: ["variant_a_10_percent", "variant_b_20_percent", "variant_c_none"],
    },
    exp_onboarding: {
      variants: ["variant_a_self_serve", "variant_b_done_for_you", "variant_c_hybrid"],
    },
    exp_feature_gating: {
      variants: ["variant_a_restrictive", "variant_b_generous"],
    },
  };
  
  return configs[experimentId] || { variants: ["control"] };
}

/**
 * Client-side tracking helper (for use in React components)
 */
export function useExperimentTracking() {
  // This would be implemented with React hooks if needed
  // For now, return a simple object with tracking functions
  return {
    trackPricingPageView: (variant: string) => {
      if (typeof window !== "undefined") {
        // Track via telemetry API
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: EXPERIMENT_EVENTS.PRICING_PAGE_VIEWED,
            properties: { variant },
          }),
        }).catch(console.error);
      }
    },
  };
}
