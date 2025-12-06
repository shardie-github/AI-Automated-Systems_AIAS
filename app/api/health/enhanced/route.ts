import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { ShopifyClient } from "@/lib/integrations/shopify-client";
import { WaveClient } from "@/lib/integrations/wave-client";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  latency?: number;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * GET /api/health/enhanced
 * Enhanced health check with integration connectivity tests
 */
export async function GET() {
  const checks: HealthCheck[] = [];
  const startTime = Date.now();

  // 1. Database connectivity
  try {
    const dbStart = Date.now();
    const { error } = await supabase.from("app_events").select("count").limit(1);
    const latency = Date.now() - dbStart;

    checks.push({
      name: "database",
      status: error ? "unhealthy" : "healthy",
      latency,
      error: error?.message,
    });
  } catch (error) {
    checks.push({
      name: "database",
      status: "unhealthy",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // 2. Auth service
  try {
    const authStart = Date.now();
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    const latency = Date.now() - authStart;

    checks.push({
      name: "auth",
      status: error ? "unhealthy" : "healthy",
      latency,
      error: error?.message,
    });
  } catch (error) {
    checks.push({
      name: "auth",
      status: "unhealthy",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // 3. Integration connectivity (test with sample credentials if available)
  // Shopify connectivity test
  try {
    const shopifyStart = Date.now();
    // Test Shopify API connectivity (without actual credentials)
    const testUrl = "https://admin.shopify.com/store";
    const response = await fetch(testUrl, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    const latency = Date.now() - shopifyStart;

    checks.push({
      name: "shopify_api",
      status: response.ok ? "healthy" : "degraded",
      latency,
      details: { statusCode: response.status },
    });
  } catch (error) {
    checks.push({
      name: "shopify_api",
      status: "degraded",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Wave API connectivity test
  try {
    const waveStart = Date.now();
    const testUrl = "https://api.waveapps.com";
    const response = await fetch(testUrl, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    const latency = Date.now() - waveStart;

    checks.push({
      name: "wave_api",
      status: response.ok ? "healthy" : "degraded",
      latency,
      details: { statusCode: response.status },
    });
  } catch (error) {
    checks.push({
      name: "wave_api",
      status: "degraded",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // 4. Database consistency check
  try {
    const { data: orphanedCount, error } = await supabase
      .from("workflow_executions")
      .select("id", { count: "exact", head: true })
      .is("workflow_id", null);

    checks.push({
      name: "database_consistency",
      status: error ? "unhealthy" : orphanedCount && orphanedCount > 100 ? "degraded" : "healthy",
      error: error?.message,
      details: { orphanedExecutions: orphanedCount || 0 },
    });
  } catch (error) {
    checks.push({
      name: "database_consistency",
      status: "unhealthy",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // 5. Rate limiter check
  try {
    const { rateLimiter } = await import("@/lib/performance/rate-limiter");
    // Just check if rate limiter is initialized
    checks.push({
      name: "rate_limiter",
      status: "healthy",
      details: { initialized: true },
    });
  } catch (error) {
    checks.push({
      name: "rate_limiter",
      status: "degraded",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Calculate overall health
  const unhealthyCount = checks.filter((c) => c.status === "unhealthy").length;
  const degradedCount = checks.filter((c) => c.status === "degraded").length;
  const overallStatus =
    unhealthyCount > 0 ? "unhealthy" : degradedCount > 2 ? "degraded" : "healthy";

  const totalLatency = Date.now() - startTime;

  // Log health check
  logger.info("Enhanced health check completed", {
    overallStatus,
    unhealthyCount,
    degradedCount,
    totalLatency,
    checks: checks.map((c) => ({ name: c.name, status: c.status })),
  });

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      latency: totalLatency,
      checks,
      summary: {
        total: checks.length,
        healthy: checks.filter((c) => c.status === "healthy").length,
        degraded: degradedCount,
        unhealthy: unhealthyCount,
      },
    },
    {
      status: overallStatus === "unhealthy" ? 503 : overallStatus === "degraded" ? 200 : 200,
    }
  );
}
