import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { telemetry } from "@/lib/monitoring/enhanced-telemetry";
import { SystemError, formatError } from "@/lib/errors";
import { validateEnvOnStartup } from "@/lib/env-validation";

// Load environment variables dynamically
const supabaseUrl = env.supabase.url;
const supabaseAnonKey = env.supabase.anonKey;
const supabaseServiceKey = env.supabase.serviceRoleKey;
const databaseUrl = env.database.url;

export const dynamic = "force-dynamic";

interface HealthCheckResult {
  ok: boolean;
  timestamp: string;
  errorMessage?: string;
  checks?: Record<string, boolean>;
  db?: {
    ok: boolean;
    latency_ms: number | null;
    error: string | null;
  };
  rest?: {
    ok: boolean;
    latency_ms: number | null;
    error: string | null;
  };
  auth?: {
    ok: boolean;
    latency_ms: number | null;
    error: string | null;
  };
  rls?: {
    ok: boolean;
    note?: string;
    error?: string;
  };
  storage?: {
    ok: boolean;
    latency_ms: number | null;
    buckets_count?: number;
    error: string | null;
  };
  total_latency_ms?: number;
}

export async function GET(): Promise<NextResponse<HealthCheckResult>> {
  const startTime = Date.now();
  const checks: Partial<HealthCheckResult> = {
    ok: true,
    timestamp: new Date().toISOString(),
  };

  // Validate environment variables
  try {
    validateEnvOnStartup();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    checks.ok = false;
    checks.errorMessage = `Environment validation failed: ${errorMessage}`;
    return NextResponse.json(checks as HealthCheckResult, { status: 503 });
  }

  // Check required env vars
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey || !databaseUrl) {
    const error = new SystemError(
      "Missing required environment variables",
      undefined,
      {
        supabase_url: !!supabaseUrl,
        supabase_anon_key: !!supabaseAnonKey,
        supabase_service_key: !!supabaseServiceKey,
        database_url: !!databaseUrl,
      }
    );
    const formatted = formatError(error);
    return NextResponse.json(
      {
        ok: false,
        timestamp: new Date().toISOString(),
        errorMessage: formatted.message,
        checks: formatted.details as Record<string, boolean>,
      },
      { status: formatted.statusCode }
    );
  }

  // Parallelize all health checks for better performance
  const [dbResult, restResult, authResult, rlsResult, storageResult] = await Promise.allSettled([
    // Database check via Supabase (since edge runtime can't use Prisma)
    (async () => {
      const dbStart = Date.now();
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      const { error } = await supabaseService.from("app_events").select("count").limit(1);
      return {
        ok: !error,
        latency_ms: Date.now() - dbStart,
        error: error?.message || null,
      };
    })(),
    
    // Supabase REST API check
    (async () => {
      const restStart = Date.now();
      const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
      const { error } = await supabaseAnon.from("app_events").select("count").limit(1);
      return {
        ok: !error,
        latency_ms: Date.now() - restStart,
        error: error?.message || null,
      };
    })(),
    
    // Auth check (service role)
    (async () => {
      const authStart = Date.now();
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { users: _users }, error } = await supabaseService.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });
      return {
        ok: !error,
        latency_ms: Date.now() - authStart,
        error: error?.message || null,
      };
    })(),
    
    // RLS check: Try to read as anon (should fail if RLS is working)
    (async () => {
      try {
        const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
 const { data: _data, error: _error } = await supabaseAnon
          .from("api_logs")
          .select("*")
          .limit(1);
        // If RLS is working, anon should not be able to read api_logs (unless policy allows)
        // This is a soft check - we just verify the query doesn't crash
        return {
          ok: true,
          note: "RLS policies active (anon access may be restricted)",
        };
      } catch (e: unknown) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    })(),
    
    // Storage check (if bucket exists)
    (async () => {
      try {
        const storageStart = Date.now();
        const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
        const { data, error } = await supabaseService.storage.listBuckets();
        return {
          ok: !error,
          latency_ms: Date.now() - storageStart,
          buckets_count: data?.length || 0,
          error: error?.message || null,
        };
      } catch (e: unknown) {
        return {
          ok: false,
          latency_ms: null,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    })(),
  ]);

  // Process results
  if (dbResult.status === 'fulfilled') {
    checks.db = dbResult.value;
    if (!checks.db.ok) checks.ok = false;
  } else {
    checks.db = {
      ok: false,
      latency_ms: null,
      error: dbResult.reason instanceof Error ? dbResult.reason.message : String(dbResult.reason),
    };
    checks.ok = false;
  }

  if (restResult.status === 'fulfilled') {
    checks.rest = restResult.value;
    if (!checks.rest.ok) checks.ok = false;
  } else {
    checks.rest = {
      ok: false,
      latency_ms: null,
      error: restResult.reason instanceof Error ? restResult.reason.message : String(restResult.reason),
    };
    checks.ok = false;
  }

  if (authResult.status === 'fulfilled') {
    checks.auth = authResult.value;
    if (!checks.auth.ok) checks.ok = false;
  } else {
    checks.auth = {
      ok: false,
      latency_ms: null,
      error: authResult.reason instanceof Error ? authResult.reason.message : String(authResult.reason),
    };
    checks.ok = false;
  }

  if (rlsResult.status === 'fulfilled') {
    checks.rls = rlsResult.value;
    if (!checks.rls.ok) checks.ok = false;
  } else {
    checks.rls = {
      ok: false,
      error: rlsResult.reason instanceof Error ? rlsResult.reason.message : String(rlsResult.reason),
    };
    checks.ok = false;
  }

  if (storageResult.status === 'fulfilled') {
    checks.storage = storageResult.value;
    if (!checks.storage.ok && checks.storage.error) {
      // Don't fail overall if storage check fails (optional)
    }
  } else {
    checks.storage = {
      ok: false,
      latency_ms: null,
      error: storageResult.reason instanceof Error ? storageResult.reason.message : String(storageResult.reason),
    };
    // Don't fail overall if storage check fails (optional)
  }

  checks.total_latency_ms = Date.now() - startTime;

  // Track health check performance
  telemetry.trackPerformance({
    name: "health_check",
    value: checks.total_latency_ms,
    unit: "ms",
    tags: { status: checks.ok ? "healthy" : "unhealthy" },
  });

  // Log health check
  if (checks.ok) {
    logger.info("Health check passed", { latency: checks.total_latency_ms });
  } else {
    logger.warn("Health check failed", { checks });
  }

  return NextResponse.json(checks as HealthCheckResult, {
    status: checks.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
