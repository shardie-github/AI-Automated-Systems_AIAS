import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { analyzeUsagePatterns, detectIncompleteWorkflows, detectFrictionPoints } from "@/lib/ai-insights/usage-patterns";
import { handleApiError } from "@/lib/api/route-handler";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export async function GET(request: NextRequest) {
  try {
    // Check authentication (admin only)
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30", 10);
    const includeIncomplete = searchParams.get("incomplete") === "true";
    const includeFriction = searchParams.get("friction") === "true";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Analyze usage patterns
    const allPatterns = await analyzeUsagePatterns(days);
    const paginatedPatterns = allPatterns.slice(offset, offset + limit);
    const hasMore = offset + limit < allPatterns.length;

    const response: {
      usagePatterns: typeof paginatedPatterns;
      incompleteWorkflows?: Array<unknown>;
      frictionPoints?: Array<unknown>;
      pagination: {
        limit: number;
        offset: number;
        total: number;
        hasMore: boolean;
      };
    } = {
      usagePatterns: paginatedPatterns,
      pagination: {
        limit,
        offset,
        total: allPatterns.length,
        hasMore,
      },
    };

    if (includeIncomplete) {
      response.incompleteWorkflows = await detectIncompleteWorkflows();
    }

    if (includeFriction) {
      response.frictionPoints = await detectFrictionPoints();
    }

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error, "Failed to get usage patterns");
  }
}
