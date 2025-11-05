import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const XP_MULTIPLIERS: Record<string, number> = {
  starter: 1.25,
  pro: 1.5,
  enterprise: 2.0,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { priceId, userId, tier } = req.body;

    if (!priceId || !userId || !tier) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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
  } catch (error: any) {
    console.error("Checkout error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// Webhook handler for subscription events
export async function handleStripeWebhook(req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers["stripe-signature"]!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        if (userId && tier) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

          await supabase.from("subscription_tiers").upsert({
            user_id: userId,
            tier,
            xp_multiplier: XP_MULTIPLIERS[tier] || 1.0,
            expires_at: expiresAt.toISOString(),
          });

          // Update user's XP multiplier in localStorage cache
          await supabase.from("profiles").update({
            // Profile updates if needed
          }).eq("id", userId);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        // Handle subscription updates/cancellations
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return res.status(500).json({ error: error.message });
  }
}
