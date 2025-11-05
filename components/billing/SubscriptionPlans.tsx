"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/lib/supabase/client";
import { hapticTap } from "@/components/gamification/Haptics";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  xpMultiplier: number;
  features: string[];
  priceId: string;
}

const TIERS: SubscriptionTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: 9.99,
    xpMultiplier: 1.25,
    features: ["1.25x XP multiplier", "Priority support", "Exclusive badges"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || "",
  },
  {
    id: "pro",
    name: "Pro",
    price: 19.99,
    xpMultiplier: 1.5,
    features: ["1.5x XP multiplier", "Priority support", "Exclusive badges", "Early access to challenges"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 49.99,
    xpMultiplier: 2.0,
    features: ["2x XP multiplier", "Priority support", "All badges", "Custom challenges", "Dedicated account manager"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY || "",
  },
];

export default function SubscriptionPlans() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(tier: SubscriptionTier) {
    hapticTap();
    setLoading(tier.id);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please sign in to subscribe");
        return;
      }

      // Create checkout session
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: tier.priceId,
          userId: user.id,
          tier: tier.id,
        }),
      });

      const { sessionId } = await response.json();

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe not loaded");
      }

      await stripe.redirectToCheckout({ sessionId });
    } catch (error: any) {
      console.error("Subscription error:", error);
      alert("Failed to start checkout: " + error.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {TIERS.map((tier) => (
        <div key={tier.id} className="rounded-2xl border p-6 bg-card space-y-4">
          <div>
            <div className="text-xl font-bold">{tier.name}</div>
            <div className="text-3xl font-bold mt-2">
              ${tier.price}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {tier.xpMultiplier}x XP Multiplier
            </div>
          </div>

          <ul className="space-y-2">
            {tier.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span>✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSubscribe(tier)}
            disabled={loading === tier.id}
            className="w-full h-10 rounded-xl bg-primary text-primary-fg font-medium disabled:opacity-50"
          >
            {loading === tier.id ? "Processing..." : "Subscribe"}
          </button>
        </div>
      ))}
    </div>
  );
}
