#!/usr/bin/env tsx
/**
 * Pull Ads Source B ETL Script
 * Generic ads platform ingestion with dry-run support and retries
 * Idempotent upserts
 */

import { query } from '../lib/db.js';
import { retry } from '../lib/retry.js';
import { info, error } from '../lib/logger.js';
import { closePool } from '../lib/db.js';

const DRY_RUN = process.argv.includes('--dry-run');
const PLATFORM = 'source_b';

async function pullAdsSourceB(startDate?: string, endDate?: string): Promise<number> {
  info('Starting Source B ads ETL pull', { dryRun: DRY_RUN, startDate, endDate });

  // In a real implementation, this would fetch from Source B API
  // For now, this is a stub that demonstrates the pattern
  const token = process.env.GENERIC_SOURCE_B_TOKEN;
  if (!token && !DRY_RUN) {
    throw new Error('GENERIC_SOURCE_B_TOKEN environment variable required');
  }

  const mockSpend = [
    {
      platform: PLATFORM,
      amount: 175.25,
      currency: 'CAD',
      date: new Date().toISOString().split('T')[0],
      metadata: { campaign_id: 'camp_789', ad_set_id: 'set_012' },
    },
    {
      platform: PLATFORM,
      amount: 225.00,
      currency: 'CAD',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      metadata: { campaign_id: 'camp_790', ad_set_id: 'set_013' },
    },
  ];

  if (DRY_RUN) {
    info(`[DRY RUN] Would insert ${mockSpend.length} spend records`);
    return mockSpend.length;
  }

  let inserted = 0;
  for (const spend of mockSpend) {
    try {
      await retry(async () => {
        await query(
          `SELECT public.upsert_spend($1::jsonb)`,
          [JSON.stringify(spend)]
        );
      });
      inserted++;
    } catch (err) {
      error('Failed to insert spend', { spend, error: err });
    }
  }

  info(`Inserted ${inserted} spend records for ${PLATFORM}`);
  return inserted;
}

async function main() {
  const startDate = process.env.BACKFILL_START;
  const endDate = process.env.BACKFILL_END;

  try {
    const count = await pullAdsSourceB(startDate, endDate);
    console.log(`✅ Source B ads ETL completed: ${count} records processed`);
    process.exit(0);
  } catch (err) {
    error('Source B ads ETL failed', { error: err });
    process.exit(1);
  } finally {
    await closePool();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
