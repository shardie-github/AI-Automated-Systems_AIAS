import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { analyzeErrors } from "@/lib/ai-insights/error-analyzer";
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
    const days = parseInt(searchParams.get("days") || "7", 10);

    // Analyze errors
    const errorAnalysis = await analyzeErrors(days);

    return NextResponse.json(errorAnalysis);
  } catch (error) {
    return handleApiError(error, "Failed to analyze errors");
  }
}
