import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export const dynamic = "force-dynamic";

/**
 * GET /api/edge/models/[id]
 * Get a specific model by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data: model, error } = await supabase
      .from("edge_ai_models")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Model not found" }, { status: 404 });
      }
      logger.error(
        "Failed to get edge AI model",
        error instanceof Error ? error : new Error(String(error)),
        { userId: user.id, modelId: id }
      );
      return handleApiError(error, "Failed to retrieve model");
    }

    return NextResponse.json({ model });
  } catch (error) {
    logger.error(
      "Error in GET /api/edge/models/[id]",
      error instanceof Error ? error : undefined
    );
    return handleApiError(error, "Failed to retrieve model");
  }
}

/**
 * PATCH /api/edge/models/[id]
 * Update a model
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const updateData: Record<string, unknown> = {};

    // Allow updating specific fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.upload_progress !== undefined)
      updateData.upload_progress = body.upload_progress;
    if (body.original_file_path !== undefined)
      updateData.original_file_path = body.original_file_path;
    if (body.original_size_bytes !== undefined)
      updateData.original_size_bytes = body.original_size_bytes;
    if (body.input_shape !== undefined) updateData.input_shape = body.input_shape;
    if (body.output_shape !== undefined)
      updateData.output_shape = body.output_shape;
    if (body.model_metadata !== undefined)
      updateData.model_metadata = body.model_metadata;

    const { data: model, error } = await supabase
      .from("edge_ai_models")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Model not found" }, { status: 404 });
      }
      logger.error(
        "Failed to update edge AI model",
        error instanceof Error ? error : new Error(String(error)),
        { userId: user.id, modelId: id }
      );
      return handleApiError(error, "Failed to update model");
    }

    return NextResponse.json({ model });
  } catch (error) {
    logger.error(
      "Error in PATCH /api/edge/models/[id]",
      error instanceof Error ? error : undefined
    );
    return handleApiError(error, "Failed to update model");
  }
}

/**
 * DELETE /api/edge/models/[id]
 * Delete a model
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { error } = await supabase
      .from("edge_ai_models")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      logger.error(
        "Failed to delete edge AI model",
        error instanceof Error ? error : new Error(String(error)),
        { userId: user.id, modelId: id }
      );
      return handleApiError(error, "Failed to delete model");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(
      "Error in DELETE /api/edge/models/[id]",
      error instanceof Error ? error : undefined
    );
    return handleApiError(error, "Failed to delete model");
  }
}
