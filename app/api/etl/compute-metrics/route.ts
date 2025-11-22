import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { SystemError, ValidationError, formatError } from "@/lib/errors";
import { logger } from "@/lib/logging/structured-logger";
import { telemetry } from "@/lib/monitoring/enhanced-telemetry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * ETL endpoint for computing aggregated metrics
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

    // Parse optional date range from request body
    let startDate: Date;
    let endDate: Date;

    try {
      const body = await req.json().catch(() => ({}));
      if (body.start && body.end) {
        startDate = new Date(body.start);
        endDate = new Date(body.end);
      } else {
        // Default to last 90 days
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
      }
    } catch {
      // Default to last 90 days if body parsing fails
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
    }

    // Initialize Supabase client
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

    // Call the database function to recompute metrics
    // Assuming the function exists: recompute_metrics_daily(start_date, end_date)
    const { data, error } = await supabase.rpc("recompute_metrics_daily", {
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    });

    if (error) {
      // If function doesn't exist, try alternative approach
      logger.warn("recompute_metrics_daily function not found, attempting manual computation", { error: error.message });
      
      // Manual computation: aggregate spend data by date
      const { data: spendData, error: spendError } = await supabase
        .from("spend")
        .select("*")
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0]);

      if (spendError) {
        throw new Error(`Failed to fetch spend data: ${spendError.message}`);
      }

      // Group by date and compute metrics
      const metricsByDate = new Map<string, {
        date: string;
        total_spend_cents: number;
        total_clicks: number;
        total_impressions: number;
        total_conversions: number;
        platforms: string[];
      }>();

      interface SpendRow {
        date: string;
        spend_cents?: number;
        clicks?: number;
        impressions?: number;
        conversions?: number;
        platform?: string;
        [key: string]: unknown;
      }

      spendData?.forEach((row: SpendRow) => {
        const date = row.date;
        if (!metricsByDate.has(date)) {
          metricsByDate.set(date, {
            date,
            total_spend_cents: 0,
            total_clicks: 0,
            total_impressions: 0,
            total_conversions: 0,
            platforms: [],
          });
        }

        const metrics = metricsByDate.get(date)!;
        metrics.total_spend_cents += row.spend_cents || 0;
        metrics.total_clicks += row.clicks || 0;
        metrics.total_impressions += row.impressions || 0;
        metrics.total_conversions += row.conversions || 0;
        if (row.platform && !metrics.platforms.includes(row.platform)) {
          metrics.platforms.push(row.platform);
        }
      });

      // Store computed metrics (assuming metrics_daily table exists)
      let recordsInserted = 0;
      for (const [date, metrics] of metricsByDate.entries()) {
        const { error: upsertError } = await supabase.from("metrics_daily").upsert({
          date: metrics.date,
          total_spend_cents: metrics.total_spend_cents,
          total_clicks: metrics.total_clicks,
          total_impressions: metrics.total_impressions,
          total_conversions: metrics.total_conversions,
          platforms: metrics.platforms,
        }, {
          onConflict: "date",
        });

        if (upsertError) {
          logger.warn("Failed to insert metrics", { error: upsertError.message, date });
        } else {
          recordsInserted++;
        }
      }

      const duration = Date.now() - startTime;

      telemetry.trackPerformance({
        name: "etl_compute_metrics",
        value: duration,
        unit: "ms",
        tags: { status: "success", records: recordsInserted.toString() },
      });

      logger.info("Metrics computation completed", { recordsInserted, duration });

      return NextResponse.json({
        success: true,
        recordsInserted,
        dateRange: {
          start: startDate.toISOString().split("T")[0],
          end: endDate.toISOString().split("T")[0],
        },
        duration_ms: duration,
      });
    }

    const duration = Date.now() - startTime;

    telemetry.trackPerformance({
      name: "etl_compute_metrics",
      value: duration,
      unit: "ms",
      tags: { status: "success" },
    });

    logger.info("Metrics computation completed", { duration });

    return NextResponse.json({
      success: true,
      dateRange: {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      },
      duration_ms: duration,
      functionResult: data,
    });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const systemError = new SystemError(
      "Compute Metrics ETL error",
      error instanceof Error ? error : new Error(String(error))
    );

    telemetry.trackPerformance({
      name: "etl_compute_metrics",
      value: duration,
      unit: "ms",
      tags: { status: "error" },
    });

    logger.error("Compute Metrics ETL failed", { error: systemError.message, duration });

    const formatted = formatError(systemError);
    return NextResponse.json(
      { error: formatted.message },
      { status: formatted.statusCode }
    );
  }
}
