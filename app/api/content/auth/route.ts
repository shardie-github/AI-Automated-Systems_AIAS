import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { cookies } from "next/headers";

/**
 * GET /api/content/auth
 * Get Content Studio token for authenticated admin user
 */
export async function GET(request: NextRequest) {
  try {
    // Get Supabase client
    const supabaseUrl = env.supabase.url;
    const supabaseAnonKey = env.supabase.anonKey;
    
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get or create token
    const supabaseAdmin = createClient(supabaseUrl, env.supabase.serviceRoleKey);
    const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc(
      "get_or_create_content_studio_token",
      { _user_id: user.id }
    );

    if (tokenError) {
      console.error("Token generation error:", tokenError);
      return NextResponse.json(
        { error: "Failed to generate token" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      token: tokenData,
    });
  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content/auth/verify
 * Verify Content Studio token and return user info
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token required" },
        { status: 400 }
      );
    }

    // Verify token exists and get user
    const supabaseUrl = env.supabase.url;
    const supabaseAdmin = createClient(supabaseUrl, env.supabase.serviceRoleKey);

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, display_name")
      .eq("content_studio_token", token)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Verify user is still admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", profile.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return NextResponse.json(
        { error: "User is no longer an admin" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.display_name,
      },
    });
  } catch (error: any) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
