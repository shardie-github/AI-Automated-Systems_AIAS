import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { SystemError, formatError } from "@/src/lib/errors";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache for 60 seconds

interface MetricsResponse {
  performance: {
    webVitals: Record<string, unknown>;
    supabase: Record<string, unknown>;
    expo: Record<string, unknown>;
    ci: Record<string, unknown>;
  };
  status: "healthy" | "degraded" | "error";
  lastUpdated: string;
  sources: Record<string, {
    latest: Record<string, unknown>;
    count: number;
    lastUpdated: string;
  }>;
  trends?: Record<string, {
    average: number;
    min: number;
    max: number;
    count: number;
  }>;
  error?: string;
  message?: string;
}

/**
 * Performance Metrics API Endpoint
 * Returns aggregated performance metrics from all sources
 * Used by /admin/metrics dashboard
 */
export async function GET(req: NextRequest): Promise<NextResponse<MetricsResponse>> {
  try {
    const supabase = createClient(
      env.supabase.url,
      env.supabase.serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Get latest metrics from each source
    const { data: latestMetrics, error } = await supabase
      .from("metrics_log")
      .select("source, metric, ts")
      .order("ts", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching metrics:", error);
      const systemError = new SystemError(
        "Failed to fetch metrics",
        error instanceof Error ? error : new Error(String(error)),
        { details: error.message }
      );
      const formatted = formatError(systemError);
      return NextResponse.json(
        {
          error: formatted.message,
          performance: {
            webVitals: {},
            supabase: {},
            expo: {},
            ci: {},
          },
          status: "error" as const,
          lastUpdated: new Date().toISOString(),
          sources: {},
        },
        { status: formatted.statusCode }
      );
    }

    // Aggregate metrics by source
    const aggregated: Record<string, any> = {
      performance: {
        webVitals: {},
        supabase: {},
        expo: {},
        ci: {},
      },
      status: "healthy",
      lastUpdated: new Date().toISOString(),
      sources: {},
    };

    // Group by source and extract key metrics
    const sourceGroups: Record<string, any[]> = {};
    for (const metric of latestMetrics || []) {
      if (!sourceGroups[metric.source]) {
        sourceGroups[metric.source] = [];
      }
      sourceGroups[metric.source].push(metric);
    }

    // Process each source
    for (const [source, metrics] of Object.entries(sourceGroups)) {
      const latest = metrics[0]?.metric || {};
      aggregated.sources[source] = {
        latest: latest,
        count: metrics.length,
        lastUpdated: metrics[0]?.ts,
      };

      // Map to performance object structure
      switch (source) {
        case "vercel":
        case "telemetry":
          aggregated.performance.webVitals = {
            ...aggregated.performance.webVitals,
            ...latest,
          };
          break;
        case "supabase":
          aggregated.performance.supabase = latest;
          break;
        case "expo":
          aggregated.performance.expo = latest;
          break;
        case "ci":
          aggregated.performance.ci = latest;
          break;
      }
    }

    // Calculate overall status
    const hasRegressions = Object.values(aggregated.sources).some(
      (source: any) => source.latest?.isRegression === true
    );
    if (hasRegressions) {
      aggregated.status = "degraded";
    }

    // Calculate trends (7-day moving average)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: trendData } = await supabase
      .from("metrics_log")
      .select("source, metric, ts")
      .gte("ts", sevenDaysAgo.toISOString())
      .order("ts", { ascending: true });

    if (trendData) {
      aggregated.trends = calculateTrends(trendData);
    }

    return NextResponse.json(aggregated, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    console.error("Metrics API error:", error);
    const systemError = new SystemError(
      "Internal server error",
      error instanceof Error ? error : new Error(String(error))
    );
    const formatted = formatError(systemError);
    return NextResponse.json(
      {
        error: formatted.message,
        message: error instanceof Error ? error.message : String(error),
        performance: {
          webVitals: {},
          supabase: {},
          expo: {},
          ci: {},
        },
        status: "error" as const,
        lastUpdated: new Date().toISOString(),
        sources: {},
      },
      { status: formatted.statusCode }
    );
  }
}

function calculateTrends(metrics: Array<{ source: string; metric: Record<string, unknown>; ts: string }>): Record<string, {
  average: number;
  min: number;
  max: number;
  count: number;
}> {
  const trends: Record<string, any> = {};
  const sourceGroups: Record<string, any[]> = {};

  // Group by source
  for (const metric of metrics) {
    if (!sourceGroups[metric.source]) {
      sourceGroups[metric.source] = [];
    }
    sourceGroups[metric.source].push(metric);
  }

  // Calculate 7-day moving averages
  for (const [source, sourceMetrics] of Object.entries(sourceGroups)) {
    const numericValues: number[] = [];
    for (const m of sourceMetrics) {
      const metric = m.metric || {};
      // Extract numeric values
      for (const key in metric) {
        if (typeof metric[key] === "number") {
          numericValues.push(metric[key]);
        }
      }
    }

    if (numericValues.length > 0) {
      const avg =
        numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      trends[source] = {
        average: avg,
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        count: numericValues.length,
      };
    }
  }

  return trends;
}
