"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import SubscriptionPlans from "@/components/billing/SubscriptionPlans";

export default function BillingPage() {
  const [currentTier, setCurrentTier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentSubscription();
  }, []);

  async function loadCurrentSubscription() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("subscription_tiers")
      .select("*")
      .eq("user_id", user.id)
      .gte("expires_at", new Date().toISOString())
      .single();

    setCurrentTier(data);
    setLoading(false);
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upgrade to unlock XP multipliers and exclusive features
        </p>
      </div>

      {currentTier && (
        <div className="rounded-2xl border p-4 bg-card">
          <div className="text-sm font-semibold">Current Plan</div>
          <div className="text-lg font-bold capitalize mt-1">{currentTier.tier}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {currentTier.xp_multiplier}x XP Multiplier
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Expires: {new Date(currentTier.expires_at).toLocaleDateString()}
          </div>
        </div>
      )}

      <SubscriptionPlans />
    </div>
  );
}
