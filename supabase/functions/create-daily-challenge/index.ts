// Supabase Edge Function: Daily Challenge Creation
// Deploy to: supabase/functions/create-daily-challenge/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Check if weekly challenge already exists
    const { data: existing } = await supabaseClient
      .from("challenges")
      .select("*")
      .eq("challenge_type", "weekly")
      .gte("start_date", startOfWeek.toISOString())
      .lte("end_date", endOfWeek.toISOString())
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ message: "Weekly challenge already exists", challenge: existing }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create weekly challenge
    const weeklyChallenges = [
      {
        title: "Complete 5 Journal Entries",
        description: "Write 5 journal entries this week to reflect on your progress.",
        xp_reward: 100,
        requirements: { journal_entries: 5 },
      },
      {
        title: "Engage with Community",
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
    ];

    const challenge = weeklyChallenges[Math.floor(Math.random() * weeklyChallenges.length)];

    const { data: newChallenge, error: createError } = await supabaseClient
      .from("challenges")
      .insert({
        title: challenge.title,
        description: challenge.description,
        challenge_type: "weekly",
        start_date: startOfWeek.toISOString(),
        end_date: endOfWeek.toISOString(),
        xp_reward: challenge.xp_reward,
        requirements: challenge.requirements,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Notify all users
    const { data: users } = await supabaseClient.from("profiles").select("id");

    if (users && users.length > 0) {
      const notifications = users.map((user) => ({
        user_id: user.id,
        type: "challenge_started",
        title: "New Weekly Challenge!",
        body: challenge.title,
        link: "/challenges",
      }));

      await supabaseClient.from("notifications").insert(notifications);
    }

    return new Response(
      JSON.stringify({
        message: "Weekly challenge created",
        challenge: newChallenge,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
