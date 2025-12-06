"use server";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/src/integrations/supabase/types";

/**
 * Server Action: Assign Admin Role
 * Assigns admin role to a user and automatically generates Content Studio token
 */
export async function assignAdminRole(userId: string): Promise<{
  success: boolean;
  error?: string;
  token?: string;
}> {
  try {
    const supabaseUrl = env.supabase.url;
    const supabaseServiceKey = env.supabase.serviceRoleKey;

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        success: false,
        error: "Server configuration error: Missing Supabase credentials",
      };
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Assign admin role (trigger will auto-generate token)
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "admin",
      })
      .onConflict("user_id,role")
      .ignore();

    if (roleError) {
      console.error("Role assignment error:", roleError);
      return {
        success: false,
        error: "Failed to assign admin role",
      };
    }

    // Get or create Content Studio token
    const { data: token, error: tokenError } = await supabase.rpc(
      "get_or_create_content_studio_token",
      { _user_id: userId }
    );

    if (tokenError) {
      console.error("Token generation error:", tokenError);
      // Don't fail if token generation fails - trigger should handle it
    }

    return {
      success: true,
      token: token || undefined,
    };
  } catch (error) {
    console.error("Admin role assignment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Server Action: Get Content Studio Token for Current User
 */
export async function getContentStudioToken(): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  try {
    const supabaseUrl = env.supabase.url;
    const supabaseServiceKey = env.supabase.serviceRoleKey;

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        success: false,
        error: "Server configuration error",
      };
    }

    // This should be called from a server component with user context
    // For now, return error - should be called via API route with session
    return {
      success: false,
      error: "Use /api/content/auth endpoint instead",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
