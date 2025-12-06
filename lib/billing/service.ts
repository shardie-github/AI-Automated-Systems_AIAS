/**
 * Billing Service Interface
 * Scaffold for future billing integration (Stripe, Paddle, etc.)
 * 
 * This is a non-disruptive scaffold - does NOT implement actual billing
 * Provides interfaces and placeholders for future integration
 */

import { logger } from "@/lib/logging/structured-logger";

export type PlanTier = "free" | "starter" | "pro" | "enterprise";
export type BillingPeriod = "monthly" | "annual";

export interface Subscription {
  id: string;
  userId: string;
  planTier: PlanTier;
  billingPeriod: BillingPeriod;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank_account";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

/**
 * Billing Service Interface
 * Implement this with your billing provider (Stripe, Paddle, etc.)
 */
export interface IBillingService {
  /**
   * Create a subscription
   */
  createSubscription(
    userId: string,
    planTier: PlanTier,
    billingPeriod: BillingPeriod,
    paymentMethodId?: string
  ): Promise<Subscription>;

  /**
   * Update subscription plan
   */
  updateSubscription(
    subscriptionId: string,
    newPlanTier: PlanTier,
    billingPeriod?: BillingPeriod
  ): Promise<Subscription>;

  /**
   * Cancel subscription
   */
  cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd?: boolean
  ): Promise<Subscription>;

  /**
   * Get subscription
   */
  getSubscription(subscriptionId: string): Promise<Subscription | null>;

  /**
   * Get user's subscription
   */
  getUserSubscription(userId: string): Promise<Subscription | null>;

  /**
   * Add payment method
   */
  addPaymentMethod(
    userId: string,
    paymentMethodData: unknown
  ): Promise<PaymentMethod>;

  /**
   * Get payment methods
   */
  getPaymentMethods(userId: string): Promise<PaymentMethod[]>;
}

/**
 * Placeholder Billing Service
 * Returns mock data - replace with actual billing provider implementation
 */
export class PlaceholderBillingService implements IBillingService {
  async createSubscription(
    userId: string,
    planTier: PlanTier,
    billingPeriod: BillingPeriod,
    _paymentMethodId?: string
  ): Promise<Subscription> {
    logger.info("Placeholder: Creating subscription", {
      userId,
      planTier,
      billingPeriod,
    });

    // In production, this would call Stripe/Paddle API
    // For now, return mock subscription
    return {
      id: `sub_${Date.now()}`,
      userId,
      planTier,
      billingPeriod,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (billingPeriod === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    };
  }

  async updateSubscription(
    subscriptionId: string,
    newPlanTier: PlanTier,
    billingPeriod?: BillingPeriod
  ): Promise<Subscription> {
    logger.info("Placeholder: Updating subscription", {
      subscriptionId,
      newPlanTier,
      billingPeriod,
    });

    // In production, this would call Stripe/Paddle API
    throw new Error("Billing service not implemented. Use placeholder for development only.");
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Subscription> {
    logger.info("Placeholder: Canceling subscription", {
      subscriptionId,
      cancelAtPeriodEnd,
    });

    // In production, this would call Stripe/Paddle API
    throw new Error("Billing service not implemented. Use placeholder for development only.");
  }

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    logger.info("Placeholder: Getting subscription", { subscriptionId });
    return null;
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    logger.info("Placeholder: Getting user subscription", { userId });
    return null;
  }

  async addPaymentMethod(
    userId: string,
    paymentMethodData: unknown
  ): Promise<PaymentMethod> {
    logger.info("Placeholder: Adding payment method", { userId });
    throw new Error("Billing service not implemented. Use placeholder for development only.");
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    logger.info("Placeholder: Getting payment methods", { userId });
    return [];
  }
}

// Export singleton instance
export const billingService: IBillingService = new PlaceholderBillingService();

/**
 * Initialize billing service with actual provider
 * Call this when ready to integrate Stripe/Paddle
 */
export function initializeBillingService(provider: "stripe" | "paddle"): IBillingService {
  logger.info("Initializing billing service", { provider });
  
  // TODO: Implement actual billing provider
  // if (provider === "stripe") {
  //   return new StripeBillingService();
  // } else if (provider === "paddle") {
  //   return new PaddleBillingService();
  // }
  
  return new PlaceholderBillingService();
}
