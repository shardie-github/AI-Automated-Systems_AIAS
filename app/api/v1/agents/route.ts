import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

// Agent schema
const agentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(["chatbot", "automation", "analytics", "custom"]),
  config: z.record(z.unknown()),
  enabled: z.boolean().default(true),
  tenant_id: z.string().uuid().optional(),
});

// const agentUpdateSchema = agentSchema.partial(); // Will be used for PATCH updates

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/agents
 * List agents for the authenticated user
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

    // Query agents
    let query = supabase
      .from("agents")
      .select("*")
      .eq("user_id", user.id);

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data: agents, error } = await query.order("created_at", { ascending: false });

    if (error) {
      logger.error("Failed to get agents", error instanceof Error ? error : new Error(String(error)), { userId: user.id });
      return handleApiError(error, "Failed to retrieve agents");
    }

    return NextResponse.json({ agents: (agents || []) });
  } catch (error) {
    logger.error("Error in GET /api/v1/agents", error instanceof Error ? error : undefined);
    return handleApiError(error, "Failed to retrieve agents");
  }
}

/**
 * POST /api/v1/agents
 * Create a new agent
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
    const validatedData = agentSchema.parse(body);

    // Get tenant_id from header, query, or body
    const tenantId = request.headers.get("x-tenant-id") || 
                     new URL(request.url).searchParams.get("tenant_id") ||
                     validatedData.tenant_id;

    // Create agent
    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        ...validatedData,
        user_id: user.id,
        tenant_id: tenantId || null,
      })
      .select()
      .single();

    if (error) {
      logger.error("Failed to create agent", error instanceof Error ? error : new Error(String(error)), { userId: user.id });
      return handleApiError(error, "Failed to create agent");
    }

    logger.info("Agent created", { agentId: agent.id, userId: user.id });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    logger.error("Error in POST /api/v1/agents", error instanceof Error ? error : undefined);
    return handleApiError(error, "Failed to create agent");
  }
}
