import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { createPOSTHandler } from "@/lib/api/route-handler";
import { track } from "@/lib/telemetry/track";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const waveConnectSchema = z.object({
  code: z.string(),
  business_id: z.string().optional(),
});

export const runtime = "edge";

/**
 * POST /api/integrations/wave
 * Connect Wave Accounting integration via OAuth
 */
export const POST = createPOSTHandler(
  async (context) => {
    const { request } = context;
    
    // Get user from auth header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7)
      : request.cookies.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = waveConnectSchema.parse(body);

    // In a real implementation, you would:
    // 1. Exchange the OAuth code for an access token with Wave
    // 2. Store the token securely in the database
    // 3. Set up webhooks if needed

    // For now, we'll simulate storing the integration
    const { data: integration, error: dbError } = await supabase
      .from("integrations")
      .insert({
        user_id: user.id,
        provider: "wave",
        business_id: validatedData.business_id,
        status: "connected",
        connected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      logger.error("Failed to store Wave integration", dbError instanceof Error ? dbError : new Error(String(dbError)), { userId: user.id });
      return NextResponse.json(
        { error: "Failed to connect Wave integration" },
        { status: 500 }
      );
    }

    // Track integration connected event
    try {
      await track(user.id, {
        type: "integration_connected",
        path: "/api/integrations/wave",
        meta: {
          provider: "wave",
          business_id: validatedData.business_id,
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });

      // Check if user has activated (has integration + workflow)
      const { data: workflows } = await supabase
        .from("workflows")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      // User is activated if they have at least one integration and one workflow
      if (workflows && workflows.length > 0) {
        await track(user.id, {
          type: "user_activated",
          path: "/api/integrations/wave",
          meta: {
            timestamp: new Date().toISOString(),
            activation_method: "integration_connected",
          },
          app: "web",
        });
      }
    } catch (telemetryError) {
      logger.warn("Failed to track integration event", { error: telemetryError });
    }

    logger.info("Wave integration connected", { userId: user.id, businessId: validatedData.business_id });

    return NextResponse.json({
      integration,
      message: "Wave Accounting integration connected successfully",
    });
  },
  {
    requireAuth: true,
    validateBody: waveConnectSchema,
  }
);

/**
 * GET /api/integrations/wave/oauth
 * Initiate Wave OAuth flow
 */
export async function GET(_request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Generate OAuth URL with your Wave app credentials
    // 2. Redirect user to Wave OAuth page
    // 3. Handle callback in POST endpoint above

    const waveOAuthUrl = `https://api.waveapps.com/oauth2/authorize/?client_id=${process.env.WAVE_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.WAVE_REDIRECT_URI || "")}&scope=accounting:read,accounting:write`;

    return NextResponse.json({
      oauth_url: waveOAuthUrl,
      message: "Redirect user to this URL to authorize",
    });
  } catch (error) {
    logger.error("Error initiating Wave OAuth", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}
