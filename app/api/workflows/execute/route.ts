import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { createPOSTHandler, handleApiError } from "@/lib/api/route-handler";
import { executeWorkflow } from "@/lib/workflows/executor-enhanced";
import { trackWorkflowExecute } from "@/lib/analytics/funnel-tracking";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const executeSchema = z.object({
  workflowId: z.string().uuid(),
  trigger: z.object({
    type: z.enum(["webhook", "schedule", "manual"]),
    config: z.record(z.unknown()).optional(),
  }).optional(),
});

export const runtime = "nodejs";

/**
 * POST /api/workflows/execute
 * Execute a workflow
 */
export const POST = createPOSTHandler(
  async (context) => {
    const { request } = context;
    
    // Get user from auth header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7)
      : request.cookies.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = executeSchema.parse(body);

    try {
      const execution = await executeWorkflow(
        validatedData.workflowId,
        user.id,
        validatedData.trigger ? { ...validatedData.trigger, config: validatedData.trigger.config || {} } : undefined
      );

      // Track workflow execution in funnel
      if (execution.status === "completed") {
        trackWorkflowExecute(user.id, validatedData.workflowId, {
          executionId: execution.id,
          timestamp: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        execution,
        message: "Workflow executed successfully",
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error("Workflow execution failed", errorObj, {
        workflowId: validatedData.workflowId,
        userId: user.id,
      });

      return handleApiError(error, "Workflow execution failed");
    }
  },
  {
    requireAuth: true,
    validateBody: executeSchema,
  }
);
