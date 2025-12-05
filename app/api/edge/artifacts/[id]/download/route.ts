import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export const dynamic = "force-dynamic";

/**
 * GET /api/edge/artifacts/[id]/download
 * Download an artifact (increments download count)
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

    // Get artifact
    const { data: artifact, error: fetchError } = await supabase
      .from("edge_ai_artifacts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (fetchError || !artifact) {
      if (fetchError?.code === "PGRST116") {
        return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
      }
      logger.error(
        "Failed to get artifact",
        fetchError instanceof Error ? fetchError : new Error(String(fetchError)),
        { userId: user.id, artifactId: id }
      );
      return handleApiError(fetchError, "Failed to retrieve artifact");
    }

    // Check expiration
    if (artifact.expires_at && new Date(artifact.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Artifact has expired" },
        { status: 410 }
      );
    }

    // Increment download count
    await supabase
      .from("edge_ai_artifacts")
      .update({
        download_count: (artifact.download_count || 0) + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq("id", id);

    // TODO: Generate signed URL for file download from storage
    // For now, return the file path and metadata
    // In production, you'd generate a signed URL from your storage provider (S3, GCS, etc.)

    return NextResponse.json({
      artifact: {
        id: artifact.id,
        name: artifact.name,
        file_path: artifact.file_path,
        file_size_bytes: artifact.file_size_bytes,
        mime_type: artifact.mime_type,
        // In production, include a signed download URL here
        // download_url: await generateSignedUrl(artifact.file_path),
      },
    });
  } catch (error) {
    logger.error(
      "Error in GET /api/edge/artifacts/[id]/download",
      error instanceof Error ? error : undefined
    );
    return handleApiError(error, "Failed to download artifact");
  }
}
