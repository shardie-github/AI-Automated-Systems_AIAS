// Email notification service (server-side)
// This would typically be called from API routes or Supabase Edge Functions

import { supabase } from "@/lib/supabase/client";

interface EmailNotification {
  to: string;
  subject: string;
  html: string;
}

export async function sendStreakReminderEmail(userId: string, days: number) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  // In production, use Resend, SendGrid, or similar
  // For now, create a notification record
  await supabase.from("notifications").insert({
    user_id: userId,
    type: "streak_reminder",
    title: "Don't break your streak!",
    body: `You're on a ${days}-day streak. Keep it going!`,
    link: "/play"
  });
}

export async function sendChallengeNotification(userId: string, challengeTitle: string) {
  await supabase.from("notifications").insert({
    user_id: userId,
    type: "challenge_started",
    title: "New Challenge Available",
    body: `${challengeTitle} has started! Join now to earn XP.`,
    link: "/challenges"
  });
}

export async function sendMilestoneEmail(userId: string, milestoneType: string) {
  const { data: milestone } = await supabase
    .from("milestones")
    .select("*")
    .eq("user_id", userId)
    .eq("milestone_type", milestoneType)
    .single();

  if (milestone) {
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "milestone",
      title: "Milestone Achieved!",
      body: `You've reached a new milestone! Check it out.`,
      link: "/play"
    });
  }
}

// Cron job function (call from Supabase Edge Function or external cron)
export async function checkAndSendStreakReminders() {
  const { data: streaks } = await supabase
    .from("streaks")
    .select("*, profiles(display_name)")
    .gte("days", 3)
    .lt("updated_at", new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()); // Not updated in last 20h

  for (const streak of streaks || []) {
    await sendStreakReminderEmail(streak.user_id, streak.days);
  }
}
