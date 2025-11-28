import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { createGETHandler } from "@/lib/api/route-handler";
import { track } from "@/lib/telemetry/track";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export const runtime = "edge";

/**
 * GET /api/integrations/[provider]/callback
 * Handle OAuth callback
 */
export const GET = createGETHandler(
  async (context) => {
    const { request } = context;
    
    // Get provider from URL
    const provider = request.nextUrl.pathname.split("/")[2];
    if (!provider) {
      return NextResponse.json(
        { error: "Provider required" },
        { status: 400 }
      );
    }

    // Get OAuth code from query params
    const code = request.nextUrl.searchParams.get("code");
    const error = request.nextUrl.searchParams.get("error");

    if (error) {
      return NextResponse.json(
        { error: `OAuth error: ${error}` },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "OAuth code required" },
        { status: 400 }
      );
    }

    // Get user from session (in production, this would come from auth)
    // For now, we'll need to get it from a token or session
    const userId = request.headers.get("x-user-id") || "anonymous";

    try {
      // In a real implementation, you would:
      // 1. Exchange the OAuth code for an access token
      // 2. Store the token securely
      // 3. Set up webhooks if needed

      // For now, simulate storing the integration
      const integrationData: Record<string, unknown> = {
        user_id: userId,
        provider,
        status: "connected",
        connected_at: new Date().toISOString(),
      };

      // Add provider-specific data
      if (provider === "shopify") {
        const shop = request.nextUrl.searchParams.get("shop");
        integrationData.shop = shop;
      } else if (provider === "wave") {
        const businessId = request.nextUrl.searchParams.get("business_id");
        integrationData.business_id = businessId;
      }

      const { data: _integration, error: dbError } = await supabase
        .from("integrations")
        .upsert(integrationData, {
          onConflict: "user_id,provider",
        })
        .select()
        .single();

      if (dbError) {
        logger.error("Failed to store integration", dbError instanceof Error ? dbError : new Error(String(dbError)), { userId, provider });
        return NextResponse.json(
          { error: "Failed to connect integration" },
          { status: 500 }
        );
      }

      // Track integration connected event
      try {
        await track(userId, {
          type: "integration_connected",
          path: `/api/integrations/${provider}/callback`,
          meta: {
            provider,
            timestamp: new Date().toISOString(),
          },
          app: "web",
        });
      } catch (telemetryError) {
        logger.warn("Failed to track integration event", { error: telemetryError });
      }

      // Redirect to success page
      return NextResponse.redirect(
        `${request.nextUrl.origin}/onboarding/create-workflow?integration=${provider}`
      );
    } catch (error) {
      logger.error("Error handling OAuth callback", error instanceof Error ? error : undefined, { provider });
      return NextResponse.json(
        { error: "Failed to handle OAuth callback" },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: false,
  }
);
