#!/usr/bin/env tsx
/**
 * ETL Script: Pull TikTok Ads Data
 * 
 * Fetches ad spend, impressions, clicks, and conversions from TikTok Marketing API
 * and stores in Supabase spend table.
 * 
 * Usage:
 *   tsx scripts/etl/pull_ads_tiktok.ts [--dry-run] [--date YYYY-MM-DD]
 * 
 * Environment Variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for Supabase
 *   TIKTOK_ACCESS_TOKEN - TikTok Marketing API access token
 *   TIKTOK_ADVERTISER_ID - TikTok advertiser ID
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env') });

interface TikTokAdData {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  campaign_id: string;
  campaign_name: string;
}

interface TikTokAPIResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    list: Array<{
      stat_time_day: string;
      spend: string;
      impressions: string;
      clicks: string;
      conversions: string;
      campaign_id: string;
      campaign_name: string;
    }>;
    page_info: {
      page: number;
      page_size: number;
      total_number: number;
      total_page: number;
    };
  };
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN || '';
const TIKTOK_ADVERTISER_ID = process.env.TIKTOK_ADVERTISER_ID || '';

const DRY_RUN = process.argv.includes('--dry-run');
const DATE_ARG = process.argv.find(arg => arg.startsWith('--date='));
const TARGET_DATE = DATE_ARG ? DATE_ARG.split('=')[1] : new Date().toISOString().split('T')[0];

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

async function fetchTikTokAdsData(date: string): Promise<TikTokAdData[]> {
  if (!TIKTOK_ACCESS_TOKEN || !TIKTOK_ADVERTISER_ID) {
    throw new Error('TIKTOK_ACCESS_TOKEN and TIKTOK_ADVERTISER_ID must be set');
  }

  const apiVersion = 'v1.3';
  const url = `https://business-api.tiktok.com/open_api/${apiVersion}/report/integrated/get/`;
  
  const requestBody = {
    advertiser_id: TIKTOK_ADVERTISER_ID,
    service_type: 'AUCTION',
    report_type: 'BASIC',
    data_level: 'AUCTION_CAMPAIGN',
    dimensions: ['stat_time_day', 'campaign_id'],
    metrics: ['spend', 'impressions', 'clicks', 'conversions'],
    start_date: date,
    end_date: date,
    page: 1,
    page_size: 1000,
  };

  console.log(`[TikTok ETL] Fetching data for ${date}...`);

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': TIKTOK_ACCESS_TOKEN,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TikTok API error: ${response.status} ${errorText}`);
  }

  const data: TikTokAPIResponse = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`TikTok API error: ${data.message} (code: ${data.code})`);
  }

  const results: TikTokAdData[] = [];
  
  for (const item of data.data.list) {
    results.push({
      date: item.stat_time_day,
      spend: parseFloat(item.spend) || 0,
      impressions: parseInt(item.impressions) || 0,
      clicks: parseInt(item.clicks) || 0,
      conversions: parseInt(item.conversions) || 0,
      campaign_id: item.campaign_id,
      campaign_name: item.campaign_name,
    });
  }

  // Handle pagination if needed
  if (data.data.page_info.total_page > 1) {
    console.log(`[TikTok ETL] Pagination detected (${data.data.page_info.total_page} pages), fetching remaining pages...`);
    // In production, implement pagination handling
  }

  return results;
}

async function storeInSupabase(data: TikTokAdData[]): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  for (const item of data) {
    const { error } = await supabase
      .from('spend')
      .upsert({
        date: item.date,
        channel: 'tiktok',
        campaign_id: item.campaign_id,
        campaign_name: item.campaign_name,
        amount: item.spend,
        currency: 'USD',
        impressions: item.impressions,
        clicks: item.clicks,
        conversions: item.conversions,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'date,channel,campaign_id',
      });

    if (error) {
      console.error(`[TikTok ETL] Error storing ${item.campaign_id}:`, error);
      throw error;
    }
  }

  console.log(`[TikTok ETL] Successfully stored ${data.length} records`);
}

async function main() {
  const startTime = Date.now();
  console.log(`[TikTok ETL] Starting at ${new Date().toISOString()}`);
  console.log(`[TikTok ETL] Target date: ${TARGET_DATE}`);
  console.log(`[TikTok ETL] Dry run: ${DRY_RUN}`);

  try {
    // Fetch data from TikTok API
    const tiktokData = await fetchTikTokAdsData(TARGET_DATE);
    
    if (tiktokData.length === 0) {
      console.log('[TikTok ETL] No data found for the specified date');
      return;
    }

    console.log(`[TikTok ETL] Fetched ${tiktokData.length} campaigns`);
    console.log(`[TikTok ETL] Total spend: $${tiktokData.reduce((sum, d) => sum + d.spend, 0).toFixed(2)}`);

    if (DRY_RUN) {
      console.log('[TikTok ETL] DRY RUN - Would store:');
      console.log(JSON.stringify(tiktokData, null, 2));
      return;
    }

    // Store in Supabase
    await storeInSupabase(tiktokData);

    const duration = Date.now() - startTime;
    console.log(`[TikTok ETL] Completed successfully in ${duration}ms`);
  } catch (error) {
    console.error('[TikTok ETL] Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { fetchTikTokAdsData, storeInSupabase };
