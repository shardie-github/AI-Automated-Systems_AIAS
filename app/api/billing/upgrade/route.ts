import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";
import { z } from "zod";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const upgradeSchema = z.object({
  planTier: z.enum(["starter", "pro", "enterprise"]),
  billingPeriod: z.enum(["monthly", "annual"]).optional().default("monthly"),
});

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/upgrade
 * Upgrade user's subscription plan
 * 
 * NOTE: This is a scaffold - actual billing integration (Stripe/Paddle) should be implemented
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
    const validated = upgradeSchema.parse(body);

    logger.info("Upgrade request", {
      userId: user.id,
      planTier: validated.planTier,
      billingPeriod: validated.billingPeriod,
    });

    // TODO: Integrate with actual billing service (Stripe/Paddle)
    // For now, just update the user's plan in the database
    // In production, this would:
    // 1. Create/update subscription in billing provider
    // 2. Handle payment method collection
    // 3. Update database after successful payment

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
        { error: "Failed to upgrade plan" },
        { status: 500 }
      );
    }

    // Create subscription record (if table exists)
    try {
      await supabase.from("user_subscriptions").upsert({
        user_id: user.id,
        plan_id: validated.planTier, // This should be a plan ID, not tier
        status: "active",
        billing_period: validated.billingPeriod,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      // Table might not exist, that's OK for now
      logger.warn("Failed to create subscription record", {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Upgraded to ${validated.planTier} plan`,
      plan: validated.planTier,
      billingPeriod: validated.billingPeriod,
      note: "Billing integration not yet implemented. This is a placeholder.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    return handleApiError(error, "Failed to upgrade plan");
  }
}
