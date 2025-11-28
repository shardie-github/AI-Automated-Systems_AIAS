import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { NetworkError } from "@/lib/errors";
import { createPOSTHandler } from "@/lib/api/route-handler";
import { retry } from "@/lib/utils/retry";
import { telemetry } from "@/lib/monitoring/enhanced-telemetry";
import { z } from "zod";

export const runtime = "edge";

// interface IngestResponse {
//   success?: boolean;
//   error?: string;
// }

/**
 * Event ingestion schema
 * Validates event payload structure
 */
const eventSchema = z.object({
  type: z.string().min(1),
  data: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
}).passthrough(); // Allow additional fields

/**
 * Event ingestion endpoint
 * Proxies to Supabase Edge Function (avoids exposing service key)
 * Migrated to use route handler utility for consistent error handling
 */
export const POST = createPOSTHandler(
  async (context) => {
    const { request } = context;
    const startTime = Date.now();
    const body = await request.text();

    if (!body || body.length === 0) {
      throw new Error("Request body is required");
    }

    // Validate JSON structure (non-blocking)
    try {
      const parsed = JSON.parse(body);
      const validation = eventSchema.safeParse(parsed);
      if (!validation.success) {
        console.warn("Event validation warnings:", validation.error.errors);
      }
    } catch {
      // Invalid JSON - will be caught by route handler
    }

    // Retry Supabase Edge Function call with exponential backoff
    const response = await retry(
      async () => {
        const r = await fetch(`${env.supabase.url}/functions/v1/ingest-events`, {
          method: "POST",
          headers: { 
            "content-type":"application/json", 
            "authorization": `Bearer ${env.supabase.anonKey}` 
          },
          body,
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (!r.ok) {
          throw new NetworkError(
            `Supabase function returned ${r.status}`,
            r.status >= 500, // Retryable for 5xx errors
            { status: r.status, statusText: r.statusText }
          );
        }

        return r;
      },
      {
        maxAttempts: 3,
        initialDelayMs: 1000,
        onRetry: (attempt, err) => {
          console.warn(`Retrying ingest (attempt ${attempt})`, { error: err.message });
        },
      }
    );

    const responseText = await response.text();
    const duration = Date.now() - startTime;
    
    // Track performance
    telemetry.trackPerformance({
      name: "event_ingest",
      value: duration,
      unit: "ms",
      tags: { status: response.ok ? "success" : "error", statusCode: response.status.toString() },
    });
    
    return new NextResponse(responseText, { 
      status: response.status, 
      headers: { 
        "content-type":"application/json",
        "X-Response-Time": `${duration}ms`
      } 
    });
  },
  {
    cache: { enabled: false },
    requireAuth: false,
    maxBodySize: 1024 * 1024, // 1MB
  }
);
