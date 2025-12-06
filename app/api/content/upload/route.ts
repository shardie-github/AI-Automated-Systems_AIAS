import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * POST /api/content/upload
 * Uploads an image to Supabase storage
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication - support both admin token and legacy env token
    const authHeader = request.headers.get("authorization");
    const providedToken = authHeader?.replace("Bearer ", "");
    
    if (!providedToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let isAuthorized = false;
    
    try {
      const supabaseAdmin = createClient(
        env.supabase.url,
        env.supabase.serviceRoleKey
      );

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("content_studio_token", providedToken)
        .single();

      if (profile) {
        const { data: roleData } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id)
          .eq("role", "admin")
          .single();

        if (roleData) {
          isAuthorized = true;
        }
      }
    } catch {
      // Fall back to legacy token
    }

    if (!isAuthorized) {
      const legacyToken = process.env.CONTENT_STUDIO_TOKEN;
      if (legacyToken && providedToken === legacyToken) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      env.supabase.url,
      env.supabase.serviceRoleKey
    );

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split(".").pop();
    const fileName = `content-studio/${timestamp}-${randomString}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("public")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("public")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: fileName,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
