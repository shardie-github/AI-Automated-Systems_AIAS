import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { SystemError, ValidationError, formatError } from "@/lib/errors";
import { logger } from "@/lib/logging/structured-logger";
import { telemetry } from "@/lib/monitoring/enhanced-telemetry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * ETL endpoint for pulling TikTok Ads data
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
    const tiktokToken = process.env.TIKTOK_ACCESS_TOKEN || process.env.TIKTOK_TOKEN;
    const tiktokAdvertiserId = process.env.TIKTOK_ADVERTISER_ID;
    const databaseUrl = env.database.url;

    if (!tiktokToken || !tiktokAdvertiserId || !databaseUrl) {
      const error = new SystemError(
        "Missing required environment variables: TIKTOK_ACCESS_TOKEN, TIKTOK_ADVERTISER_ID, DATABASE_URL"
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

    const tiktokApiVersion = "v1.3";
    const url = `https://business-api.tiktok.com/open_api/${tiktokApiVersion}/report/integrated/get/`;
    const body = {
      advertiser_id: tiktokAdvertiserId,
      service_type: "AUCTION",
      report_type: "BASIC",
      data_level: "AUCTION_ADGROUP",
      dimensions: ["stat_time_day", "campaign_id", "adgroup_id"],
      metrics: ["spend", "click", "impression", "conversion"],
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      page_size: 1000,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": tiktokToken,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TikTok API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as {
      data: {
        list: Array<{
          stat_time_day: string;
          spend: string;
          click: string;
          impression: string;
          conversion: string;
          campaign_id: string;
          adgroup_id: string;
        }>;
      };
    };

    // Store data in database
    let recordsInserted = 0;
    if (data.data?.list && data.data.list.length > 0) {
      for (const ad of data.data.list) {
        const { error } = await supabase.from("spend").upsert({
          platform: "tiktok",
          date: ad.stat_time_day,
          spend_cents: Math.round(parseFloat(ad.spend) * 100),
          clicks: parseInt(ad.click) || 0,
          impressions: parseInt(ad.impression) || 0,
          conversions: parseInt(ad.conversion) || 0,
        }, {
          onConflict: "platform,date",
        });

        if (error) {
          logger.warn("Failed to insert TikTok ad data", { error: error.message, date: ad.stat_time_day });
        } else {
          recordsInserted++;
        }
      }
    }

    const duration = Date.now() - startTime;

    // Track performance
    telemetry.trackPerformance({
      name: "etl_tiktok_ads",
      value: duration,
      unit: "ms",
      tags: { status: "success", records: recordsInserted.toString() },
    });

    logger.info("TikTok Ads ETL completed", { recordsInserted, duration });

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
      "TikTok Ads ETL error",
      error instanceof Error ? error : new Error(String(error))
    );

    telemetry.trackPerformance({
      name: "etl_tiktok_ads",
      value: duration,
      unit: "ms",
      tags: { status: "error" },
    });

    logger.error("TikTok Ads ETL failed", { error: systemError.message, duration });

    const formatted = formatError(systemError);
    return NextResponse.json(
      { error: formatted.message },
      { status: formatted.statusCode }
    );
  }
}
