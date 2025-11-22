import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { SystemError, formatError } from "@/lib/errors";
import { telemetry } from "@/lib/monitoring/enhanced-telemetry";
import { cacheService } from "@/lib/performance/cache";
import { createGETHandler } from "@/lib/api/route-handler";

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
 * Migrated to use route handler utility for consistent error handling and caching
 */
export const GET = createGETHandler(
  async (context) => {
    const { request } = context;
    const startTime = Date.now();
    
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

    // Get latest metrics from each source using optimized RPC function
    // This uses SQL DISTINCT ON for optimal performance (avoids N+1)
    let latestMetrics: Array<{ source: string; metric: Record<string, unknown>; ts: string }> | null = null;
    let error: { message: string } | null = null;
    
    const { data: rpcData, error: rpcError } = await supabase
      .rpc("get_latest_metrics_per_source", { limit_count: 100 });
    
    if (rpcError) {
      // Fallback to regular query if RPC function doesn't exist
      if (rpcError.message.includes("function") && rpcError.message.includes("does not exist")) {
        console.warn("RPC function not available, using fallback query");
        const { data: fallbackMetrics, error: fallbackError } = await supabase
          .from("metrics_log")
          .select("source, metric, ts")
          .order("ts", { ascending: false })
          .limit(100);
        
        if (fallbackError) {
          error = fallbackError;
        } else {
          latestMetrics = fallbackMetrics || [];
        }
      } else {
        error = rpcError;
      }
    } else {
      latestMetrics = rpcData || [];
    }

    if (error) {
      console.error("Error fetching metrics:", error);
      const systemError = new SystemError(
        "Failed to fetch metrics",
        error instanceof Error ? error : new Error(String(error)),
        { details: error.message }
      );
      const formatted = formatError(systemError);
      throw systemError; // Let route handler catch and format
    }
    
    if (!latestMetrics || latestMetrics.length === 0) {
      // No metrics available, return empty response
      latestMetrics = [];
    }

    // Aggregate metrics by source
    interface SourceMetrics {
      latest: Record<string, unknown>;
      count: number;
      lastUpdated: string;
    }
    
    interface AggregatedMetrics {
      performance: {
        webVitals: Record<string, unknown>;
        supabase: Record<string, unknown>;
        expo: Record<string, unknown>;
        ci: Record<string, unknown>;
      };
      status: "healthy" | "degraded" | "error";
      lastUpdated: string;
      sources: Record<string, SourceMetrics>;
      trends?: Record<string, {
        average: number;
        min: number;
        max: number;
        count: number;
      }>;
    }
    
    const aggregated: AggregatedMetrics = {
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

    // Group by source efficiently (single pass)
    interface MetricEntry {
      source: string;
      metric: Record<string, unknown>;
      ts: string;
    }
    
    const sourceGroups = new Map<string, MetricEntry[]>();
    const sourceLatest = new Map<string, MetricEntry>();
    
    // Single pass: group and track latest per source
    // RPC function already returns latest per source, so we can simplify
    for (const metric of latestMetrics) {
      const source = metric.source;
      
      // Track latest (RPC function already returns latest per source)
      if (!sourceLatest.has(source)) {
        sourceLatest.set(source, metric);
      }
      
      // Group all metrics (for count)
      if (!sourceGroups.has(source)) {
        sourceGroups.set(source, []);
      }
      sourceGroups.get(source)!.push(metric);
    }

    // Process each source (now using Map for O(1) lookups)
    for (const [source, metrics] of sourceGroups.entries()) {
      const latest = sourceLatest.get(source);
      aggregated.sources[source] = {
        latest: latest?.metric || {},
        count: metrics.length,
        lastUpdated: latest?.ts || new Date().toISOString(),
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
      (source: SourceMetrics) => (source.latest?.isRegression as boolean) === true
    );
    if (hasRegressions) {
      aggregated.status = "degraded";
    }

    // Calculate trends (7-day moving average) - use optimized RPC function and cache
    const trendsCacheKey = "metrics:trends:7day";
    let trends = await cacheService.get<Record<string, {
      average: number;
      min: number;
      max: number;
      count: number;
    }>>(trendsCacheKey, { ttl: 60 }); // Cache for 60 seconds
    
    if (!trends) {
      // Try optimized RPC function first
      const { data: rpcTrends, error: rpcError } = await supabase
        .rpc("get_metrics_trends", { days_back: 7 });
      
      if (!rpcError && rpcTrends && rpcTrends.length > 0) {
        // Convert RPC result to expected format
        trends = {};
        for (const row of rpcTrends) {
          trends[row.source] = {
            average: Number(row.average),
            min: Number(row.min_value),
            max: Number(row.max_value),
            count: Number(row.count_samples),
          };
        }
        // Cache the result
        await cacheService.set(trendsCacheKey, trends, { ttl: 60 });
      } else {
        // Fallback to client-side calculation
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: trendData } = await supabase
          .from("metrics_log")
          .select("source, metric, ts")
          .gte("ts", sevenDaysAgo.toISOString())
          .order("ts", { ascending: true });

        if (trendData && trendData.length > 0) {
          trends = calculateTrends(trendData);
          // Cache the result
          await cacheService.set(trendsCacheKey, trends, { ttl: 60 });
        }
      }
    }
    
    if (trends) {
      aggregated.trends = trends;
    }

    const duration = Date.now() - startTime;
    
    // Track performance
    telemetry.trackPerformance({
      name: "metrics_api",
      value: duration,
      unit: "ms",
      tags: { status: aggregated.status },
    });
    
    return NextResponse.json(aggregated, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "Content-Type": "application/json",
        "X-Response-Time": `${duration}ms`,
      },
    });
  },
  {
    // Cache metrics for 60 seconds
    cache: {
      enabled: true,
      ttl: 60,
      tags: ["metrics", "performance"],
    },
    // Require auth for admin metrics
    requireAuth: false, // Set to true if you want to restrict access
  }
);

interface TrendMetric {
  source: string;
  metric: Record<string, unknown>;
  ts: string;
}

function calculateTrends(metrics: TrendMetric[]): Record<string, {
  average: number;
  min: number;
  max: number;
  count: number;
}> {
  const trends: Record<string, {
    average: number;
    min: number;
    max: number;
    count: number;
  }> = {};
  const sourceGroups: Record<string, TrendMetric[]> = {};

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
          const value = metric[key];
          if (typeof value === "number") {
            numericValues.push(value);
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
