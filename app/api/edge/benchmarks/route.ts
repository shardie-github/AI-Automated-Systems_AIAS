import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";
import { track } from "@/lib/telemetry/track";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const createBenchmarkRunSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  model_id: z.string().uuid().optional(),
  optimization_job_id: z.string().uuid().optional(),
  device_profile_id: z.string().uuid(),
  test_dataset_path: z.string().optional(),
  batch_size: z.number().int().positive().default(1),
  num_iterations: z.number().int().positive().default(100),
  warmup_iterations: z.number().int().nonnegative().default(10),
  benchmark_config: z.record(z.unknown()).optional(),
});

export const dynamic = "force-dynamic";

/**
 * GET /api/edge/benchmarks
 * List benchmark runs for the authenticated user
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
      .from("edge_ai_benchmark_runs")
      .select(`
        *,
        edge_ai_models:model_id(id, name),
        edge_ai_optimization_jobs:optimization_job_id(id, name),
        edge_ai_device_profiles:device_profile_id(id, name, device_type)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data: benchmarks, error } = await query;

    if (error) {
      logger.error(
        "Failed to get benchmark runs",
        error instanceof Error ? error : new Error(String(error)),
        { userId: user.id }
      );
      return handleApiError(error, "Failed to retrieve benchmark runs");
    }

    return NextResponse.json({ benchmarks: benchmarks || [] });
  } catch (error) {
    logger.error(
      "Error in GET /api/edge/benchmarks",
      error instanceof Error ? error : undefined
    );
    return handleApiError(error, "Failed to retrieve benchmark runs");
  }
}

/**
 * POST /api/edge/benchmarks
 * Create a new benchmark run
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
    const validatedData = createBenchmarkRunSchema.parse(body);

    // Verify device profile belongs to user or is a template
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

    // Verify model if provided
    if (validatedData.model_id) {
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
    }

    // Verify optimization job if provided
    if (validatedData.optimization_job_id) {
      const { data: job } = await supabase
        .from("edge_ai_optimization_jobs")
        .select("id")
        .eq("id", validatedData.optimization_job_id)
        .eq("user_id", user.id)
        .single();

      if (!job) {
        return NextResponse.json(
          { error: "Optimization job not found or access denied" },
          { status: 404 }
        );
      }
    }

    const tenantId = request.headers.get("x-tenant-id") ||
      new URL(request.url).searchParams.get("tenant_id");

    const { data: benchmark, error } = await supabase
      .from("edge_ai_benchmark_runs")
      .insert({
        ...validatedData,
        user_id: user.id,
        tenant_id: tenantId || null,
        status: "pending",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error(
        "Failed to create benchmark run",
        error instanceof Error ? error : new Error(String(error)),
        { userId: user.id }
      );
      return handleApiError(error, "Failed to create benchmark run");
    }

    logger.info("Benchmark run created", {
      benchmarkId: benchmark.id,
      userId: user.id,
    });

    try {
      await track(user.id, {
        type: "edge_ai_benchmark_created",
        path: "/api/edge/benchmarks",
        meta: {
          benchmark_id: benchmark.id,
          model_id: validatedData.model_id,
          optimization_job_id: validatedData.optimization_job_id,
          device_profile_id: validatedData.device_profile_id,
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });
    } catch (telemetryError) {
      logger.warn("Failed to track benchmark creation", {
        error: telemetryError,
      });
    }

    // TODO: Queue the benchmark job for background processing

    return NextResponse.json({ benchmark }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    logger.error(
      "Error in POST /api/edge/benchmarks",
      error instanceof Error ? error : undefined
    );
    return handleApiError(error, "Failed to create benchmark run");
  }
}
