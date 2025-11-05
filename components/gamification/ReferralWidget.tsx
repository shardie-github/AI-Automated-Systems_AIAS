"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { awardXp } from "@/components/gamification/GamificationProvider";
import { hapticTap } from "@/components/gamification/Haptics";

export default function ReferralWidget() {
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase.from("profiles").select("referral_code").eq("id", user.id).single();
    if (profile?.referral_code) setReferralCode(profile.referral_code);
    
    const { data: refs } = await supabase.from("referrals").select("*").eq("referrer_id", user.id).order("created_at", { ascending: false });
    if (refs) setReferrals(refs);
  }

  async function copyCode() {
    hapticTap();
    const url = `${window.location.origin}/signup?ref=${referralCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const pending = referrals.filter(r => r.status === "pending").length;
  const converted = referrals.filter(r => r.status === "converted").length;

  return (
    <div className="rounded-2xl border p-4 bg-card space-y-4">
      <div>
        <div className="text-sm font-semibold mb-1">Invite Friends</div>
        <div className="text-xs text-muted-foreground">Earn 50 XP for each friend who signs up!</div>
      </div>
      
      {referralCode && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              readOnly
              value={`${window.location.origin}/signup?ref=${referralCode}`}
              className="flex-1 rounded-xl border border-border p-2 text-sm bg-muted"
            />
            <button onClick={copyCode} className="h-10 px-4 rounded-xl bg-primary text-primary-fg text-sm">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="text-xs text-muted-foreground">Share this link with friends</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-muted p-2">
          <div className="text-xs text-muted-foreground">Pending</div>
          <div className="text-lg font-semibold">{pending}</div>
        </div>
        <div className="rounded-lg bg-muted p-2">
          <div className="text-xs text-muted-foreground">Converted</div>
          <div className="text-lg font-semibold">{converted}</div>
        </div>
      </div>
    </div>
  );
}
