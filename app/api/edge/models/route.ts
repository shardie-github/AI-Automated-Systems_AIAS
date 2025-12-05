import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";
import { track } from "@/lib/telemetry/track";
import { isValidModelFormat } from "@/lib/edge-ai/utils";
import type { EdgeAIModel } from "@/lib/edge-ai/types";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

// Model creation schema
const createModelSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  original_format: z.string().refine((val) => isValidModelFormat(val), {
    message: "Invalid model format",
  }),
  input_shape: z.record(z.unknown()).optional(),
  output_shape: z.record(z.unknown()).optional(),
  model_metadata: z.record(z.unknown()).optional(),
});

export const dynamic = "force-dynamic";

/**
 * GET /api/edge/models
 * List all models for the authenticated user
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
      .from("edge_ai_models")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data: models, error } = await query;

    if (error) {
      logger.error(
        "Failed to get edge AI models",
        error instanceof Error ? error : new Error(String(error)),
        { userId: user.id }
      );
      return handleApiError(error, "Failed to retrieve models");
    }

    return NextResponse.json({ models: models || [] });
  } catch (error) {
    logger.error(
      "Error in GET /api/edge/models",
      error instanceof Error ? error : undefined
    );
    return handleApiError(error, "Failed to retrieve models");
  }
}

/**
 * POST /api/edge/models
 * Create a new model entry (file upload handled separately)
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
    const validatedData = createModelSchema.parse(body);

    const tenantId = request.headers.get("x-tenant-id") ||
      new URL(request.url).searchParams.get("tenant_id");

    const { data: model, error } = await supabase
      .from("edge_ai_models")
      .insert({
        ...validatedData,
        user_id: user.id,
        tenant_id: tenantId || null,
        status: "uploaded",
        upload_progress: 0,
      })
      .select()
      .single();

    if (error) {
      logger.error(
        "Failed to create edge AI model",
        error instanceof Error ? error : new Error(String(error)),
        { userId: user.id }
      );
      return handleApiError(error, "Failed to create model");
    }

    logger.info("Edge AI model created", {
      modelId: model.id,
      userId: user.id,
    });

    try {
      await track(user.id, {
        type: "edge_ai_model_created",
        path: "/api/edge/models",
        meta: {
          model_id: model.id,
          model_name: validatedData.name,
          model_format: validatedData.original_format,
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });
    } catch (telemetryError) {
      logger.warn("Failed to track model creation event", {
        error: telemetryError,
      });
    }

    return NextResponse.json({ model }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    logger.error(
      "Error in POST /api/edge/models",
      error instanceof Error ? error : undefined
    );
    return handleApiError(error, "Failed to create model");
  }
}
