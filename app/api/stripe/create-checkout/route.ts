/**
 * Legacy Pages API Route Handler
 * 
 * ⚠️ DEPRECATED: This file uses Next.js Pages API format
 * 
 * New App Router version available at: app/api/stripe/create-checkout-app/route.ts
 * 
 * Migration plan:
 * 1. Update all clients to use /api/stripe/create-checkout-app
 * 2. Add redirect from old endpoint to new endpoint
 * 3. Remove this file after migration period
 * 
 * This file is kept for backward compatibility during migration.
 */

import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase/client";
import { env } from "@/lib/env";
import { z } from "zod";

// Load environment variables dynamically - no hardcoded values
const stripe = new Stripe(env.stripe.secretKey!, {
  apiVersion: "2024-11-20.acacia",
});

const XP_MULTIPLIERS: Record<string, number> = {
  starter: 1.25,
  pro: 1.5,
  enterprise: 2.0,
};

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate input with Zod schema
    const validation = checkoutSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: validation.error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const { priceId, userId, tier } = validation.data;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/billing`,
      client_reference_id: userId,
      metadata: {
        userId,
        tier,
      },
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Checkout error";
    console.error("Checkout error:", error);
    return res.status(500).json({ error: errorMessage });
  }
}

// Note: Webhook handler is in app/api/stripe/webhook/route.ts
// This file only handles checkout session creation
// 
// Migration: Use app/api/stripe/create-checkout-app/route.ts for new App Router version
