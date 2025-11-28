import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { createPOSTHandler } from "@/lib/api/route-handler";
import { track } from "@/lib/telemetry/track";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const shopifyConnectSchema = z.object({
  code: z.string(),
  shop: z.string(),
});

export const runtime = "edge";

/**
 * POST /api/integrations/shopify
 * Connect Shopify integration via OAuth
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
    const validatedData = shopifyConnectSchema.parse(body);

    // In a real implementation, you would:
    // 1. Exchange the OAuth code for an access token with Shopify
    // 2. Store the token securely in the database
    // 3. Set up webhooks if needed

    // For now, we'll simulate storing the integration
    const { data: integration, error: dbError } = await supabase
      .from("integrations")
      .insert({
        user_id: user.id,
        provider: "shopify",
        shop: validatedData.shop,
        status: "connected",
        connected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      logger.error("Failed to store Shopify integration", dbError instanceof Error ? dbError : new Error(String(dbError)), { userId: user.id });
      return NextResponse.json(
        { error: "Failed to connect Shopify integration" },
        { status: 500 }
      );
    }

    // Track integration connected event
    try {
      await track(user.id, {
        type: "integration_connected",
        path: "/api/integrations/shopify",
        meta: {
          provider: "shopify",
          shop: validatedData.shop,
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
          path: "/api/integrations/shopify",
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

    logger.info("Shopify integration connected", { userId: user.id, shop: validatedData.shop });

    return NextResponse.json({
      integration,
      message: "Shopify integration connected successfully",
    });
  },
  {
    requireAuth: true,
    validateBody: shopifyConnectSchema,
  }
);

/**
 * GET /api/integrations/shopify/oauth
 * Initiate Shopify OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const shop = request.nextUrl.searchParams.get("shop");
    if (!shop) {
      return NextResponse.json(
        { error: "Shop parameter required" },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Generate OAuth URL with your Shopify app credentials
    // 2. Redirect user to Shopify OAuth page
    // 3. Handle callback in POST endpoint above

    const shopifyOAuthUrl = `https://${shop}.myshopify.com/admin/oauth/authorize?client_id=${process.env.SHOPIFY_CLIENT_ID}&scope=read_orders,write_orders&redirect_uri=${encodeURIComponent(process.env.SHOPIFY_REDIRECT_URI || "")}`;

    return NextResponse.json({
      oauth_url: shopifyOAuthUrl,
      message: "Redirect user to this URL to authorize",
    });
  } catch (error) {
    logger.error("Error initiating Shopify OAuth", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}
