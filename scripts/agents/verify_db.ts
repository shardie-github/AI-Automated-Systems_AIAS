#!/usr/bin/env tsx
/**
 * Database Verification Script
 * Verifies presence of tables, columns, indexes, RLS, and policies
 * Exits non-zero on failure
 */

import { query, queryOne, getPool, closePool } from '../lib/db.js';
import { info, error } from '../lib/logger.js';

const REQUIRED_TABLES = ['events', 'spend', 'metrics_daily'];
const REQUIRED_COLUMNS: Record<string, string[]> = {
  events: ['id', 'name', 'properties', 'timestamp'],
  spend: ['id', 'platform', 'amount', 'date'],
  metrics_daily: ['id', 'date', 'spend', 'events_count'],
};
const REQUIRED_INDEXES = [
  { name: 'idx_events_name_time', table: 'events' },
  { name: 'idx_spend_platform_dt', table: 'spend' },
  { name: 'idx_metrics_day', table: 'metrics_daily' },
];
const REQUIRED_FUNCTIONS = [
  'upsert_events',
  'upsert_spend',
  'recompute_metrics_daily',
  'system_healthcheck',
];

async function verifyTable(tableName: string): Promise<void> {
  const exists = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    ) AS exists`,
    [tableName]
  );

  if (!exists?.exists) {
    throw new Error(`Missing table: ${tableName}`);
  }
  info(`✓ Table exists: ${tableName}`);
}

async function verifyColumn(
  tableName: string,
  columnName: string
): Promise<void> {
  const exists = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1 
      AND column_name = $2
    ) AS exists`,
    [tableName, columnName]
  );

  if (!exists?.exists) {
    throw new Error(`Missing column: ${tableName}.${columnName}`);
  }
}

async function verifyIndex(indexName: string, tableName: string): Promise<void> {
  const exists = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname = $1
    ) AS exists`,
    [indexName]
  );

  if (!exists?.exists) {
    throw new Error(`Missing index: ${indexName} on ${tableName}`);
  }
  info(`✓ Index exists: ${indexName}`);
}

async function verifyRLS(tableName: string): Promise<void> {
  const rls = await queryOne<{ relrowsecurity: boolean }>(
    `SELECT c.relrowsecurity
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' 
     AND c.relname = $1`,
    [tableName]
  );

  if (!rls?.relrowsecurity) {
    throw new Error(`RLS not enabled on ${tableName}`);
  }
  info(`✓ RLS enabled: ${tableName}`);
}

async function verifyPolicies(tableName: string): Promise<void> {
  const policies = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM pg_policies 
     WHERE schemaname = 'public' 
     AND tablename = $1`,
    [tableName]
  );

  const count = parseInt(policies[0]?.count || '0', 10);
  if (count < 1) {
    throw new Error(`No policies found on ${tableName} (need at least 1)`);
  }
  info(`✓ Policies exist: ${tableName} (${count} policies)`);
}

async function verifyFunction(functionName: string): Promise<void> {
  const exists = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
      AND p.proname = $1
    ) AS exists`,
    [functionName]
  );

  if (!exists?.exists) {
    throw new Error(`Missing function: ${functionName}`);
  }
  info(`✓ Function exists: ${functionName}`);
}

async function verifyDatabase(): Promise<void> {
  info('Starting database verification');

  // Verify tables
  for (const table of REQUIRED_TABLES) {
    await verifyTable(table);

    // Verify columns
    const columns = REQUIRED_COLUMNS[table] || [];
    for (const column of columns) {
      await verifyColumn(table, column);
    }

    // Verify RLS
    await verifyRLS(table);

    // Verify policies
    await verifyPolicies(table);
  }

  // Verify indexes
  for (const idx of REQUIRED_INDEXES) {
    await verifyIndex(idx.name, idx.table);
  }

  // Verify functions
  for (const func of REQUIRED_FUNCTIONS) {
    await verifyFunction(func);
  }

  info('✅ Database verification passed');
}

async function main() {
  try {
    await verifyDatabase();
    process.exit(0);
  } catch (err) {
    error('Database verification failed', { error: err });
    process.exit(1);
  } finally {
    await closePool();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
