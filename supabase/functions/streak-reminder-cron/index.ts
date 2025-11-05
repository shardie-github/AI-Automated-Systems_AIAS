// Supabase Edge Function: Streak Reminder Cron
// Deploy to: supabase/functions/streak-reminder-cron/index.ts

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

    const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();

    // Get users with streaks >= 3 days who haven't updated in last 20 hours
    const { data: streaks, error: streaksError } = await supabaseClient
      .from("streaks")
      .select("*, profiles(display_name)")
      .gte("days", 3)
      .lt("updated_at", twentyHoursAgo);

    if (streaksError) throw streaksError;

    if (!streaks || streaks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No streaks to remind", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Create notifications for each streak
    const notifications = streaks.map((streak) => ({
      user_id: streak.user_id,
      type: "streak_reminder",
      title: "Don't break your streak!",
      body: `You're on a ${streak.days}-day streak. Keep it going!`,
      link: "/play",
    }));

    const { error: notifError } = await supabaseClient
      .from("notifications")
      .insert(notifications);

    if (notifError) throw notifError;

    // In production, you'd also send emails here
    // For now, we'll just create notifications

    return new Response(
      JSON.stringify({
        message: "Streak reminders sent",
        count: notifications.length,
        users: streaks.map((s) => s.user_id),
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
