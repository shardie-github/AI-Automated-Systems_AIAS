/**
 * Billing Stub
 * CFO Mode: Idempotency and ledger tracking
 */

import Stripe from 'stripe';
import { env } from '@/lib/env';
import { generateIdempotencyKey, checkIdempotencyKey, recordIdempotencyKey, recordLedgerEntry } from '@/lib/billing/idempotency';

// CTO Mode: Use centralized env module - never destructure process.env
const stripe = env.stripe.secretKey
  ? new Stripe(env.stripe.secretKey, {
      apiVersion: '2024-11-20.acacia',
    })
  : null;

export function isBillingEnabled(): boolean {
  // CTO Mode: Use centralized env module
  return env.stripe.secretKey !== undefined && env.stripe.secretKey !== '';
}

export async function handleStripeWebhook(
  payload: string,
  signature: string
): Promise<{ processed: boolean; error?: string }> {
  if (!isBillingEnabled() || !stripe) {
    return { processed: false, error: 'Billing disabled' };
  }

  try {
    // CTO Mode: Use centralized env module
    const webhookSecret = env.stripe.webhookSecret;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not set');
    }

    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { processed: true };
  } catch (error: any) {
    return { processed: false, error: error.message };
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { upsert } = await import('@/lib/supabase/db-helpers');
  
  // Get org_id from customer metadata if available
  const customerId = subscription.customer as string;
  const orgId = subscription.metadata?.org_id || '';
  
  // CFO Mode: Generate idempotency key for webhook processing
  const idempotencyKey = generateIdempotencyKey(
    'subscription_webhook',
    subscription.id,
    { type: subscription.object, status: subscription.status }
  );
  
  // Check if already processed
  const idempotencyCheck = await checkIdempotencyKey(idempotencyKey);
  if (idempotencyCheck.exists) {
    // Already processed, skip
    return;
  }
  
  await upsert('subscriptions', {
    stripe_subscription_id: subscription.id,
    status: mapStripeStatus(subscription.status),
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    stripe_customer_id: customerId,
    plan: 'BASIC',
    org_id: orgId,
  }, 'stripe_subscription_id');
  
  // Record idempotency key
  const requestHash = JSON.stringify({ subscription_id: subscription.id, status: subscription.status });
  await recordIdempotencyKey(
    idempotencyKey,
    'subscription_webhook',
    subscription.id,
    requestHash,
    { processed: true },
    'completed'
  );
  
  // CFO Mode: Record ledger entry if subscription is active and has amount
  if (subscription.status === 'active' && subscription.items.data[0]?.price) {
    const amountCents = subscription.items.data[0].price.unit_amount || 0;
    if (amountCents > 0 && orgId) {
      await recordLedgerEntry({
        transactionId: `stripe_sub_${subscription.id}`,
        idempotencyKey: generateIdempotencyKey('subscription_ledger', subscription.id, { amount: amountCents }),
        accountId: orgId,
        accountType: 'tenant',
        amountCents: amountCents,
        currency: subscription.items.data[0].price.currency.toUpperCase(),
        transactionType: 'subscription',
        sourceType: 'stripe',
        sourceId: subscription.id,
        description: `Subscription payment: ${subscription.id}`,
        metadata: {
          subscription_id: subscription.id,
          customer_id: customerId,
          period_start: subscription.current_period_start,
          period_end: subscription.current_period_end,
        },
      });
    }
  }
}

function mapStripeStatus(status: string): any {
  const mapping: Record<string, string> = {
    active: 'ACTIVE',
    canceled: 'CANCELED',
    incomplete: 'INCOMPLETE',
    past_due: 'PAST_DUE',
    trialing: 'TRIALING',
    unpaid: 'UNPAID',
  };
  return mapping[status] || 'UNPAID';
}
