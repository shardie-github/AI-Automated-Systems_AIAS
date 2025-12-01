import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/src/integrations/supabase/types";

/**
 * Health Status Endpoint: "All-Cylinder Firing Check"
 * 
 * Verifies all 3 KPIs are met:
 * - KPI 1: New Users This Week > 50
 * - KPI 2: Average Post Views > 100
 * - KPI 3: Actions Completed in Last Hour > 20
 * 
 * Returns: "Status: Loud and High ✓" only if all KPIs are met
 */

type HealthStatus = {
  status: "loud_and_high" | "needs_attention";
  timestamp: string;
  kpis: {
    newUsersWeek: {
      value: number;
      threshold: number;
      met: boolean;
    };
    avgPostViews: {
      value: number;
      threshold: number;
      met: boolean;
    };
    actionsLastHour: {
      value: number;
      threshold: number;
      met: boolean;
    };
  };
  allCylindersFiring: boolean;
  message: string;
};

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          status: "needs_attention",
          error: "Server configuration error",
          message: "Status: Configuration Issue ⚠️",
        },
        { status: 500 }
      );
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Fetch all 3 KPI views
    const [kpi1Result, kpi2Result, kpi3Result] = await Promise.all([
      supabase.from("kpi_new_users_week").select("*").single(),
      supabase.from("kpi_avg_post_views").select("*").single(),
      supabase.from("kpi_actions_last_hour").select("*").single(),
    ]);

    // Handle KPI 1: New Users This Week
    const kpi1 = kpi1Result.data;
    const newUsersWeek = {
      value: kpi1?.new_users_count || 0,
      threshold: 50,
      met: kpi1?.threshold_met || false,
    };

    // Handle KPI 2: Average Post Views
    const kpi2 = kpi2Result.data;
    const avgPostViews = {
      value: Number(kpi2?.avg_post_views || 0),
      threshold: 100,
      met: kpi2?.threshold_met || false,
    };

    // Handle KPI 3: Actions Last Hour
    const kpi3 = kpi3Result.data;
    const actionsLastHour = {
      value: kpi3?.actions_count || 0,
      threshold: 20,
      met: kpi3?.threshold_met || false,
    };

    // Determine if all cylinders are firing
    const allCylindersFiring =
      newUsersWeek.met && avgPostViews.met && actionsLastHour.met;

    const healthStatus: HealthStatus = {
      status: allCylindersFiring ? "loud_and_high" : "needs_attention",
      timestamp: new Date().toISOString(),
      kpis: {
        newUsersWeek,
        avgPostViews,
        actionsLastHour,
      },
      allCylindersFiring,
      message: allCylindersFiring
        ? "Status: Loud and High ✓"
        : "Status: Needs Attention ⚠️",
    };

    return NextResponse.json(healthStatus, {
      status: allCylindersFiring ? 200 : 200, // Still 200, but status indicates health
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "needs_attention",
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Status: Error ⚠️",
      },
      { status: 500 }
    );
  }
}
