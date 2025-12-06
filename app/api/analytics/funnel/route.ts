import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/funnel
 * Get activation funnel metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from auth
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : request.cookies.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (for now, allow all authenticated users)
    // In production, add admin check

    // Get funnel data from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Batch all queries to avoid N+1 problem
    const [
      { count: signupCount, error: signupsError },
      { count: onboardingCount, error: onboardingError },
      { count: integrationCount, error: integrationsError },
      { count: workflowCount, error: workflowsError },
      { count: executionCount, error: executionsError },
      { count: activationCount, error: activationsError },
    ] = await Promise.all([
      supabase
        .from("app_events")
        .select("user_id", { count: "exact", head: true })
        .eq("event_type", "funnel_stage")
        .eq("meta->>stage", "signup")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("app_events")
        .select("user_id", { count: "exact", head: true })
        .eq("event_type", "funnel_stage")
        .eq("meta->>stage", "onboarding_start")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("app_events")
        .select("user_id", { count: "exact", head: true })
        .eq("event_type", "funnel_stage")
        .eq("meta->>stage", "integration_connect")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("app_events")
        .select("user_id", { count: "exact", head: true })
        .eq("event_type", "funnel_stage")
        .eq("meta->>stage", "workflow_create")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("app_events")
        .select("user_id", { count: "exact", head: true })
        .eq("event_type", "funnel_stage")
        .eq("meta->>stage", "workflow_execute")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("app_events")
        .select("user_id", { count: "exact", head: true })
        .eq("event_type", "funnel_stage")
        .eq("meta->>stage", "activated")
        .gte("created_at", thirtyDaysAgo.toISOString()),
    ]);

    if (signupsError || onboardingError || integrationsError || workflowsError || executionsError || activationsError) {
      logger.error("Failed to get funnel data", new Error("Database query failed"), {
        errors: {
          signups: signupsError?.message,
          onboarding: onboardingError?.message,
          integrations: integrationsError?.message,
          workflows: workflowsError?.message,
          executions: executionsError?.message,
          activations: activationsError?.message,
        },
      });
    }

    // Calculate conversion rates
    const conversionRates = {
      signupToOnboarding: signupCount > 0 ? (onboardingCount / signupCount) * 100 : 0,
      onboardingToIntegration: onboardingCount > 0 ? (integrationCount / onboardingCount) * 100 : 0,
      integrationToWorkflow: integrationCount > 0 ? (workflowCount / integrationCount) * 100 : 0,
      workflowToExecute: workflowCount > 0 ? (executionCount / workflowCount) * 100 : 0,
      overallActivation: signupCount > 0 ? (activationCount / signupCount) * 100 : 0,
    };

    return NextResponse.json({
      period: "last_30_days",
      stages: {
        signup: signupCount,
        onboarding_start: onboardingCount,
        integration_connect: integrationCount,
        workflow_create: workflowCount,
        workflow_execute: executionCount,
        activated: activationCount,
      },
      conversionRates,
      dropOffPoints: {
        signupToOnboarding: signupCount - onboardingCount,
        onboardingToIntegration: onboardingCount - integrationCount,
        integrationToWorkflow: integrationCount - workflowCount,
        workflowToExecute: workflowCount - executionCount,
      },
    });
  } catch (error) {
    logger.error("Error in GET /api/analytics/funnel", error instanceof Error ? error : undefined);
    return handleApiError(error, "Failed to get funnel data");
  }
}
