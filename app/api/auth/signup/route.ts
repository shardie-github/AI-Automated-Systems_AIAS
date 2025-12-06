import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";
import { z } from "zod";
import { trackSignup } from "@/lib/analytics/funnel-tracking";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().optional(),
});

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/signup
 * Create a new user account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = signupSchema.parse(body);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          full_name: validated.fullName,
        },
      },
    });

    if (authError || !authData.user) {
      logger.error("Failed to create user", authError instanceof Error ? authError : new Error(String(authError)));
      return NextResponse.json(
        { error: authError?.message || "Failed to create account" },
        { status: 400 }
      );
    }

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        email: validated.email,
        full_name: validated.fullName || null,
        subscription_tier: "trial",
        trial_started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      logger.error("Failed to create profile", profileError instanceof Error ? profileError : new Error(String(profileError)), {
        userId: authData.user.id,
      });
      // Don't fail signup if profile creation fails - user can still log in
    }

    // Track signup in funnel
    trackSignup(authData.user.id, {
      email: validated.email,
      timestamp: new Date().toISOString(),
    });

    // Send welcome email (async, don't wait)
    const supabaseUrl = env.supabase.url;
    const supabaseServiceKey = env.supabase.serviceRoleKey;
    if (supabaseServiceKey && supabaseUrl) {
      fetch(`${supabaseUrl}/functions/v1/welcome-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: authData.user.id,
          email: validated.email,
          firstName: validated.fullName?.split(" ")[0] || "there",
        }),
      }).catch((error) => {
        logger.warn("Failed to send welcome email", { error: error instanceof Error ? error.message : String(error) });
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      message: "Account created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return handleApiError(error, "Failed to create account");
  }
}
