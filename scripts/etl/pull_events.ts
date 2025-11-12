#!/usr/bin/env tsx
/**
 * Pull Events ETL Script
 * Generic event ingestion with dry-run support and retries
 * Idempotent upserts
 */

import { query } from '../lib/db.js';
import { retry } from '../lib/retry.js';
import { info, error } from '../lib/logger.js';
import { closePool } from '../lib/db.js';

const DRY_RUN = process.argv.includes('--dry-run');

async function pullEvents(startDate?: string, endDate?: string): Promise<number> {
  info('Starting events ETL pull', { dryRun: DRY_RUN, startDate, endDate });

  // In a real implementation, this would fetch from an external API
  // For now, this is a stub that demonstrates the pattern
  const mockEvents = [
    {
      name: 'page_view',
      properties: { path: '/dashboard', user_id: '123' },
      timestamp: new Date().toISOString(),
    },
    {
      name: 'button_click',
      properties: { button: 'signup', user_id: '123' },
      timestamp: new Date().toISOString(),
    },
  ];

  if (DRY_RUN) {
    info(`[DRY RUN] Would insert ${mockEvents.length} events`);
    return mockEvents.length;
  }

  let inserted = 0;
  for (const event of mockEvents) {
    try {
      await retry(async () => {
        await query(
          `SELECT public.upsert_events($1::jsonb)`,
          [JSON.stringify(event)]
        );
      });
      inserted++;
    } catch (err) {
      error('Failed to insert event', { event, error: err });
    }
  }

  info(`Inserted ${inserted} events`);
  return inserted;
}

async function main() {
  const startDate = process.env.BACKFILL_START;
  const endDate = process.env.BACKFILL_END;

  try {
    const count = await pullEvents(startDate, endDate);
    console.log(`✅ Events ETL completed: ${count} events processed`);
    process.exit(0);
  } catch (err) {
    error('Events ETL failed', { error: err });
    process.exit(1);
  } finally {
    await closePool();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
