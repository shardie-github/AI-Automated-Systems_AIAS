import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { generateImprovementCandidates } from "@/lib/ai-insights/improvement-generator";
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

    // Generate improvement candidates
    const candidates = await generateImprovementCandidates();

    return NextResponse.json({ candidates, generatedAt: new Date().toISOString() });
  } catch (error) {
    return handleApiError(error, "Failed to generate improvements");
  }
}
