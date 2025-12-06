import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { createPOSTHandler } from "@/lib/api/route-handler";
import { track } from "@/lib/telemetry/track";
import { rateLimit, getClientIP } from "@/lib/utils/rate-limit";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const runtime = "edge";

/**
 * POST /api/auth/login
 * User login with telemetry tracking and rate limiting
 */
export const POST = createPOSTHandler(
  async (context) => {
    const { request } = context;
    
    // Rate limiting: 5 login attempts per 15 minutes per IP
    const ip = getClientIP(request);
    const limit = rateLimit(ip, 5, 15 * 60 * 1000);
    
    if (!limit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many login attempts. Please try again later.",
          retryAfter: Math.ceil((limit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((limit.resetTime - Date.now()) / 1000)),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(limit.resetTime),
          }
        }
      );
    }
    
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (authError || !authData.user) {
      logger.error("Login failed", authError || undefined, { email: validatedData.email });
      // Don't reveal if email exists or not (security best practice)
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials and try again." },
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
