// Test utilities for gamification features

import { supabase } from "@/lib/supabase/client";

export async function testGamificationFeatures() {
  console.log("🧪 Testing Gamification Features...\n");

  const tests = [
    {
      name: "Profile Creation",
      test: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        
        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          display_name: "Test User",
          referral_code: "TEST123",
        });
        
        if (error) throw error;
        return "✅ Profile created";
      },
    },
    {
      name: "XP Award",
      test: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("total_xp")
          .eq("id", user.id)
          .single();
        
        const newXP = (profile?.total_xp || 0) + 10;
        
        const { error } = await supabase
          .from("profiles")
          .update({ total_xp: newXP })
          .eq("id", user.id);
        
        if (error) throw error;
        return `✅ XP updated to ${newXP}`;
      },
    },
    {
      name: "Notification Creation",
      test: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        
        const { error } = await supabase.from("notifications").insert({
          user_id: user.id,
          type: "level_up",
          title: "Test Notification",
          body: "This is a test notification",
        });
        
        if (error) throw error;
        return "✅ Notification created";
      },
    },
    {
      name: "Post Creation",
      test: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        
        const { error } = await supabase.from("posts").insert({
          user_id: user.id,
          body: "Test post for gamification",
        });
        
        if (error) throw error;
        return "✅ Post created";
      },
    },
    {
      name: "Comment Creation",
      test: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        
        // First create a post
        const { data: post } = await supabase.from("posts").insert({
          user_id: user.id,
          body: "Test post for comment",
        }).select().single();
        
        if (!post) throw new Error("Failed to create post");
        
        const { error } = await supabase.from("comments").insert({
          post_id: post.id,
          user_id: user.id,
          body: "Test comment",
        });
        
        if (error) throw error;
        return "✅ Comment created";
      },
    },
  ];

  const results = [];
  for (const { name, test } of tests) {
    try {
      const result = await test();
      console.log(`${name}: ${result}`);
      results.push({ name, success: true, result });
    } catch (error: any) {
      console.error(`${name}: ❌ ${error.message}`);
      results.push({ name, success: false, error: error.message });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(`\n✅ ${successCount}/${tests.length} tests passed`);
  
  return results;
}

export async function testDatabaseSchema() {
  console.log("🧪 Testing Database Schema...\n");

  const tables = [
    "profiles",
    "journal_entries",
    "badges",
    "user_badges",
    "streaks",
    "posts",
    "reactions",
    "comments",
    "challenges",
    "challenge_participants",
    "referrals",
    "notifications",
    "user_follows",
    "activities",
    "subscription_tiers",
    "leaderboard_entries",
  ];

  const results = [];
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select("id").limit(1);
      if (error) throw error;
      console.log(`✅ ${table} accessible`);
      results.push({ table, success: true });
    } catch (error: any) {
      console.error(`❌ ${table}: ${error.message}`);
      results.push({ table, success: false, error: error.message });
    }
  }

  return results;
}

if (require.main === module) {
  testDatabaseSchema()
    .then(() => testGamificationFeatures())
    .catch(console.error);
}
