import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { SystemError, ValidationError, formatError } from "@/lib/errors";
import { createPOSTHandler } from "@/lib/api/route-handler";
import { recordError } from "@/lib/utils/error-detection";
import { retry } from "@/lib/utils/retry";
import { telemetry } from "@/lib/monitoring/enhanced-telemetry";
import { z } from "zod";
import { useCanaryCheckout, recordCheckoutRequest, getCheckoutHandler } from "@/lib/canary/checkout";

// Load environment variables dynamically - no hardcoded values
const stripe = new Stripe(env.stripe.secretKey!, {
  apiVersion: "2024-11-20.acacia",
});

const supabase = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey
);

const XP_MULTIPLIERS: Record<string, number> = {
  starter: 1.25,
  pro: 1.5,
  enterprise: 2.0,
};

interface CheckoutResponse {
  sessionId?: string;
  error?: string;
}

/**
 * Checkout request schema
 */
const checkoutSchema = z.object({
  priceId: z.string().min(1, "Price ID is required"),
  userId: z.string().uuid("User ID must be a valid UUID"),
  tier: z.enum(["starter", "pro", "enterprise"], {
    errorMap: () => ({ message: "Tier must be one of: starter, pro, enterprise" }),
  }),
});

/**
 * Create Stripe checkout session endpoint
 * Migrated to App Router with route handler utility
 */
export const POST = createPOSTHandler(
  async (context) => {
    const { request } = context;
    const startTime = Date.now();
    
    // Body is already validated by route handler
    const body = await request.json();
    const { priceId, userId, tier } = checkoutSchema.parse(body);
    
    // Check if canary deployment is enabled for this user
    const handlerType = await getCheckoutHandler(userId);
    const isCanary = handlerType === 'canary';

    // Verify user exists (optional security check)
    // Note: This adds latency - consider caching or removing if not critical
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      const duration = Date.now() - startTime;
      await recordCheckoutRequest(userId, false, duration);
      
      const error = new ValidationError("User not found");
      const formatted = formatError(error);
      return NextResponse.json(
        { error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    // Retry Stripe API call with exponential backoff
    const session = await retry(
      async () => {
        return await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: `${request.nextUrl.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${request.nextUrl.origin}/billing`,
          client_reference_id: userId,
          metadata: {
            userId,
            tier,
          },
        });
      },
      {
        maxAttempts: 3,
        initialDelayMs: 1000,
        onRetry: (attempt, err) => {
          console.warn(`Retrying Stripe checkout (attempt ${attempt})`, { error: err.message });
        },
      }
    );

    const duration = Date.now() - startTime;
    
    // Record for canary monitoring
    await recordCheckoutRequest(userId, true, duration);
    
    // Track performance
    telemetry.trackPerformance({
      name: "stripe_checkout_create",
      value: duration,
      unit: "ms",
      tags: { tier, status: "success", canary: isCanary.toString() },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      canary: isCanary, // Include canary flag in response for debugging
    });
  },
  {
    requireAuth: true, // Require authentication
    validateBody: checkoutSchema,
    cache: { enabled: false }, // Don't cache POST requests
    // Note: Canary monitoring happens inside handler
    // Errors are automatically tracked by route handler
  }
);
