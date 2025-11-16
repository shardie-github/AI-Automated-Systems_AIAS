import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export const dynamic = "force-dynamic";

/**
 * GET /api/status
 * Get system status and health information
 */
export async function GET() {
  try {
    const status = {
      status: "operational",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      services: {
        database: "operational",
        auth: "operational",
        storage: "operational",
        api: "operational",
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        unit: "MB",
      },
    };

    // Quick database check
    try {
      const { error } = await supabase.from("app_events").select("count").limit(1);
      if (error) {
        status.services.database = "degraded";
        status.status = "degraded";
      }
    } catch (error) {
      status.services.database = "down";
      status.status = "degraded";
    }

    // Quick auth check
    try {
      const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
      if (error) {
        status.services.auth = "degraded";
        status.status = "degraded";
      }
    } catch (error) {
      status.services.auth = "degraded";
      status.status = "degraded";
    }

    const statusCode = status.status === "operational" ? 200 : 503;

    return NextResponse.json(status, { status: statusCode });
  } catch (error) {
    logger.error("Error in GET /api/status", { error });
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Failed to retrieve status",
      },
      { status: 500 }
    );
  }
}
