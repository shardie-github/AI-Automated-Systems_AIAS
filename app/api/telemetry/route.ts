import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { SystemError, ValidationError, formatError } from "@/src/lib/errors";
import { recordError } from "@/lib/utils/error-detection";
import { retry } from "@/lib/utils/retry";
import { z } from "zod";

export const runtime = "edge";

interface TelemetryResponse {
  success: boolean;
  error?: string;
  received?: boolean;
}

const telemetrySchema = z.object({
  url: z.string().optional(),
  ttfb: z.number().optional(),
  lcp: z.number().optional(),
  cls: z.number().optional(),
  inp: z.number().optional(),
  fcp: z.number().optional(),
  fid: z.number().optional(),
  tti: z.number().optional(),
  ts: z.number().optional(),
  userAgent: z.string().max(100).optional(),
  connection: z.string().optional(),
  platform: z.enum(['web', 'ios', 'android']).optional(),
});

/**
 * Performance Telemetry Ingestion Endpoint
 * Receives performance beacons from client-side code
 * Stores anonymized metrics to metrics_log table
 */
export async function POST(req: NextRequest): Promise<NextResponse<TelemetryResponse>> {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch (error) {
      const validationError = new ValidationError("Invalid JSON body");
      const formatted = formatError(validationError);
      return NextResponse.json(
        { success: false, error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    // Validate request body
    const validationResult = telemetrySchema.safeParse(body);
    if (!validationResult.success) {
      const error = new ValidationError(
        "Invalid telemetry data",
        validationResult.error.errors.map(e => ({ path: e.path.map(String), message: e.message }))
      );
      const formatted = formatError(error);
      return NextResponse.json(
        { success: false, error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    const data = validationResult.data;

    // Extract performance data
    const {
      url,
      ttfb,
      lcp,
      cls,
      inp,
      fcp,
      fid,
      tti, // Time to Interactive (Expo/mobile)
      ts,
      userAgent,
      connection,
      platform, // 'web' | 'ios' | 'android'
    } = data;

    // Check if Expo telemetry is enabled
    const expoTelemetryEnabled = process.env.EXPO_PUBLIC_TELEMETRY === "true";
    
    // Only accept TTI from Expo if telemetry is enabled
    if (platform && platform !== "web" && !expoTelemetryEnabled) {
      const error = new ValidationError("Expo telemetry not enabled");
      const formatted = formatError(error);
      return NextResponse.json(
        { success: false, error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    // Anonymize IP (don't store full IP)
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const anonymizedIp = clientIp.split(".").slice(0, 2).join(".") + ".x.x";

    // Prepare metric payload
    const metric = {
      url: url || "/",
      ttfb: ttfb || null,
      lcp: lcp || null,
      cls: cls || null,
      inp: inp || null,
      fcp: fcp || null,
      fid: fid || null,
      tti: tti || null, // Time to Interactive (Expo/mobile)
      timestamp: ts || Date.now(),
      platform: platform || "web",
      // Anonymized metadata
      userAgent: userAgent ? userAgent.substring(0, 100) : null,
      connection: connection || null,
      ipPrefix: anonymizedIp,
    };

    // Store in Supabase
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

    // Determine source based on platform
    const source = platform && platform !== "web" ? "expo" : "telemetry";
    
    // Retry database insert with exponential backoff
    const { error } = await retry(
      async () => {
        const result = await supabase.from("metrics_log").insert({
          source,
          metric,
        });
        if (result.error) {
          throw new Error(result.error.message);
        }
        return result;
      },
      {
        maxAttempts: 3,
        initialDelayMs: 500,
        onRetry: (attempt, err) => {
          console.warn(`Retrying telemetry insert (attempt ${attempt})`, { error: err.message });
        },
      }
    );

    if (error) {
      const systemError = new SystemError(
        "Failed to store telemetry",
        error instanceof Error ? error : new Error(String(error)),
        { source, platform }
      );
      recordError(systemError, { endpoint: '/api/telemetry', source, platform });
      console.error("Error storing telemetry:", systemError);
      // Don't fail the request - telemetry is best effort
      return NextResponse.json(
        { success: false, error: systemError.message },
        { status: 200 } // Return 200 to avoid breaking client-side code
      );
    }

    return NextResponse.json(
      { success: true, received: true },
      { status: 200 }
    );
  } catch (error: unknown) {
    const systemError = new SystemError(
      "Telemetry ingestion error",
      error instanceof Error ? error : new Error(String(error))
    );
    recordError(systemError, { endpoint: '/api/telemetry' });
    console.error("Telemetry ingestion error:", systemError);
    // Always return success to avoid breaking client-side code
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 200 }
    );
  }
}
