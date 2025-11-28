import { NextResponse } from "next/server";
import { logger } from "@/lib/logging/structured-logger";
import { createGETHandler } from "@/lib/api/route-handler";

export const runtime = "edge";

/**
 * GET /api/integrations/[provider]/oauth
 * Initiate OAuth flow for a provider
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

    // Get callback URL from query params
    const callbackUrl = request.nextUrl.searchParams.get("callback_url") || 
                       `${request.nextUrl.origin}/api/integrations/${provider}/callback`;

    try {
      let oauthUrl: string;

      switch (provider) {
        case "shopify":
          const shop = request.nextUrl.searchParams.get("shop");
          if (!shop) {
            return NextResponse.json(
              { error: "Shop parameter required for Shopify" },
              { status: 400 }
            );
          }
          oauthUrl = `https://${shop}.myshopify.com/admin/oauth/authorize?client_id=${process.env.SHOPIFY_CLIENT_ID}&scope=read_orders,write_orders&redirect_uri=${encodeURIComponent(callbackUrl)}`;
          break;

        case "wave":
          oauthUrl = `https://api.waveapps.com/oauth2/authorize/?client_id=${process.env.WAVE_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=accounting:read,accounting:write`;
          break;

        default:
          return NextResponse.json(
            { error: `Unsupported provider: ${provider}` },
            { status: 400 }
          );
      }

      return NextResponse.json({
        oauth_url: oauthUrl,
        provider,
        message: "Redirect user to this URL to authorize",
      });
    } catch (error) {
      logger.error("Error initiating OAuth flow", error instanceof Error ? error : undefined, { provider });
      return NextResponse.json(
        { error: "Failed to initiate OAuth flow" },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: false,
  }
);
