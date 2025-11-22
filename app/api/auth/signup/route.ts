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

    // Track user signup event
    try {
      await track(authData.user.id, {
        type: "user_signed_up",
        path: "/api/auth/signup",
        meta: {
          email: validatedData.email,
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });
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
