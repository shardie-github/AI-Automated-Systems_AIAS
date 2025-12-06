import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";
import { track } from "@/lib/telemetry/track";
import { extractPaginationParams } from "@/lib/performance/pagination";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

// Workflow schema
const workflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  steps: z.array(z.object({
    id: z.string(),
    type: z.enum(["trigger", "action", "condition"]),
    config: z.record(z.unknown()),
  })),
  enabled: z.boolean().default(true),
  tenant_id: z.string().uuid().optional(),
});

// const workflowUpdateSchema = workflowSchema.partial(); // Will be used for PATCH updates

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/workflows
 * List workflows for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from auth header or cookie
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

    // Get tenant_id from header or query
    const tenantId = request.headers.get("x-tenant-id") || 
                     new URL(request.url).searchParams.get("tenant_id");

    // Extract pagination params
    const searchParams = new URL(request.url).searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Query workflows with pagination
    let query = supabase
      .from("workflows")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data: workflows, error, count } = await query;

    if (error) {
      logger.error("Failed to get workflows", error instanceof Error ? error : new Error(String(error)), { userId: user.id });
      return handleApiError(error, "Failed to retrieve workflows");
    }

    const hasMore = count ? offset + limit < count : false;

    return NextResponse.json({
      workflows: workflows || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore,
      },
    });
  } catch (error) {
    logger.error("Error in GET /api/v1/workflows", error instanceof Error ? error : undefined);
    return handleApiError(error, "Failed to retrieve workflows");
  }
}

/**
 * POST /api/v1/workflows
 * Create a new workflow
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from auth header or cookie
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = workflowSchema.parse(body);

    // Get tenant_id from header, query, or body
    const tenantId = request.headers.get("x-tenant-id") || 
                     new URL(request.url).searchParams.get("tenant_id") ||
                     validatedData.tenant_id;

    // Create workflow
    const { data: workflow, error } = await supabase
      .from("workflows")
      .insert({
        ...validatedData,
        user_id: user.id,
        tenant_id: tenantId || null,
      })
      .select()
      .single();

    if (error) {
      logger.error("Failed to create workflow", error instanceof Error ? error : new Error(String(error)), { userId: user.id });
      return handleApiError(error, "Failed to create workflow");
    }

    logger.info("Workflow created", { workflowId: workflow.id, userId: user.id });

    // Track workflow created event
    try {
      await track(user.id, {
        type: "workflow_created",
        path: "/api/v1/workflows",
        meta: {
          workflow_id: workflow.id,
          workflow_name: validatedData.name,
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });

      // Track funnel stage
      const { trackWorkflowCreate } = await import("@/lib/analytics/funnel-tracking");
      trackWorkflowCreate(user.id, workflow.id, {
        templateId: validatedData.template_id,
        timestamp: new Date().toISOString(),
      });

      // Check if user has activated (has integration + workflow)
      // This is a simplified check - in production, you'd query the database
      const { data: integrations } = await supabase
        .from("integrations")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "connected")
        .limit(1);

      const { data: existingWorkflows } = await supabase
        .from("workflows")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      // User is activated if they have at least one integration and one workflow
      if ((integrations && integrations.length > 0) && (existingWorkflows && existingWorkflows.length > 0)) {
        await track(user.id, {
          type: "user_activated",
          path: "/api/v1/workflows",
          meta: {
            timestamp: new Date().toISOString(),
            activation_method: "workflow_created",
          },
          app: "web",
        });
      }
    } catch (telemetryError) {
      // Log but don't fail workflow creation if telemetry fails
      logger.warn("Failed to track workflow event", { error: telemetryError });
    }

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("Error in POST /api/v1/workflows", error instanceof Error ? error : undefined);
    return handleApiError(error, "Failed to create workflow");
  }
}
