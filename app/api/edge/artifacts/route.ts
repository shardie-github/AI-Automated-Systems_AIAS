import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export const dynamic = "force-dynamic";

/**
 * GET /api/edge/artifacts
 * List artifacts for the authenticated user
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

    const artifactType = new URL(request.url).searchParams.get("artifact_type");
    const modelId = new URL(request.url).searchParams.get("model_id");
    const optimizationJobId = new URL(request.url).searchParams.get("optimization_job_id");

    let query = supabase
      .from("edge_ai_artifacts")
      .select(`
        *,
        edge_ai_models:model_id(id, name),
        edge_ai_optimization_jobs:optimization_job_id(id, name),
        edge_ai_device_profiles:device_profile_id(id, name, device_type)
      `)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    if (artifactType) {
      query = query.eq("artifact_type", artifactType);
    }

    if (modelId) {
      query = query.eq("model_id", modelId);
    }

    if (optimizationJobId) {
      query = query.eq("optimization_job_id", optimizationJobId);
    }

    const { data: artifacts, error } = await query;

    if (error) {
      logger.error(
        "Failed to get artifacts",
        error instanceof Error ? error : new Error(String(error)),
        { userId: user.id }
      );
      return handleApiError(error, "Failed to retrieve artifacts");
    }

    return NextResponse.json({ artifacts: artifacts || [] });
  } catch (error) {
    logger.error(
      "Error in GET /api/edge/artifacts",
      error instanceof Error ? error : undefined
    );
    return handleApiError(error, "Failed to retrieve artifacts");
  }
}
