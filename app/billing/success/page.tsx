"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Confetti from "@/components/gamification/Confetti";

export default function BillingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (sessionId) {
      verifySubscription();
    }
  }, [sessionId]);

  async function verifySubscription() {
    setLoading(true);
    // In production, verify with Stripe API
    // For now, just show success
    setTimeout(() => {
      setLoading(false);
      setCelebrating(true);
      setTimeout(() => {
        router.push("/play");
      }, 3000);
    }, 1000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-lg">Verifying subscription...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="text-6xl">🎉</div>
        <div className="text-2xl font-bold">Subscription Activated!</div>
        <div className="text-muted-foreground">
          Your account has been upgraded. Redirecting to Play Hub...
        </div>
      </div>
      <Confetti when={celebrating} />
    </div>
  );
}
