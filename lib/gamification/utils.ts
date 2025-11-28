// Utility functions for gamification features

import { supabase } from "@/lib/supabase/client";
import { awardXp } from "@/components/gamification/GamificationProvider";

export async function checkAndAwardMilestone(userId: string, type: string, value: number) {
  const milestones: Record<string, { check: (v: number) => boolean; type: string | ((v: number) => string) }> = {
    streak: {
      check: (v) => v === 7 || v === 30 || v === 100,
      type: (v) => v === 7 ? "streak_7" : v === 30 ? "streak_30" : "streak_100"
    },
    level: {
      check: (v) => v === 10 || v === 25 || v === 50,
      type: (v) => v === 10 ? "level_10" : v === 25 ? "level_25" : "level_50"
    },
    xp: {
      check: (v) => v >= 1000 && v < 10000 || v >= 10000,
      type: (v) => v >= 10000 ? "xp_10000" : "xp_1000"
    }
  };

  const milestone = milestones[type];
  if (!milestone || !milestone.check(value)) return;

  const milestoneType = typeof milestone.type === "function" ? milestone.type(value) : milestone.type;
  
  const { data: existing } = await supabase
    .from("milestones")
    .select("*")
    .eq("user_id", userId)
    .eq("milestone_type", milestoneType)
    .single();

  if (!existing) {
    await supabase.from("milestones").insert({
      user_id: userId,
      milestone_type: milestoneType
    });

    await supabase.from("notifications").insert({
      user_id: userId,
      type: "milestone",
      title: "Milestone Achieved!",
      body: `You've reached a new milestone!`,
      link: "/play"
    });

    // Award bonus XP
    awardXp(50);
  }
}

export async function updateStreak(userId: string) {
  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  const lastUpdate = streak?.updated_at ? new Date(streak.updated_at) : null;
  const now = new Date();
  const daysSinceUpdate = lastUpdate ? Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)) : 999;

  let newDays = 1;
  if (streak) {
    if (daysSinceUpdate === 0) {
      return; // Already updated today
    } else if (daysSinceUpdate === 1) {
      newDays = streak.days + 1; // Continue streak
    } else {
      newDays = 1; // Reset streak
    }
  }

  await supabase.from("streaks").upsert({
    user_id: userId,
    days: newDays,
    updated_at: now.toISOString()
  });

  await checkAndAwardMilestone(userId, "streak", newDays);
}

export async function updateUserXP(userId: string, xpDelta: number) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp")
    .eq("id", userId)
    .single();

  const newTotalXP = (profile?.total_xp || 0) + xpDelta;
  const oldLevel = Math.floor((profile?.total_xp || 0) / 100) + 1;
  const newLevel = Math.floor(newTotalXP / 100) + 1;

  await supabase.from("profiles").update({ total_xp: newTotalXP }).eq("id", userId);

  if (newLevel > oldLevel) {
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "level_up",
      title: `Level ${newLevel} Reached!`,
      body: `Congratulations! You've leveled up!`,
      link: "/play"
    });

    await checkAndAwardMilestone(userId, "level", newLevel);
  }

  await checkAndAwardMilestone(userId, "xp", newTotalXP);
}

export async function processReferral(referralCode: string, newUserId: string) {
  const { data: referral } = await supabase
    .from("referrals")
    .select("*, profiles!referrals_referrer_id_fkey(id)")
    .eq("referral_code", referralCode)
    .single();

  if (referral && referral.referrer_id) {
    await supabase.from("referrals").update({
      referred_id: newUserId,
      status: "signed_up",
      converted_at: new Date().toISOString()
    }).eq("id", referral.id);

    await supabase.from("profiles").update({
      total_referrals: (referral.profiles?.total_referrals || 0) + 1
    }).eq("id", referral.referrer_id);

    await supabase.from("notifications").insert({
      user_id: referral.referrer_id,
      type: "referral_reward",
      title: "Referral Reward!",
      body: "Someone signed up using your referral code!",
      link: "/play"
    });

    await updateUserXP(referral.referrer_id, 50);
  }
}
