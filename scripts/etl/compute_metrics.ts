#!/usr/bin/env tsx
/**
 * Compute Metrics ETL Script
 * Calls recompute_metrics_daily function for date range
 * Idempotent, safe to re-run
 */

import { query, queryOne } from '../lib/db.js';
import { info, error } from '../lib/logger.js';
import { closePool } from '../lib/db.js';

const DRY_RUN = process.argv.includes('--dry-run');

async function computeMetrics(startDate?: string, endDate?: string): Promise<number> {
  info('Starting metrics computation', { dryRun: DRY_RUN, startDate, endDate });

  // Default to last 7 days if not specified
  const end = endDate || new Date().toISOString().split('T')[0];
  const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (DRY_RUN) {
    info(`[DRY RUN] Would compute metrics for ${start} to ${end}`);
    return 0;
  }

  try {
    const result = await queryOne<{ recompute_metrics_daily: number }>(
      `SELECT public.recompute_metrics_daily($1::date, $2::date) AS recompute_metrics_daily`,
      [start, end]
    );

    const daysProcessed = result?.recompute_metrics_daily || 0;
    info(`Computed metrics for ${daysProcessed} days (${start} to ${end})`);
    return daysProcessed;
  } catch (err) {
    error('Failed to compute metrics', { error: err });
    throw err;
  }
}

async function main() {
  const startDate = process.env.BACKFILL_START;
  const endDate = process.env.BACKFILL_END;
  const runBackfill = process.env.RUN_BACKFILL === 'true';

  if (!runBackfill && !DRY_RUN) {
    // Default to yesterday for cron runs
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const count = await computeMetrics(yesterday, yesterday);
    console.log(`✅ Metrics computation completed: ${count} days processed`);
  } else {
    const count = await computeMetrics(startDate, endDate);
    console.log(`✅ Metrics computation completed: ${count} days processed`);
  }

  try {
    process.exit(0);
  } catch (err) {
    error('Metrics computation failed', { error: err });
    process.exit(1);
  } finally {
    await closePool();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
