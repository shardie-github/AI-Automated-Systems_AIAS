import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { createPOSTHandler } from "@/lib/api/route-handler";
import { executeWorkflow } from "@/lib/workflows/executor";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export const runtime = "nodejs";

/**
 * POST /api/workflows/[id]/execute
 * Execute a specific workflow by ID
 */
export const POST = createPOSTHandler(
  async (context) => {
    const { request } = context;
    
    // Get workflow ID from URL
    const workflowId = request.nextUrl.pathname.split("/").pop();
    if (!workflowId) {
      return NextResponse.json(
        { error: "Workflow ID required" },
        { status: 400 }
      );
    }

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

    const body = await request.json().catch(() => ({}));
    const trigger = body.trigger || { type: "manual" };

    try {
      const execution = await executeWorkflow(
        workflowId,
        user.id,
        trigger
      );

      return NextResponse.json({
        execution,
        message: "Workflow executed successfully",
      });
    } catch (error) {
      const errorObj: Error = (error as any) instanceof Error ? (error as Error) : new Error(String(error));
      logger.error("Workflow execution failed", errorObj, {
        workflowId,
        userId: user.id,
      });

      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Workflow execution failed",
        },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
  }
);
