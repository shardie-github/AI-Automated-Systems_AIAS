import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerClient();

    // Get current week dates
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(currentWeekStart.getDate() - 7);
    
    const previousWeekEnd = new Date(currentWeekStart);

    // Get signups (current week)
    const { data: currentSignups } = await supabase
      .from("profiles")
      .select("id")
      .gte("created_at", currentWeekStart.toISOString());

    // Get signups (previous week)
    const { data: previousSignups } = await supabase
      .from("profiles")
      .select("id")
      .gte("created_at", previousWeekStart.toISOString())
      .lt("created_at", previousWeekEnd.toISOString());

    // Get activations (current week) - users who created first workflow
    const { data: currentActivations } = await supabase
      .from("user_activations")
      .select("id")
      .not("first_workflow_created_at", "is", null)
      .gte("first_workflow_created_at", currentWeekStart.toISOString());

    // Get activations (previous week)
    const { data: previousActivations } = await supabase
      .from("user_activations")
      .select("id")
      .not("first_workflow_created_at", "is", null)
      .gte("first_workflow_created_at", previousWeekStart.toISOString())
      .lt("first_workflow_created_at", previousWeekEnd.toISOString());

    // Get MRR (Monthly Recurring Revenue) - TODO: Query Stripe for actual MRR
    const currentMRR = 0; // TODO: Query Stripe subscriptions
    const previousMRR = 0; // TODO: Query Stripe subscriptions

    // Get retention (30-day) - users active in last 30 days
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const { data: activeUsers } = await supabase
      .from("user_activations")
      .select("id")
      .gte("last_active_at", thirtyDaysAgo.toISOString());

    const { data: signupsThirtyDaysAgo } = await supabase
      .from("user_activations")
      .select("id")
      .gte("signup_date", thirtyDaysAgo.toISOString())
      .lte("signup_date", new Date(thirtyDaysAgo.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()); // Signups from 30-37 days ago

    const currentRetention = signupsThirtyDaysAgo && signupsThirtyDaysAgo.length > 0
      ? (activeUsers?.length || 0) / signupsThirtyDaysAgo.length * 100
      : 0;

    // Calculate previous week retention (37-44 days ago)
    const previousWeekRetentionStart = new Date(thirtyDaysAgo);
    previousWeekRetentionStart.setDate(thirtyDaysAgo.getDate() - 7);
    
    const { data: previousActiveUsers } = await supabase
      .from("user_activations")
      .select("id")
      .gte("last_active_at", previousWeekRetentionStart.toISOString())
      .lt("last_active_at", thirtyDaysAgo.toISOString());

    const { data: previousSignupsThirtyDaysAgo } = await supabase
      .from("user_activations")
      .select("id")
      .gte("signup_date", previousWeekRetentionStart.toISOString())
      .lte("signup_date", thirtyDaysAgo.toISOString());

    const previousRetention = previousSignupsThirtyDaysAgo && previousSignupsThirtyDaysAgo.length > 0
      ? (previousActiveUsers?.length || 0) / previousSignupsThirtyDaysAgo.length * 100
      : 0;

    // Calculate trends
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const kpis = {
      signups: currentSignups?.length || 0,
      activations: currentActivations?.length || 0,
      mrr: currentMRR,
      retention: currentRetention,
      trends: {
        signups: {
          current: currentSignups?.length || 0,
          previous: previousSignups?.length || 0,
          change: calculateChange(currentSignups?.length || 0, previousSignups?.length || 0),
        },
        activations: {
          current: currentActivations?.length || 0,
          previous: previousActivations?.length || 0,
          change: calculateChange(currentActivations?.length || 0, previousActivations?.length || 0),
        },
        mrr: {
          current: currentMRR,
          previous: previousMRR,
          change: calculateChange(currentMRR, previousMRR),
        },
        retention: {
          current: currentRetention,
          previous: previousRetention,
          change: calculateChange(currentRetention, previousRetention),
        },
      },
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(kpis);
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPIs" },
      { status: 500 }
    );
  }
}
