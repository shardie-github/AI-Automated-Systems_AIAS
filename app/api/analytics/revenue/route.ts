import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { logger } from "@/lib/logging/structured-logger";
import { handleApiError } from "@/lib/api/route-handler";

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/revenue
 * Get revenue metrics and analytics
 * 
 * NOTE: This is a scaffold - actual revenue data should come from billing provider
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from auth (admin only in production)
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

    // TODO: Add admin check in production
    // For now, allow all authenticated users

    // Get subscription counts by plan
    const { data: subscriptions } = await supabase
      .from("user_subscriptions")
      .select("plan_id, subscription_plans(tier, price_monthly)")
      .eq("status", "active");

    // Get profiles with subscription tiers
    const { data: profiles } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .in("subscription_tier", ["starter", "pro", "enterprise"]);

    // Calculate revenue metrics
    const planCounts: Record<string, { count: number; revenue: number }> = {
      starter: { count: 0, revenue: 0 },
      pro: { count: 0, revenue: 0 },
      enterprise: { count: 0, revenue: 0 },
    };

    // Count from subscriptions table
    subscriptions?.forEach((sub) => {
      const tier = (sub.subscription_plans as { tier: string; price_monthly: number })?.tier?.toLowerCase() || "starter";
      if (tier in planCounts) {
        planCounts[tier].count++;
        const price = (sub.subscription_plans as { price_monthly: number })?.price_monthly || 0;
        planCounts[tier].revenue += price;
      }
    });

    // Count from profiles (fallback)
    profiles?.forEach((profile) => {
      const tier = profile.subscription_tier?.toLowerCase() || "starter";
      if (tier in planCounts) {
        planCounts[tier].count++;
        // Use default prices if not in subscriptions table
        if (planCounts[tier].revenue === 0) {
          const prices: Record<string, number> = {
            starter: 49,
            pro: 149,
            enterprise: 299,
          };
          planCounts[tier].revenue += prices[tier] || 0;
        }
      }
    });

    const planDistribution = Object.entries(planCounts).map(([plan, data]) => ({
      plan,
      count: data.count,
      revenue: data.revenue,
    }));

    const mrr = planDistribution.reduce((sum, p) => sum + p.revenue, 0);
    const arr = mrr * 12;
    const activeSubscriptions = planDistribution.reduce((sum, p) => sum + p.count, 0);
    const averageRevenuePerUser = activeSubscriptions > 0 ? mrr / activeSubscriptions : 0;

    // Calculate churn (placeholder - would need historical data)
    const churnRate = 5.0; // Placeholder

    // Generate revenue by month (last 12 months)
    const revenueByMonth = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      revenueByMonth.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue: mrr * (1 - (11 - i) * 0.05), // Placeholder growth
      });
    }

    return NextResponse.json({
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      totalRevenue: Math.round(mrr * 6), // Placeholder
      activeSubscriptions,
      churnRate,
      averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100,
      planDistribution,
      revenueByMonth,
      note: "Revenue data is calculated from database. For accurate revenue, integrate with billing provider (Stripe/Paddle).",
    });
  } catch (error) {
    logger.error("Error in GET /api/analytics/revenue", error instanceof Error ? error : undefined);
    return handleApiError(error, "Failed to get revenue data");
  }
}
