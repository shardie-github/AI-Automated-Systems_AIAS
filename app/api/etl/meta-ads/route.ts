import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { SystemError, ValidationError, formatError } from "@/lib/errors";
import { logger } from "@/lib/logging/structured-logger";
import { telemetry } from "@/lib/monitoring/enhanced-telemetry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * ETL endpoint for pulling Meta Ads data
 * Used by Zapier automation as fallback if GitHub Actions unavailable
 * 
 * Authentication: Bearer token via ZAPIER_SECRET env var
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Authenticate request
    const authHeader = req.headers.get("authorization");
    const zapierSecret = process.env.ZAPIER_SECRET;

    if (!zapierSecret) {
      const error = new SystemError("Zapier secret not configured");
      const formatted = formatError(error);
      return NextResponse.json(
        { error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new ValidationError("Missing or invalid authorization header");
      const formatted = formatError(error);
      return NextResponse.json(
        { error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    const token = authHeader.substring(7);
    if (token !== zapierSecret) {
      const error = new ValidationError("Invalid authorization token");
      const formatted = formatError(error);
      return NextResponse.json(
        { error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    // Check required environment variables
    const metaToken = process.env.META_ACCESS_TOKEN || process.env.META_TOKEN;
    const metaAdAccountId = process.env.META_AD_ACCOUNT_ID;
    const databaseUrl = env.database.url;

    if (!metaToken || !metaAdAccountId || !databaseUrl) {
      const error = new SystemError(
        "Missing required environment variables: META_ACCESS_TOKEN, META_AD_ACCOUNT_ID, DATABASE_URL"
      );
      const formatted = formatError(error);
      return NextResponse.json(
        { error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

    // Pull last 30 days of data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const metaApiVersion = "v18.0";
    const url = `https://graph.facebook.com/${metaApiVersion}/${metaAdAccountId}/insights`;
    const params = new URLSearchParams({
      fields: "date_start,date_stop,spend,clicks,impressions,actions",
      time_range: JSON.stringify({
        since: startDate.toISOString().split("T")[0],
        until: endDate.toISOString().split("T")[0],
      }),
      level: "adset",
      access_token: metaToken,
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Meta API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as { data: Array<{
      date_start: string;
      date_stop: string;
      spend: string;
      clicks: string;
      impressions: string;
      actions: Array<{ action_type: string; value: string }>;
    }> };

    // Store data in database (assuming spend table exists)
    let recordsInserted = 0;
    if (data.data && data.data.length > 0) {
      for (const ad of data.data) {
        const conversions = ad.actions?.find((a) => a.action_type === "purchase")?.value || "0";
        
        const { error } = await supabase.from("spend").upsert({
          platform: "meta",
          date: ad.date_start,
          spend_cents: Math.round(parseFloat(ad.spend) * 100),
          clicks: parseInt(ad.clicks) || 0,
          impressions: parseInt(ad.impressions) || 0,
          conversions: parseInt(conversions) || 0,
        }, {
          onConflict: "platform,date",
        });

        if (error) {
          logger.warn("Failed to insert Meta ad data", { error: error.message, date: ad.date_start });
        } else {
          recordsInserted++;
        }
      }
    }

    const duration = Date.now() - startTime;

    // Track performance
    telemetry.trackPerformance({
      name: "etl_meta_ads",
      value: duration,
      unit: "ms",
      tags: { status: "success", records: recordsInserted.toString() },
    });

    logger.info("Meta Ads ETL completed", { recordsInserted, duration });

    return NextResponse.json({
      success: true,
      recordsInserted,
      dateRange: {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      },
      duration_ms: duration,
    });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const systemError = new SystemError(
      "Meta Ads ETL error",
      error instanceof Error ? error : new Error(String(error))
    );

    telemetry.trackPerformance({
      name: "etl_meta_ads",
      value: duration,
      unit: "ms",
      tags: { status: "error" },
    });

    logger.error("Meta Ads ETL failed", { error: systemError.message, duration });

    const formatted = formatError(systemError);
    return NextResponse.json(
      { error: formatted.message },
      { status: formatted.statusCode }
    );
  }
}
