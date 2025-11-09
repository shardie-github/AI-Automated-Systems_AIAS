#!/usr/bin/env tsx
/**
 * ETL Script: Compute Daily Metrics
 * 
 * Aggregates data from orders, spend, and events tables to compute daily metrics
 * for finance and growth tracking. Stores results in metrics_daily table.
 * 
 * Usage:
 *   tsx scripts/etl/compute_metrics.ts [--dry-run] [--date YYYY-MM-DD] [--cron]
 * 
 * Environment Variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env') });

interface DailyMetrics {
  date: string;
  revenue: number;
  refunds: number;
  net_revenue: number;
  order_count: number;
  refund_count: number;
  refund_rate: number;
  spend_total: number;
  spend_meta: number;
  spend_tiktok: number;
  spend_other: number;
  impressions_total: number;
  clicks_total: number;
  conversions_total: number;
  cac: number | null;
  ltv: number | null;
  ltv_cac_ratio: number | null;
  new_customers: number;
  active_customers: number;
  churned_customers: number;
  churn_rate: number;
  cogs: number;
  cogs_percentage: number;
  gross_margin: number;
  gross_margin_percentage: number;
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const DRY_RUN = process.argv.includes('--dry-run');
const CRON_MODE = process.argv.includes('--cron');
const DATE_ARG = process.argv.find(arg => arg.startsWith('--date='));
const TARGET_DATE = DATE_ARG 
  ? DATE_ARG.split('=')[1] 
  : CRON_MODE 
    ? new Date().toISOString().split('T')[0] // Yesterday for cron
    : new Date().toISOString().split('T')[0];

// For cron mode, compute yesterday's metrics
const COMPUTE_DATE = CRON_MODE 
  ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  : TARGET_DATE;

async function computeMetrics(date: string): Promise<DailyMetrics> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log(`[Compute Metrics] Computing metrics for ${date}...`);

  // Fetch orders for the date
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, total_amount, refunded_amount, status, user_id, created_at')
    .eq('created_at::date', date);

  if (ordersError) throw ordersError;

  // Calculate revenue metrics
  const completedOrders = orders?.filter(o => o.status === 'completed') || [];
  const refundedOrders = orders?.filter(o => o.status === 'refunded') || [];
  
  const revenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  const refunds = refundedOrders.reduce((sum, o) => sum + parseFloat(o.refunded_amount || 0), 0);
  const net_revenue = revenue - refunds;
  const order_count = orders?.length || 0;
  const refund_count = refundedOrders.length;
  const refund_rate = order_count > 0 ? refund_count / order_count : 0;

  // Fetch spend for the date
  const { data: spendData, error: spendError } = await supabase
    .from('spend')
    .select('channel, amount, impressions, clicks, conversions')
    .eq('date', date);

  if (spendError) throw spendError;

  const spend_total = spendData?.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0) || 0;
  const spend_meta = spendData?.filter(s => s.channel === 'meta').reduce((sum, s) => sum + parseFloat(s.amount || 0), 0) || 0;
  const spend_tiktok = spendData?.filter(s => s.channel === 'tiktok').reduce((sum, s) => sum + parseFloat(s.amount || 0), 0) || 0;
  const spend_other = spend_total - spend_meta - spend_tiktok;
  
  const impressions_total = spendData?.reduce((sum, s) => sum + parseInt(s.impressions || 0), 0) || 0;
  const clicks_total = spendData?.reduce((sum, s) => sum + parseInt(s.clicks || 0), 0) || 0;
  const conversions_total = spendData?.reduce((sum, s) => sum + parseInt(s.conversions || 0), 0) || 0;

  // Calculate CAC (Customer Acquisition Cost)
  const new_customers = new Set(orders?.filter(o => o.user_id).map(o => o.user_id)).size;
  const cac = new_customers > 0 ? spend_total / new_customers : null;

  // Calculate LTV (simplified - average revenue per customer over 90 days)
  // In production, this would use a more sophisticated calculation
  const { data: recentOrders, error: ltvError } = await supabase
    .from('orders')
    .select('user_id, total_amount, refunded_amount, status')
    .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
    .eq('status', 'completed');

  if (ltvError) throw ltvError;

  const customerRevenue: Record<string, number> = {};
  recentOrders?.forEach(order => {
    if (order.user_id) {
      if (!customerRevenue[order.user_id]) {
        customerRevenue[order.user_id] = 0;
      }
      customerRevenue[order.user_id] += parseFloat(order.total_amount || 0) - parseFloat(order.refunded_amount || 0);
    }
  });

  const ltv = Object.keys(customerRevenue).length > 0
    ? Object.values(customerRevenue).reduce((sum, rev) => sum + rev, 0) / Object.keys(customerRevenue).length
    : null;

  const ltv_cac_ratio = (cac !== null && ltv !== null && cac > 0) ? ltv / cac : null;

  // Calculate active customers (customers with orders in last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: activeCustomersData, error: activeError } = await supabase
    .from('orders')
    .select('user_id')
    .gte('created_at', thirtyDaysAgo)
    .not('user_id', 'is', null);

  if (activeError) throw activeError;
  const active_customers = new Set(activeCustomersData?.map(o => o.user_id)).size;

  // Calculate churn (simplified - customers who had orders 31-60 days ago but not in last 30 days)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const { data: churnedCustomersData, error: churnError } = await supabase
    .from('orders')
    .select('user_id')
    .gte('created_at', sixtyDaysAgo)
    .lt('created_at', thirtyDaysAgo)
    .not('user_id', 'is', null);

  if (churnError) throw churnError;
  const churned_customers = new Set(churnedCustomersData?.map(o => o.user_id)).size;
  const churn_rate = active_customers > 0 ? churned_customers / active_customers : 0;

  // Calculate COGS (assume 40% of revenue as default, can be overridden)
  const COGS_PERCENTAGE = 0.40; // From assumptions.json
  const cogs = net_revenue * COGS_PERCENTAGE;
  const cogs_percentage = COGS_PERCENTAGE * 100;
  const gross_margin = net_revenue - cogs;
  const gross_margin_percentage = net_revenue > 0 ? (gross_margin / net_revenue) * 100 : 0;

  // Operating expenses and EBITDA would come from assumptions/financial model
  // For now, we'll leave these null and they can be computed separately
  const operating_expenses = null;
  const ebitda = null;
  const ebitda_margin = null;

  // Cash metrics would come from financial model
  const cash_balance = null;
  const cash_runway_days = null;

  // Count active experiments
  const { data: experiments, error: expError } = await supabase
    .from('experiments')
    .select('id, status')
    .eq('status', 'running');

  if (expError) throw expError;
  const active_experiments_count = experiments?.length || 0;

  return {
    date: COMPUTE_DATE,
    revenue,
    refunds,
    net_revenue,
    order_count,
    refund_count,
    refund_rate,
    spend_total,
    spend_meta,
    spend_tiktok,
    spend_other,
    impressions_total,
    clicks_total,
    conversions_total,
    cac,
    ltv,
    ltv_cac_ratio,
    new_customers,
    active_customers,
    churned_customers,
    churn_rate,
    cogs,
    cogs_percentage,
    gross_margin,
    gross_margin_percentage,
  } as DailyMetrics;
}

async function storeMetrics(metrics: DailyMetrics): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { error } = await supabase
    .from('metrics_daily')
    .upsert({
      ...metrics,
      computed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'date',
    });

  if (error) {
    console.error('[Compute Metrics] Error storing metrics:', error);
    throw error;
  }

  console.log(`[Compute Metrics] Successfully stored metrics for ${metrics.date}`);
}

async function main() {
  const startTime = Date.now();
  console.log(`[Compute Metrics] Starting at ${new Date().toISOString()}`);
  console.log(`[Compute Metrics] Target date: ${COMPUTE_DATE}`);
  console.log(`[Compute Metrics] Dry run: ${DRY_RUN}`);
  console.log(`[Compute Metrics] Cron mode: ${CRON_MODE}`);

  try {
    const metrics = await computeMetrics(COMPUTE_DATE);

    console.log(`[Compute Metrics] Computed metrics:`);
    console.log(`  Revenue: $${metrics.revenue.toFixed(2)}`);
    console.log(`  Net Revenue: $${metrics.net_revenue.toFixed(2)}`);
    console.log(`  Spend: $${metrics.spend_total.toFixed(2)}`);
    console.log(`  CAC: ${metrics.cac ? `$${metrics.cac.toFixed(2)}` : 'N/A'}`);
    console.log(`  LTV: ${metrics.ltv ? `$${metrics.ltv.toFixed(2)}` : 'N/A'}`);
    console.log(`  LTV:CAC: ${metrics.ltv_cac_ratio ? metrics.ltv_cac_ratio.toFixed(2) : 'N/A'}`);
    console.log(`  Refund Rate: ${(metrics.refund_rate * 100).toFixed(2)}%`);
    console.log(`  Gross Margin: ${metrics.gross_margin_percentage.toFixed(2)}%`);

    if (DRY_RUN) {
      console.log('[Compute Metrics] DRY RUN - Would store:');
      console.log(JSON.stringify(metrics, null, 2));
      return;
    }

    await storeMetrics(metrics);

    const duration = Date.now() - startTime;
    console.log(`[Compute Metrics] Completed successfully in ${duration}ms`);
  } catch (error) {
    console.error('[Compute Metrics] Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { computeMetrics, storeMetrics };
