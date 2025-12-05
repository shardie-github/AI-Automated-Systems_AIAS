import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";
import { isValidDeviceType } from "@/lib/edge-ai/utils";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const createDeviceProfileSchema = z.object({
  name: z.string().min(1).max(255),
  device_type: z.string().refine((val) => isValidDeviceType(val), {
    message: "Invalid device type",
  }),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  cpu_cores: z.number().int().positive().optional(),
  cpu_architecture: z.string().optional(),
  gpu_model: z.string().optional(),
  gpu_memory_mb: z.number().int().positive().optional(),
  npu_model: z.string().optional(),
  npu_capabilities: z.record(z.unknown()).optional(),
  total_memory_mb: z.number().int().positive().optional(),
  storage_type: z.string().optional(),
  os_type: z.string().optional(),
  os_version: z.string().optional(),
  runtime: z.string().optional(),
  runtime_version: z.string().optional(),
  max_power_watts: z.number().positive().optional(),
  thermal_constraints: z.record(z.unknown()).optional(),
  device_metadata: z.record(z.unknown()).optional(),
});

export const dynamic = "force-dynamic";

/**
 * GET /api/edge/device-profiles
 * List device profiles (user's own + system templates)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : request.cookies.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = request.headers.get("x-tenant-id") ||
      new URL(request.url).searchParams.get("tenant_id");

    // Get user's profiles and system templates
    let query = supabase
      .from("edge_ai_device_profiles")
      .select("*")
      .or(`user_id.eq.${user.id},is_template.eq.true,user_id.is.null`)
      .order("is_template", { ascending: true })
      .order("created_at", { ascending: false });

    if (tenantId) {
      query = query.or(`(tenant_id.eq.${tenantId},is_template.eq.true,user_id.is.null)`);
    }

    const { data: profiles, error } = await query;

    if (error) {
      logger.error(
        "Failed to get device profiles",
        error instanceof Error ? error : new Error(String(error)),
        { userId: user.id }
      );
      return handleApiError(error, "Failed to retrieve device profiles");
    }

    return NextResponse.json({ profiles: profiles || [] });
  } catch (error) {
    logger.error(
      "Error in GET /api/edge/device-profiles",
      error instanceof Error ? error : undefined
    );
    return handleApiError(error, "Failed to retrieve device profiles");
  }
}

/**
 * POST /api/edge/device-profiles
 * Create a new device profile
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : request.cookies.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createDeviceProfileSchema.parse(body);

    const tenantId = request.headers.get("x-tenant-id") ||
      new URL(request.url).searchParams.get("tenant_id");

    const { data: profile, error } = await supabase
      .from("edge_ai_device_profiles")
      .insert({
        ...validatedData,
        user_id: user.id,
        tenant_id: tenantId || null,
        is_template: false,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      logger.error(
        "Failed to create device profile",
        error instanceof Error ? error : new Error(String(error)),
        { userId: user.id }
      );
      return handleApiError(error, "Failed to create device profile");
    }

    logger.info("Device profile created", {
      profileId: profile.id,
      userId: user.id,
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    logger.error(
      "Error in POST /api/edge/device-profiles",
      error instanceof Error ? error : undefined
    );
    return handleApiError(error, "Failed to create device profile");
  }
}
