import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { createPOSTHandler } from "@/lib/api/route-handler";
import { track } from "@/lib/telemetry/track";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  // UTM parameters for acquisition tracking
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  // Referral tracking
  ref: z.string().optional(), // Referral code
});

export const runtime = "edge";

/**
 * POST /api/auth/signup
 * User signup with telemetry tracking
 */
export const POST = createPOSTHandler(
  async (context) => {
    const { request } = context;
    const body = await request.json();
    const validatedData = signupSchema.parse(body);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
        },
      },
    });

    if (authError || !authData.user) {
      logger.error("Signup failed", { error: authError, email: validatedData.email });
      return NextResponse.json(
        { error: authError?.message || "Failed to create account" },
        { status: 400 }
      );
    }

    // Track user signup event with UTM parameters
    try {
      // Store UTM parameters and referral in user metadata
      const userMetadata: Record<string, any> = {
        signup_source: validatedData.utm_source || "direct",
        signup_medium: validatedData.utm_medium || "none",
        signup_campaign: validatedData.utm_campaign || null,
        signup_term: validatedData.utm_term || null,
        signup_content: validatedData.utm_content || null,
        referral_code: validatedData.ref || null,
        signup_timestamp: new Date().toISOString(),
      };

      // Update user metadata in Supabase
      await supabase.auth.admin.updateUserById(authData.user.id, {
        user_metadata: {
          ...authData.user.user_metadata,
          ...userMetadata,
        },
      });

      // Track signup event with UTM parameters
      await track(authData.user.id, {
        type: "user_signed_up",
        path: "/api/auth/signup",
        meta: {
          email: validatedData.email,
          timestamp: new Date().toISOString(),
          ...userMetadata,
        },
        app: "web",
      });

      // Store acquisition channel data in database for analytics
      try {
        await supabase.from("conversion_events").insert({
          event_type: "signup",
          user_id: authData.user.id,
          session_id: `signup_${authData.user.id}`,
          properties: userMetadata,
        });
      } catch (dbError) {
        logger.warn("Failed to store conversion event", { error: dbError });
      }
    } catch (telemetryError) {
      // Log but don't fail signup if telemetry fails
      logger.warn("Failed to track signup event", { error: telemetryError });
    }

    logger.info("User signed up", { userId: authData.user.id, email: validatedData.email });

    return NextResponse.json(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        message: "Account created successfully",
      },
      { status: 201 }
    );
  },
  {
    requireAuth: false,
    validateBody: signupSchema,
  }
);
