// Challenge Templates and Seed Data
// Run: npm run seed:challenges

import { supabase } from "@/lib/supabase/client";

export const CHALLENGE_TEMPLATES = {
  weekly: [
    {
      title: "Journal Week",
      description: "Write 5 journal entries this week to reflect on your progress.",
      xp_reward: 100,
      requirements: { journal_entries: 5 },
    },
    {
      title: "Community Champion",
      description: "Create 3 posts and comment on 5 others.",
      xp_reward: 150,
      requirements: { posts: 3, comments: 5 },
    },
    {
      title: "Perfect Week Streak",
      description: "Maintain your streak for all 7 days.",
      xp_reward: 200,
      requirements: { streak_days: 7 },
    },
    {
      title: "Reaction Master",
      description: "React to 20 posts this week.",
      xp_reward: 75,
      requirements: { reactions: 20 },
    },
    {
      title: "Social Butterfly",
      description: "Follow 5 new users and interact with their content.",
      xp_reward: 100,
      requirements: { follows: 5, interactions: 10 },
    },
  ],
  monthly: [
    {
      title: "Monthly Master",
      description: "Earn 1000 XP this month.",
      xp_reward: 500,
      requirements: { xp_earned: 1000 },
    },
    {
      title: "Badge Collector",
      description: "Earn 5 badges this month.",
      xp_reward: 300,
      requirements: { badges: 5 },
    },
    {
      title: "Community Leader",
      description: "Create 15 posts and get 50 reactions total.",
      xp_reward: 400,
      requirements: { posts: 15, total_reactions: 50 },
    },
    {
      title: "Referral King",
      description: "Refer 3 friends who sign up.",
      xp_reward: 250,
      requirements: { referrals: 3 },
    },
    {
      title: "Consistency Champion",
      description: "Maintain a 20+ day streak this month.",
      xp_reward: 350,
      requirements: { streak_days: 20 },
    },
  ],
  seasonal: [
    {
      title: "New Year Resolution",
      description: "Complete 30 days of consistent engagement.",
      xp_reward: 1000,
      requirements: { days_active: 30 },
    },
    {
      title: "Spring Cleanup",
      description: "Complete your profile and connect with 10 users.",
      xp_reward: 200,
      requirements: { profile_complete: true, connections: 10 },
    },
    {
      title: "Summer Engagement",
      description: "Earn 5000 XP during summer months.",
      xp_reward: 750,
      requirements: { xp_earned: 5000 },
    },
  ],
};

export async function seedChallenges() {
  console.log("🌱 Seeding challenges...");

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Weekly challenge
  const weeklyTemplate = CHALLENGE_TEMPLATES.weekly[Math.floor(Math.random() * CHALLENGE_TEMPLATES.weekly.length)];
  const { data: weeklyChallenge, error: weeklyError } = await supabase
    .from("challenges")
    .insert({
      ...weeklyTemplate,
      challenge_type: "weekly",
      start_date: startOfWeek.toISOString(),
      end_date: endOfWeek.toISOString(),
    })
    .select()
    .single();

  if (weeklyError && !weeklyError.message.includes("duplicate")) {
    console.error("Weekly challenge error:", weeklyError);
  } else {
    console.log("✅ Weekly challenge created:", weeklyChallenge?.title);
  }

  // Monthly challenge
  const monthlyTemplate = CHALLENGE_TEMPLATES.monthly[Math.floor(Math.random() * CHALLENGE_TEMPLATES.monthly.length)];
  const { data: monthlyChallenge, error: monthlyError } = await supabase
    .from("challenges")
    .insert({
      ...monthlyTemplate,
      challenge_type: "monthly",
      start_date: startOfMonth.toISOString(),
      end_date: endOfMonth.toISOString(),
    })
    .select()
    .single();

  if (monthlyError && !monthlyError.message.includes("duplicate")) {
    console.error("Monthly challenge error:", monthlyError);
  } else {
    console.log("✅ Monthly challenge created:", monthlyChallenge?.title);
  }

  console.log("✅ Challenges seeded!");
}

export async function seedBadges() {
  console.log("🌱 Seeding badges...");

  const badges = [
    { code: "first_steps", name: "First Steps", description: "Complete your first quest" },
    { code: "week_warrior", name: "Week Warrior", description: "7-day streak achieved" },
    { code: "month_master", name: "Month Master", description: "30-day streak achieved" },
    { code: "social_butterfly", name: "Social Butterfly", description: "Follow 10 users" },
    { code: "comment_king", name: "Comment King", description: "Post 50 comments" },
    { code: "reaction_master", name: "Reaction Master", description: "React 100 times" },
    { code: "challenge_champion", name: "Challenge Champion", description: "Complete 10 challenges" },
    { code: "referral_hero", name: "Referral Hero", description: "Refer 5 friends" },
    { code: "level_10", name: "Level 10", description: "Reach level 10" },
    { code: "level_25", name: "Level 25", description: "Reach level 25" },
    { code: "level_50", name: "Level 50", description: "Reach level 50" },
    { code: "xp_master", name: "XP Master", description: "Earn 10,000 XP" },
  ];

  for (const badge of badges) {
    const { error } = await supabase.from("badges").upsert(badge, { onConflict: "code" });
    if (error && !error.message.includes("duplicate")) {
      console.error(`Badge error (${badge.code}):`, error);
    }
  }

  console.log("✅ Badges seeded!");
}

if (require.main === module) {
  seedChallenges().then(() => seedBadges()).catch(console.error);
}
