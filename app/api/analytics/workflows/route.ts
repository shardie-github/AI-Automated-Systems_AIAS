import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/workflows
 * Get workflow statistics for authenticated user
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

    // Batch queries to avoid N+1 problem
    const [workflowsResult, executionsResult] = await Promise.all([
      // Get workflow counts
      supabase
        .from("workflows")
        .select("id, enabled, status")
        .eq("user_id", user.id),
      
      // Get execution stats (last 30 days) - batch query
      (async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return supabase
          .from("workflow_executions")
          .select("status")
          .eq("user_id", user.id)
          .gte("started_at", thirtyDaysAgo.toISOString());
      })(),
    ]);

    const { data: workflows, error: workflowsError } = workflowsResult;
    const { data: executions, error: executionsError } = executionsResult;

    if (workflowsError) {
      logger.error("Failed to get workflows", workflowsError instanceof Error ? workflowsError : new Error(String(workflowsError)), {
        userId: user.id,
      });
    }

    if (executionsError) {
      logger.error("Failed to get executions", executionsError instanceof Error ? executionsError : new Error(String(executionsError)), {
        userId: user.id,
      });
    }

    const total = workflows?.length || 0;
    const active = workflows?.filter((w) => w.enabled && w.status === "active").length || 0;

    if (executionsError) {
      logger.error("Failed to get executions", executionsError instanceof Error ? executionsError : new Error(String(executionsError)), {
        userId: user.id,
      });
    }

    const completed = executions?.filter((e) => e.status === "completed").length || 0;
    const failed = executions?.filter((e) => e.status === "failed").length || 0;
    const totalExecutions = completed + failed;
    const successRate = totalExecutions > 0 ? (completed / totalExecutions) * 100 : 0;

    return NextResponse.json({
      total,
      active,
      completed,
      failed,
      successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
    });
  } catch (error) {
    logger.error("Error in GET /api/analytics/workflows", error instanceof Error ? error : undefined);
    return handleApiError(error, "Failed to get workflow stats");
  }
}
