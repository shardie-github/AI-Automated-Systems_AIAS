/**
 * Business Metrics API
 * Returns business metrics for YC readiness dashboard
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { getAllActivationMetrics } from "@/lib/analytics/metrics";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export async function GET(request: NextRequest) {
  try {
    // Check admin access (simplified - implement proper auth)
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

    // Get activation metrics
    const activationMetrics = await getAllActivationMetrics(days);

    // Get revenue metrics (if subscriptions exist)
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("amount, status, created_at")
      .eq("status", "active")
      .gte("created_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    const mrr = subscriptions?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
    const payingCustomers = subscriptions?.length || 0;
    const arpu = payingCustomers > 0 ? mrr / payingCustomers : 0;

    // Get signups by channel (if conversion_events table exists)
    const { data: signupEvents } = await supabase
      .from("conversion_events")
      .select("properties")
      .eq("event_type", "signup")
      .gte("created_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    const channels: Record<string, number> = {};
    signupEvents?.forEach((event) => {
      const source = event.properties?.signup_source || "direct";
      channels[source] = (channels[source] || 0) + 1;
    });

    // Get PMF metrics snapshot (if exists)
    const { data: pmfSnapshot } = await supabase
      .from("pmf_metrics_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .single();

    // Calculate growth rates (simplified - compare to previous period)
    const previousPeriod = await getAllActivationMetrics(days * 2);
    const signupGrowth =
      previousPeriod.totalSignups > 0
        ? ((activationMetrics.totalSignups - previousPeriod.totalSignups / 2) /
            (previousPeriod.totalSignups / 2)) *
          100
        : 0;

    return NextResponse.json({
      northStar: {
        value: activationMetrics.uniqueActiveUsers,
        growth: signupGrowth,
        period: "MoM",
      },
      growth: {
        signups: {
          value: activationMetrics.totalSignups,
          growth: signupGrowth,
          period: "WoW",
        },
        activations: {
          value: activationMetrics.totalActivations,
          growth: 0, // TODO: Calculate actual growth
          period: "WoW",
        },
        paying: {
          value: payingCustomers,
          growth: 0, // TODO: Calculate actual growth
          period: "WoW",
        },
        mrr: {
          value: mrr,
          growth: 0, // TODO: Calculate actual growth
          period: "MoM",
        },
      },
      funnel: {
        visitors: 0, // TODO: Track page views
        signups: activationMetrics.totalSignups,
        activated: activationMetrics.totalActivations,
        paying: payingCustomers,
      },
      retention: {
        day7: pmfSnapshot?.seven_day_retention || activationMetrics.day7Retention,
        day30: pmfSnapshot?.thirty_day_retention || 0,
        churnRate: 0, // TODO: Calculate from subscriptions
        ltv: arpu * 12, // Simplified: ARPU × 12 months
      },
      engagement: {
        dau: 0, // TODO: Calculate DAU
        wau: pmfSnapshot?.weekly_active_users || 0,
        mau: pmfSnapshot?.monthly_active_users || activationMetrics.uniqueActiveUsers,
        workflowsPerUser: pmfSnapshot?.workflows_per_user || 0,
      },
      unitEconomics: {
        arpu: arpu,
        cac: 0, // TODO: Calculate from marketing spend
        ltvCac: 0, // TODO: Calculate LTV:CAC
        grossMargin: 0, // TODO: Calculate gross margin
      },
      channels: channels,
      pmf: {
        nps: pmfSnapshot?.nps || 0,
        timeToActivation: pmfSnapshot?.time_to_activation_hours || activationMetrics.timeToActivation / (1000 * 60 * 60),
        activationRate: activationMetrics.activationRate,
        powerUsers: 0, // TODO: Calculate power users (>5 workflows)
      },
    });
  } catch (error) {
    console.error("Business metrics API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
