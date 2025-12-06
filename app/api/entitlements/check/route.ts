import { NextRequest, NextResponse } from "next/server";
import { checkFeatureAccess } from "@/lib/entitlements/check";
import { handleApiError } from "@/lib/api/route-handler";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export const dynamic = "force-dynamic";

/**
 * GET /api/entitlements/check
 * Check if user has access to a feature
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from auth
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : request.cookies.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get feature from query params
    const feature = request.nextUrl.searchParams.get("feature");
    if (!feature) {
      return NextResponse.json({ error: "Feature parameter required" }, { status: 400 });
    }

    // Check access
    const access = await checkFeatureAccess(user.id, feature as keyof typeof import("@/lib/entitlements/check").FEATURES);

    return NextResponse.json(access);
  } catch (error) {
    return handleApiError(error, "Failed to check feature access");
  }
}
