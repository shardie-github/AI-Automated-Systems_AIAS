#!/usr/bin/env tsx
/**
 * ETL Script: Pull Meta (Facebook/Instagram) Ads Data
 * 
 * Fetches ad spend, impressions, clicks, and conversions from Meta Marketing API
 * and stores in Supabase spend table.
 * 
 * Usage:
 *   tsx scripts/etl/pull_ads_meta.ts [--dry-run] [--date YYYY-MM-DD]
 * 
 * Environment Variables:
 *   SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for Supabase
 *   META_ACCESS_TOKEN - Meta Marketing API access token
 *   META_AD_ACCOUNT_ID - Meta ad account ID
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env') });

interface MetaAdData {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  campaign_id: string;
  campaign_name: string;
}

interface MetaAPIResponse {
  data: Array<{
    date_start: string;
    spend: string;
    impressions: string;
    clicks: string;
    actions?: Array<{
      action_type: string;
      value: string;
    }>;
    campaign_id: string;
    campaign_name: string;
  }>;
  paging?: {
    next?: string;
  };
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const META_AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || '';

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

async function fetchMetaAdsData(date: string): Promise<MetaAdData[]> {
  if (!META_ACCESS_TOKEN || !META_AD_ACCOUNT_ID) {
    throw new Error('META_ACCESS_TOKEN and META_AD_ACCOUNT_ID must be set');
  }

  const apiVersion = 'v18.0';
  const fields = 'date_start,spend,impressions,clicks,actions,campaign_id,campaign_name';
  const timeRange = `{"since":"${date}","until":"${date}"}`;
  
  const url = `https://graph.facebook.com/${apiVersion}/${META_AD_ACCOUNT_ID}/insights?fields=${fields}&time_range=${encodeURIComponent(timeRange)}&access_token=${META_ACCESS_TOKEN}`;

  console.log(`[Meta ETL] Fetching data for ${date}...`);
  console.log(`[Meta ETL] URL: ${url.replace(META_ACCESS_TOKEN, '***REDACTED***')}`);

  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meta API error: ${response.status} ${errorText}`);
  }

  const data: MetaAPIResponse = await response.json();
  
  const results: MetaAdData[] = [];
  
  for (const item of data.data) {
    // Extract conversions from actions array
    const conversions = item.actions?.find(a => a.action_type === 'purchase')?.value || '0';
    
    results.push({
      date: item.date_start,
      spend: parseFloat(item.spend) || 0,
      impressions: parseInt(item.impressions) || 0,
      clicks: parseInt(item.clicks) || 0,
      conversions: parseInt(conversions) || 0,
      campaign_id: item.campaign_id,
      campaign_name: item.campaign_name,
    });
  }

  // Handle pagination if needed
  if (data.paging?.next) {
    console.log('[Meta ETL] Pagination detected, fetching next page...');
    // In production, implement pagination handling
  }

  return results;
}

async function storeInSupabase(data: MetaAdData[]): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  for (const item of data) {
    const { error } = await supabase
      .from('spend')
      .upsert({
        date: item.date,
        channel: 'meta',
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
      console.error(`[Meta ETL] Error storing ${item.campaign_id}:`, error);
      throw error;
    }
  }

  console.log(`[Meta ETL] Successfully stored ${data.length} records`);
}

async function main() {
  const startTime = Date.now();
  console.log(`[Meta ETL] Starting at ${new Date().toISOString()}`);
  console.log(`[Meta ETL] Target date: ${TARGET_DATE}`);
  console.log(`[Meta ETL] Dry run: ${DRY_RUN}`);

  try {
    // Fetch data from Meta API
    const metaData = await fetchMetaAdsData(TARGET_DATE);
    
    if (metaData.length === 0) {
      console.log('[Meta ETL] No data found for the specified date');
      return;
    }

    console.log(`[Meta ETL] Fetched ${metaData.length} campaigns`);
    console.log(`[Meta ETL] Total spend: $${metaData.reduce((sum, d) => sum + d.spend, 0).toFixed(2)}`);

    if (DRY_RUN) {
      console.log('[Meta ETL] DRY RUN - Would store:');
      console.log(JSON.stringify(metaData, null, 2));
      return;
    }

    // Store in Supabase
    await storeInSupabase(metaData);

    const duration = Date.now() - startTime;
    console.log(`[Meta ETL] Completed successfully in ${duration}ms`);
  } catch (error) {
    console.error('[Meta ETL] Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { fetchMetaAdsData, storeInSupabase };
