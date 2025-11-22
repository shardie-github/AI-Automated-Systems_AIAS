import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { createGETHandler } from "@/lib/api/route-handler";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export const runtime = "edge";

/**
 * GET /api/admin/metrics
 * Get activation metrics for dashboard
 */
export const GET = createGETHandler(
  async (context) => {
    const { request } = context;

    // Get date range from query params (default to last 30 days)
    const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      // Query telemetry events for activation funnel
      // Note: This assumes telemetry events are stored in a 'telemetry_events' table
      // Adjust table name based on your actual schema

      // Get signups
      const { data: signups, error: signupsError } = await supabase
        .from("telemetry_events")
        .select("user_id, meta, created_at")
        .eq("type", "user_signed_up")
        .gte("created_at", startDate.toISOString());

      if (signupsError) {
        logger.warn("Failed to query signups", { error: signupsError });
      }

      // Get integration connections
      const { data: integrations, error: integrationsError } = await supabase
        .from("telemetry_events")
        .select("user_id, meta, created_at")
        .eq("type", "integration_connected")
        .gte("created_at", startDate.toISOString());

      if (integrationsError) {
        logger.warn("Failed to query integrations", { error: integrationsError });
      }

      // Get workflow creations
      const { data: workflows, error: workflowsError } = await supabase
        .from("telemetry_events")
        .select("user_id, meta, created_at")
        .eq("type", "workflow_created")
        .gte("created_at", startDate.toISOString());

      if (workflowsError) {
        logger.warn("Failed to query workflows", { error: workflowsError });
      }

      // Get activations
      const { data: activations, error: activationsError } = await supabase
        .from("telemetry_events")
        .select("user_id, meta, created_at")
        .eq("type", "user_activated")
        .gte("created_at", startDate.toISOString());

      if (activationsError) {
        logger.warn("Failed to query activations", { error: activationsError });
      }

      // Get active users (for retention)
      const { data: activeUsers, error: activeUsersError } = await supabase
        .from("telemetry_events")
        .select("user_id, created_at")
        .eq("type", "user_active")
        .gte("created_at", startDate.toISOString());

      if (activeUsersError) {
        logger.warn("Failed to query active users", { error: activeUsersError });
      }

      // Calculate metrics
      const totalSignups = signups?.length || 0;
      const totalIntegrations = integrations?.length || 0;
      const totalWorkflows = workflows?.length || 0;
      const totalActivations = activations?.length || 0;
      const uniqueActiveUsers = new Set(activeUsers?.map((e) => e.user_id) || []).size;

      // Calculate activation rate
      const activationRate = totalSignups > 0 ? (totalActivations / totalSignups) * 100 : 0;

      // Calculate time-to-activation (median)
      const activationTimes: number[] = [];
      if (signups && activations) {
        for (const activation of activations) {
          const signup = signups.find((s) => s.user_id === activation.user_id);
          if (signup) {
            const signupTime = new Date(signup.created_at).getTime();
            const activationTime = new Date(activation.created_at).getTime();
            activationTimes.push(activationTime - signupTime);
          }
        }
      }
      const medianTimeToActivation = activationTimes.length > 0
        ? activationTimes.sort((a, b) => a - b)[Math.floor(activationTimes.length / 2)]
        : 0;

      // Calculate Day 7 retention (simplified - would need more complex query in production)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: signups7DaysAgo } = await supabase
        .from("telemetry_events")
        .select("user_id")
        .eq("type", "user_signed_up")
        .gte("created_at", sevenDaysAgo.toISOString())
        .lt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const signupUserIds = new Set(signups7DaysAgo?.map((e) => e.user_id) || []);
      const activeUserIds = new Set(activeUsers?.map((e) => e.user_id) || []);
      const retainedUsers = Array.from(signupUserIds).filter((id) => activeUserIds.has(id));
      const day7Retention = signupUserIds.size > 0 ? (retainedUsers.length / signupUserIds.size) * 100 : 0;

      return NextResponse.json({
        metrics: {
          activation_rate: Math.round(activationRate * 100) / 100,
          time_to_activation_ms: medianTimeToActivation,
          time_to_activation_hours: Math.round((medianTimeToActivation / (1000 * 60 * 60)) * 100) / 100,
          day_7_retention: Math.round(day7Retention * 100) / 100,
          total_signups: totalSignups,
          total_integrations: totalIntegrations,
          total_workflows: totalWorkflows,
          total_activations: totalActivations,
          unique_active_users: uniqueActiveUsers,
        },
        funnel: {
          signups: totalSignups,
          integrations: totalIntegrations,
          workflows: totalWorkflows,
          activations: totalActivations,
        },
        period: {
          days,
          start_date: startDate.toISOString(),
          end_date: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error("Error calculating metrics", { error });
      return NextResponse.json(
        { error: "Failed to calculate metrics" },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    cache: { enabled: true, ttl: 300 }, // Cache for 5 minutes
  }
);
