import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { SystemError, ValidationError, formatError } from "@/lib/errors";
import { logger } from "@/lib/logging/structured-logger";
import { telemetry } from "@/lib/monitoring/enhanced-telemetry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * ETL endpoint for pulling Shopify Orders data
 * Used by Zapier automation as fallback if GitHub Actions unavailable
 * 
 * Authentication: Bearer token via ZAPIER_SECRET env var
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Authenticate request
    const authHeader = req.headers.get("authorization");
    const zapierSecret = process.env.ZAPIER_SECRET;

    if (!zapierSecret) {
      const error = new SystemError("Zapier secret not configured");
      const formatted = formatError(error);
      return NextResponse.json(
        { error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new ValidationError("Missing or invalid authorization header");
      const formatted = formatError(error);
      return NextResponse.json(
        { error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    const token = authHeader.substring(7);
    if (token !== zapierSecret) {
      const error = new ValidationError("Invalid authorization token");
      const formatted = formatError(error);
      return NextResponse.json(
        { error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    // Check required environment variables
    const shopifyApiKey = process.env.SHOPIFY_API_KEY;
    const shopifyPassword = process.env.SHOPIFY_PASSWORD;
    const shopifyStore = process.env.SHOPIFY_STORE;
    const databaseUrl = env.database.url;

    if (!shopifyApiKey || !shopifyPassword || !shopifyStore || !databaseUrl) {
      const error = new SystemError(
        "Missing required environment variables: SHOPIFY_API_KEY, SHOPIFY_PASSWORD, SHOPIFY_STORE, DATABASE_URL"
      );
      const formatted = formatError(error);
      return NextResponse.json(
        { error: formatted.message },
        { status: formatted.statusCode }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

    // Pull last 30 days of orders
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const shopifyUrl = `https://${shopifyApiKey}:${shopifyPassword}@${shopifyStore}.myshopify.com/admin/api/2024-01/orders.json`;
    
    let pageInfo: string | null = null;
    let hasNextPage = true;
    let totalOrders = 0;
    let recordsInserted = 0;

    while (hasNextPage) {
      const params = new URLSearchParams({
        status: "any",
        created_at_min: startDate.toISOString(),
        created_at_max: endDate.toISOString(),
        limit: "250",
      });

      if (pageInfo) {
        params.append("page_info", pageInfo);
      }

      const response = await fetch(`${shopifyUrl}?${params}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json() as {
        orders: Array<{
          id: number;
          order_number: number;
          email: string;
          created_at: string;
          line_items: Array<{
            title: string;
            quantity: number;
            price: string;
          }>;
          subtotal_price: string;
          total_shipping_price_set: { shop_money: { amount: string } };
          total_tax: string;
          total_discounts: string;
          total_price: string;
          currency: string;
          source_name: string;
        }>;
      };

      // Store orders in database (assuming orders table exists)
      if (data.orders && data.orders.length > 0) {
        for (const order of data.orders) {
          const { error } = await supabase.from("orders").upsert({
            shopify_id: order.id.toString(),
            order_number: order.order_number,
            email: order.email,
            created_at: order.created_at,
            total_cents: Math.round(parseFloat(order.total_price) * 100),
            currency: order.currency,
            source: order.source_name,
            metadata: {
              subtotal: order.subtotal_price,
              shipping: order.total_shipping_price_set.shop_money.amount,
              tax: order.total_tax,
              discounts: order.total_discounts,
              line_items: order.line_items,
            },
          }, {
            onConflict: "shopify_id",
          });

          if (error) {
            logger.warn("Failed to insert Shopify order", { error: error.message, orderId: order.id });
          } else {
            recordsInserted++;
          }
        }
      }

      totalOrders += data.orders?.length || 0;

      // Check for next page
      const linkHeader = response.headers.get("link");
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const nextMatch = linkHeader.match(/<([^>]+)>; rel="next"/);
        if (nextMatch) {
          const nextUrl = new URL(nextMatch[1]);
          pageInfo = nextUrl.searchParams.get("page_info");
          hasNextPage = true;
        } else {
          hasNextPage = false;
        }
      } else {
        hasNextPage = false;
      }
    }

    const duration = Date.now() - startTime;

    // Track performance
    telemetry.trackPerformance({
      name: "etl_shopify_orders",
      value: duration,
      unit: "ms",
      tags: { status: "success", records: recordsInserted.toString() },
    });

    logger.info("Shopify Orders ETL completed", { recordsInserted, totalOrders, duration });

    return NextResponse.json({
      success: true,
      recordsInserted,
      totalOrders,
      dateRange: {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      },
      duration_ms: duration,
    });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const systemError = new SystemError(
      "Shopify Orders ETL error",
      error instanceof Error ? error : new Error(String(error))
    );

    telemetry.trackPerformance({
      name: "etl_shopify_orders",
      value: duration,
      unit: "ms",
      tags: { status: "error" },
    });

    logger.error("Shopify Orders ETL failed", { error: systemError.message, duration });

    const formatted = formatError(systemError);
    return NextResponse.json(
      { error: formatted.message },
      { status: formatted.statusCode }
    );
  }
}
