#!/usr/bin/env tsx
/**
 * ETL Script: Pull Shopify Orders Data
 * 
 * Fetches orders from Shopify Admin API and stores in Supabase orders table.
 * 
 * Usage:
 *   tsx scripts/etl/pull_shopify_orders.ts [--dry-run] [--date YYYY-MM-DD] [--since-id ID]
 * 
 * Environment Variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for Supabase
 *   SHOPIFY_API_KEY - Shopify API key
 *   SHOPIFY_PASSWORD - Shopify API password
 *   SHOPIFY_STORE - Shopify store name (e.g., 'mystore' for mystore.myshopify.com)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env') });

interface ShopifyOrder {
  id: string;
  order_number: string;
  email?: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  refunds?: Array<{
    id: string;
    created_at: string;
    amount: string;
  }>;
  line_items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: string;
  }>;
}

interface ShopifyAPIResponse {
  orders: ShopifyOrder[];
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || '';
const SHOPIFY_PASSWORD = process.env.SHOPIFY_PASSWORD || '';
const SHOPIFY_STORE = process.env.SHOPIFY_STORE || '';

const DRY_RUN = process.argv.includes('--dry-run');
const DATE_ARG = process.argv.find(arg => arg.startsWith('--date='));
const SINCE_ID_ARG = process.argv.find(arg => arg.startsWith('--since-id='));
const TARGET_DATE = DATE_ARG ? DATE_ARG.split('=')[1] : new Date().toISOString().split('T')[0];
const SINCE_ID = SINCE_ID_ARG ? SINCE_ID_ARG.split('=')[1] : undefined;

// Exponential backoff helper
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // Rate limited - exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      if (!response.ok && response.status >= 500) {
        // Server error - retry
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Server error ${response.status}. Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Request failed. Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw new Error('Max retries exceeded');
}

async function fetchShopifyOrders(date: string, sinceId?: string): Promise<ShopifyOrder[]> {
  if (!SHOPIFY_API_KEY || !SHOPIFY_PASSWORD || !SHOPIFY_STORE) {
    throw new Error('SHOPIFY_API_KEY, SHOPIFY_PASSWORD, and SHOPIFY_STORE must be set');
  }

  const apiVersion = '2024-01';
  const baseUrl = `https://${SHOPIFY_API_KEY}:${SHOPIFY_PASSWORD}@${SHOPIFY_STORE}.myshopify.com/admin/api/${apiVersion}`;
  
  // Build query parameters
  const params = new URLSearchParams();
  params.append('status', 'any'); // Include all orders (paid, pending, refunded, etc.)
  params.append('limit', '250'); // Max per page
  
  if (sinceId) {
    params.append('since_id', sinceId);
  } else {
    // Filter by created_at date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    params.append('created_at_min', startDate.toISOString());
    params.append('created_at_max', endDate.toISOString());
  }
  
  // Request refunds and financial status
  params.append('fields', 'id,name,email,total_price,subtotal_price,total_tax,currency,financial_status,fulfillment_status,created_at,updated_at,cancelled_at,refunds,line_items');

  const url = `${baseUrl}/orders.json?${params.toString()}`;

  console.log(`[Shopify ETL] Fetching orders for ${date}...`);
  console.log(`[Shopify ETL] URL: ${url.replace(SHOPIFY_PASSWORD, '***REDACTED***')}`);

  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify API error: ${response.status} ${errorText}`);
  }

  const data: ShopifyAPIResponse = await response.json();
  return data.orders || [];
}

async function storeInSupabase(orders: ShopifyOrder[]): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  for (const order of orders) {
    // Calculate refunded amount
    const refundedAmount = order.refunds?.reduce((sum, refund) => {
      return sum + parseFloat(refund.amount);
    }, 0) || 0;

    // Determine status
    let status = 'pending';
    if (order.financial_status === 'paid' && order.fulfillment_status === 'fulfilled') {
      status = 'completed';
    } else if (order.financial_status === 'refunded' || refundedAmount > 0) {
      status = 'refunded';
    } else if (order.cancelled_at) {
      status = 'cancelled';
    }

    // Extract items
    const items = order.line_items.map(item => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      price: parseFloat(item.price),
    }));

    const { error } = await supabase
      .from('orders')
      .upsert({
        id: order.id,
        order_number: order.order_number || order.name,
        user_id: null, // Would need to map email to user_id if user system exists
        status: status,
        total_amount: parseFloat(order.total_price),
        currency: order.currency || 'USD',
        items: items,
        payment_method: null, // Not available in basic Shopify API
        payment_provider: 'shopify',
        refunded_amount: refundedAmount,
        refunded_at: order.refunds && order.refunds.length > 0 
          ? order.refunds[0].created_at 
          : null,
        metadata: {
          email: order.email,
          financial_status: order.financial_status,
          fulfillment_status: order.fulfillment_status,
          shopify_order_id: order.id,
        },
        created_at: order.created_at,
        updated_at: order.updated_at,
      }, {
        onConflict: 'id',
      });

    if (error) {
      console.error(`[Shopify ETL] Error storing order ${order.order_number}:`, error);
      throw error;
    }
  }

  console.log(`[Shopify ETL] Successfully stored ${orders.length} orders`);
}

async function main() {
  const startTime = Date.now();
  console.log(`[Shopify ETL] Starting at ${new Date().toISOString()}`);
  console.log(`[Shopify ETL] Target date: ${TARGET_DATE}`);
  console.log(`[Shopify ETL] Since ID: ${SINCE_ID || 'none'}`);
  console.log(`[Shopify ETL] Dry run: ${DRY_RUN}`);

  try {
    // Fetch orders from Shopify
    const orders = await fetchShopifyOrders(TARGET_DATE, SINCE_ID);
    
    if (orders.length === 0) {
      console.log('[Shopify ETL] No orders found for the specified date');
      return;
    }

    console.log(`[Shopify ETL] Fetched ${orders.length} orders`);
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
    console.log(`[Shopify ETL] Total revenue: $${totalRevenue.toFixed(2)}`);

    if (DRY_RUN) {
      console.log('[Shopify ETL] DRY RUN - Would store:');
      console.log(JSON.stringify(orders.map(o => ({
        order_number: o.order_number || o.name,
        total_price: o.total_price,
        status: o.financial_status,
        refunds: o.refunds?.length || 0,
      })), null, 2));
      return;
    }

    // Store in Supabase
    await storeInSupabase(orders);

    const duration = Date.now() - startTime;
    console.log(`[Shopify ETL] Completed successfully in ${duration}ms`);
  } catch (error) {
    console.error('[Shopify ETL] Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { fetchShopifyOrders, storeInSupabase };
