import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";
import { track } from "@/lib/telemetry/track";
import { isValidModelFormat, isValidDeviceType } from "@/lib/edge-ai/utils";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const createOptimizationJobSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  model_id: z.string().uuid(),
  device_profile_id: z.string().uuid(),
  target_format: z.string().refine((val) => isValidModelFormat(val), {
    message: "Invalid target format",
  }),
  quantization_type: z.enum(["int8", "int4", "fp8", "fp16", "fp32", "dynamic", "none"]).optional(),
  optimization_level: z.enum(["speed", "balanced", "size"]).default("balanced"),
  additional_config: z.record(z.unknown()).optional(),
});

export const dynamic = "force-dynamic";

/**
 * GET /api/edge/optimization-jobs
 * List optimization jobs for the authenticated user
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

    let query = supabase
      .from("edge_ai_optimization_jobs")
      .select(`
        *,
        edge_ai_models:model_id(id, name, original_format),
        edge_ai_device_profiles:device_profile_id(id, name, device_type)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data: jobs, error } = await query;

    if (error) {
      logger.error(
        "Failed to get optimization jobs",
        error instanceof Error ? error : new Error(String(error)),
        { userId: user.id }
      );
      return handleApiError(error, "Failed to retrieve optimization jobs");
    }

    return NextResponse.json({ jobs: jobs || [] });
  } catch (error) {
    logger.error(
      "Error in GET /api/edge/optimization-jobs",
      error instanceof Error ? error : undefined
    );
    return handleApiError(error, "Failed to retrieve optimization jobs");
  }
}

/**
 * POST /api/edge/optimization-jobs
 * Create a new optimization job
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
    const validatedData = createOptimizationJobSchema.parse(body);

    // Verify model and device profile belong to user
    const { data: model } = await supabase
      .from("edge_ai_models")
      .select("id")
      .eq("id", validatedData.model_id)
      .eq("user_id", user.id)
      .single();

    if (!model) {
      return NextResponse.json(
        { error: "Model not found or access denied" },
        { status: 404 }
      );
    }

    const { data: deviceProfile } = await supabase
      .from("edge_ai_device_profiles")
      .select("id")
      .or(`id.eq.${validatedData.device_profile_id},is_template.eq.true`)
      .single();

    if (!deviceProfile) {
      return NextResponse.json(
        { error: "Device profile not found or access denied" },
        { status: 404 }
      );
    }

    const tenantId = request.headers.get("x-tenant-id") ||
      new URL(request.url).searchParams.get("tenant_id");

    const { data: job, error } = await supabase
      .from("edge_ai_optimization_jobs")
      .insert({
        ...validatedData,
        user_id: user.id,
        tenant_id: tenantId || null,
        status: "pending",
        progress: 0,
        queued_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error(
        "Failed to create optimization job",
        error instanceof Error ? error : new Error(String(error)),
        { userId: user.id }
      );
      return handleApiError(error, "Failed to create optimization job");
    }

    logger.info("Optimization job created", {
      jobId: job.id,
      userId: user.id,
      modelId: validatedData.model_id,
    });

    try {
      await track(user.id, {
        type: "edge_ai_optimization_job_created",
        path: "/api/edge/optimization-jobs",
        meta: {
          job_id: job.id,
          model_id: validatedData.model_id,
          device_profile_id: validatedData.device_profile_id,
          target_format: validatedData.target_format,
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });
    } catch (telemetryError) {
      logger.warn("Failed to track optimization job creation", {
        error: telemetryError,
      });
    }

    // TODO: Queue the optimization job for background processing
    // This would integrate with your job queue system (e.g., Bull, BullMQ, etc.)

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    logger.error(
      "Error in POST /api/edge/optimization-jobs",
      error instanceof Error ? error : undefined
    );
    return handleApiError(error, "Failed to create optimization job");
  }
}
