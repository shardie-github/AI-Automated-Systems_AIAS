"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Database } from "@/src/integrations/supabase/types";

/**
 * Server Action: User Sign-Up
 * 
 * Data Flow:
 * User Sign-up (Vercel Form) → Next.js Server Action → Supabase profiles table (RLS Check) → activity_log entry → Profile Page Reload (Server Component Fetch)
 * 
 * This action:
 * 1. Creates a user in Supabase Auth
 * 2. Creates a profile entry in the profiles table
 * 3. Logs the sign-up activity in activity_log
 * 4. Returns structured response for UI handling
 */

type SignUpResponse = {
  success: boolean;
  error?: string;
  data?: {
    userId: string;
    email: string;
  };
};

export async function signUpUser(
  email: string,
  password: string,
  displayName?: string
): Promise<SignUpResponse> {
  try {
    // Get Supabase admin client for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split("@")[0],
        },
      },
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || "Failed to create user account",
      };
    }

    const userId = authData.user.id;

    // Step 2: Create profile entry
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: email,
        display_name: displayName || email.split("@")[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      // If profile creation fails, we should clean up the auth user
      // In production, you might want to handle this more gracefully
      console.error("Profile creation error:", profileError);
      return {
        success: false,
        error: "Failed to create user profile",
      };
    }

    // Step 2.5: If user is being created as admin, generate Content Studio token
    // This will be handled by the database trigger, but we can also do it here explicitly
    // The trigger will handle it automatically when admin role is assigned

    // Step 3: Log sign-up activity
    const { error: activityError } = await supabase
      .from("activity_log")
      .insert({
        user_id: userId,
        activity_type: "sign_up",
        entity_type: "user",
        entity_id: userId,
        metadata: {
          email: email,
          display_name: displayName || email.split("@")[0],
          source: "server_action",
        },
        created_at: new Date().toISOString(),
      });

    if (activityError) {
      // Log error but don't fail the sign-up
      console.error("Activity log error:", activityError);
    }

    // Step 4: Revalidate relevant paths
    revalidatePath("/");
    revalidatePath("/account");

    return {
      success: true,
      data: {
        userId,
        email,
      },
    };
  } catch (error) {
    console.error("Sign-up error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
