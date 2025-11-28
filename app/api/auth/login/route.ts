import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { createPOSTHandler } from "@/lib/api/route-handler";
import { track } from "@/lib/telemetry/track";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const runtime = "edge";

/**
 * POST /api/auth/login
 * User login with telemetry tracking
 */
export const POST = createPOSTHandler(
  async (context) => {
    const { request } = context;
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (authError || !authData.user) {
      logger.error("Login failed", authError || undefined, { email: validatedData.email });
      return NextResponse.json(
        { error: authError?.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    // Track user active event (for retention tracking)
    try {
      await track(authData.user.id, {
        type: "user_active",
        path: "/api/auth/login",
        meta: {
          email: validatedData.email,
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });
    } catch (telemetryError) {
      logger.warn("Failed to track login event", { error: telemetryError });
    }

    logger.info("User logged in", { userId: authData.user.id, email: validatedData.email });

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      session: authData.session,
      message: "Login successful",
    });
  },
  {
    requireAuth: false,
    validateBody: loginSchema,
  }
);
