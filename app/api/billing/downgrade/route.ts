import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";
import { z } from "zod";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const downgradeSchema = z.object({
  planTier: z.enum(["free", "starter"]),
  reason: z.string().optional(),
});

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/downgrade
 * Downgrade user's subscription plan
 * 
 * NOTE: This is a scaffold - actual billing integration should be implemented
 */
export async function POST(request: NextRequest) {
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

    // Validate request body
    const body = await request.json();
    const validated = downgradeSchema.parse(body);

    logger.info("Downgrade request", {
      userId: user.id,
      planTier: validated.planTier,
      reason: validated.reason,
    });

    // Get current plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    const currentPlan = profile?.subscription_tier?.toLowerCase() || "free";

    // Check if downgrade is valid
    if (validated.planTier === "free" && (currentPlan === "starter" || currentPlan === "pro")) {
      // Downgrading to free - check if user has workflows that exceed free limits
      const { count: workflowCount } = await supabase
        .from("workflows")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if ((workflowCount || 0) > 3) {
        return NextResponse.json(
          {
            error: "Cannot downgrade to free",
            reason: `You have ${workflowCount} workflows. Free plan allows only 3. Please delete some workflows or upgrade.`,
          },
          { status: 400 }
        );
      }
    }

    // TODO: Integrate with actual billing service
    // In production, this would:
    // 1. Cancel/update subscription in billing provider
    // 2. Schedule downgrade at period end
    // 3. Update database

    // Update user's plan in database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_tier: validated.planTier,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      logger.error("Failed to update user plan", updateError instanceof Error ? updateError : new Error(String(updateError)), {
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to downgrade plan" },
        { status: 500 }
      );
    }

    // Update subscription status
    try {
      await supabase
        .from("user_subscriptions")
        .update({
          status: validated.planTier === "free" ? "canceled" : "active",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    } catch (error) {
      // Table might not exist, that's OK
      logger.warn("Failed to update subscription record", {
        userId: user.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Downgraded to ${validated.planTier} plan`,
      plan: validated.planTier,
      note: "Billing integration not yet implemented. This is a placeholder.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    return handleApiError(error, "Failed to downgrade plan");
  }
}
