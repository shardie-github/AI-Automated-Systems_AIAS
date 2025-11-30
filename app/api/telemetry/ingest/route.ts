import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createPOSTHandler } from "@/lib/api/route-handler";
import { z } from "zod";
import { telemetry } from "@/lib/monitoring/enhanced-telemetry";

export const runtime = "edge";

/**
 * Telemetry ingestion endpoint schema
 * Validates telemetry payload structure
 */
const telemetrySchema = z.object({
  app: z.string().optional(),
  type: z.string().min(1),
  path: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
  ts: z.string().datetime().optional(),
}).passthrough(); // Allow additional fields

/**
 * Telemetry ingestion endpoint
 * Proxies to Supabase Edge Function
 * Migrated to use route handler utility for consistent error handling
 */
export const POST = createPOSTHandler(
  async (context) => {
    const { request } = context;
    const body = await request.text();
    
    // Validate JSON format and structure
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(body);
    } catch {
      throw new Error("Invalid JSON in request body");
    }
    
    // Validate against schema (non-blocking, log if invalid but don't fail)
    const validation = telemetrySchema.safeParse(parsedBody);
    if (!validation.success) {
      // Log validation errors but don't block ingestion
      console.warn("Telemetry validation warnings:", validation.error.errors);
    }
    
    const startTime = Date.now();
    
    // Proxy to Supabase Edge Function
    const r = await fetch(`${env.supabase.url}/functions/v1/ingest-telemetry`, {
      method: "POST", 
      headers: { 
        "content-type": "application/json",
        "authorization": `Bearer ${env.supabase.anonKey}` 
      }, 
      body
    });
    
    const responseText = await r.text();
    const duration = Date.now() - startTime;
    
    // Track performance
    telemetry.trackPerformance({
      name: "telemetry_ingest",
      value: duration,
      unit: "ms",
      tags: { status: r.ok ? "success" : "error", statusCode: r.status.toString() },
    });
    
    return new NextResponse(responseText, { 
      status: r.status, 
      headers: { 
        "content-type": "application/json",
        "X-Response-Time": `${duration}ms`
      } 
    });
  },
  {
    // Don't cache POST requests
    cache: { enabled: false },
    // No auth required for telemetry ingestion
    requireAuth: false,
    // Max body size: 1MB
    maxBodySize: 1024 * 1024,
  }
);
