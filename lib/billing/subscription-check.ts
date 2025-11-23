/**
 * Subscription Check Service
 * Checks if a user has an active premium subscription via Stripe
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { logger } from '@/lib/logging/structured-logger';

export interface SubscriptionStatus {
  isPremium: boolean;
  plan?: string;
  expiresAt?: Date;
  cancelAtPeriodEnd?: boolean;
}

// Cache subscription status for 5 minutes
const subscriptionCache = new Map<string, { status: SubscriptionStatus; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Check if user has active premium subscription
 */
export async function checkPremiumSubscription(userId: string): Promise<SubscriptionStatus> {
  // Check cache first
  const cached = subscriptionCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.status;
  }

  try {
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

    // Check for active subscription in database
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      const status: SubscriptionStatus = { isPremium: false };
      subscriptionCache.set(userId, {
        status,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return status;
    }

    // Check if subscription is premium tier
    const isPremium = subscription.plan?.includes('premium') || 
                      subscription.plan?.includes('pro') ||
                      subscription.plan?.includes('enterprise') ||
                      false;

    const status: SubscriptionStatus = {
      isPremium,
      plan: subscription.plan,
      expiresAt: subscription.current_period_end ? new Date(subscription.current_period_end) : undefined,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    };

    // Cache the result
    subscriptionCache.set(userId, {
      status,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    logger.info('Subscription check completed', { userId, isPremium, plan: subscription.plan });
    return status;
  } catch (error) {
    logger.error('Failed to check subscription', {
      error: error instanceof Error ? error.message : String(error),
      userId,
    });
    
    // Fail gracefully - assume not premium
    const status: SubscriptionStatus = { isPremium: false };
    subscriptionCache.set(userId, {
      status,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return status;
  }
}

/**
 * Check subscription via Stripe API (more accurate but slower)
 */
export async function checkPremiumSubscriptionViaStripe(
  userId: string,
  stripeCustomerId?: string
): Promise<SubscriptionStatus> {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      logger.warn('Stripe secret key not configured, falling back to database check');
      return checkPremiumSubscription(userId);
    }

    // Get Stripe customer ID from database if not provided
    if (!stripeCustomerId) {
      const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
      const { data: user } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      stripeCustomerId = user?.stripe_customer_id;
    }

    if (!stripeCustomerId) {
      return { isPremium: false };
    }

    // Check Stripe subscriptions
    const response = await fetch(`https://api.stripe.com/v1/customers/${stripeCustomerId}/subscriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.status}`);
    }

    const data = await response.json();
    const activeSubscriptions = data.data.filter((sub: any) => 
      sub.status === 'active' || sub.status === 'trialing'
    );

    if (activeSubscriptions.length === 0) {
      return { isPremium: false };
    }

    // Check if any subscription is premium tier
    const premiumSubscription = activeSubscriptions.find((sub: any) => {
      const planId = sub.items?.data[0]?.price?.id || '';
      return planId.includes('premium') || 
             planId.includes('pro') || 
             planId.includes('enterprise');
    });

    const status: SubscriptionStatus = {
      isPremium: !!premiumSubscription,
      plan: premiumSubscription?.items?.data[0]?.price?.nickname,
      expiresAt: premiumSubscription?.current_period_end 
        ? new Date(premiumSubscription.current_period_end * 1000)
        : undefined,
      cancelAtPeriodEnd: premiumSubscription?.cancel_at_period_end || false,
    };

    // Cache the result
    subscriptionCache.set(userId, {
      status,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return status;
  } catch (error) {
    logger.error('Failed to check subscription via Stripe', {
      error: error instanceof Error ? error.message : String(error),
      userId,
    });
    
    // Fallback to database check
    return checkPremiumSubscription(userId);
  }
}

/**
 * Clear subscription cache for a user (call after subscription changes)
 */
export function clearSubscriptionCache(userId: string): void {
  subscriptionCache.delete(userId);
}

/**
 * Clear all subscription cache
 */
export function clearAllSubscriptionCache(): void {
  subscriptionCache.clear();
}
