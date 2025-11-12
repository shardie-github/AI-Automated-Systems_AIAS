#!/usr/bin/env node
/**
 * Database Verification Script
 * Verifies presence of tables, columns, indexes, RLS, and policies
 * Exits non-zero on failure
 */

import { withDb } from "../lib/db";
import { log, err } from "../lib/logger";

const REQUIRED_TABLES = ["events", "spend", "metrics_daily"];
const REQUIRED_COLUMNS: Record<string, string[]> = {
  events: ["id", "occurred_at", "user_id", "event_name", "props"],
  spend: ["id", "platform", "campaign_id", "adset_id", "date", "spend_cents", "clicks", "impressions", "conv"],
  metrics_daily: ["id", "day", "sessions", "add_to_carts", "orders", "revenue_cents", "refunds_cents", "aov_cents", "cac_cents", "conversion_rate", "gross_margin_cents", "traffic"],
};
const REQUIRED_INDEXES = [
  { name: "idx_events_name_time", table: "events" },
  { name: "idx_spend_platform_dt", table: "spend" },
  { name: "idx_metrics_day", table: "metrics_daily" },
];
const REQUIRED_FUNCTIONS = [
  "upsert_events",
  "upsert_spend",
  "recompute_metrics_daily",
  "system_healthcheck",
];

async function verifyTable(c: any, tableName: string): Promise<void> {
  const result = await c.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    ) AS exists`,
    [tableName]
  );

  if (!result.rows[0]?.exists) {
    throw new Error(`Missing table: ${tableName}`);
  }
  log(`✓ Table exists: ${tableName}`);
}

async function verifyColumn(c: any, tableName: string, columnName: string): Promise<void> {
  const result = await c.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1 
      AND column_name = $2
    ) AS exists`,
    [tableName, columnName]
  );

  if (!result.rows[0]?.exists) {
    throw new Error(`Missing column: ${tableName}.${columnName}`);
  }
}

async function verifyIndex(c: any, indexName: string, tableName: string): Promise<void> {
  const result = await c.query(
    `SELECT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname = $1
    ) AS exists`,
    [indexName]
  );

  if (!result.rows[0]?.exists) {
    throw new Error(`Missing index: ${indexName} on ${tableName}`);
  }
  log(`✓ Index exists: ${indexName}`);
}

async function verifyRLS(c: any, tableName: string): Promise<void> {
  const result = await c.query(
    `SELECT c.relrowsecurity
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' 
     AND c.relname = $1`,
    [tableName]
  );

  if (!result.rows[0]?.relrowsecurity) {
    throw new Error(`RLS not enabled on ${tableName}`);
  }
  log(`✓ RLS enabled: ${tableName}`);
}

async function verifyPolicies(c: any, tableName: string): Promise<void> {
  const result = await c.query(
    `SELECT COUNT(*)::text AS count
     FROM pg_policies 
     WHERE schemaname = 'public' 
     AND tablename = $1`,
    [tableName]
  );

  const count = parseInt(result.rows[0]?.count || "0", 10);
  if (count < 1) {
    throw new Error(`No policies found on ${tableName} (need at least 1)`);
  }
  log(`✓ Policies exist: ${tableName} (${count} policies)`);
}

async function verifyFunction(c: any, functionName: string): Promise<void> {
  const result = await c.query(
    `SELECT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
      AND p.proname = $1
    ) AS exists`,
    [functionName]
  );

  if (!result.rows[0]?.exists) {
    throw new Error(`Missing function: ${functionName}`);
  }
  log(`✓ Function exists: ${functionName}`);
}

async function verifyDatabase(): Promise<void> {
  log("Starting database verification");

  await withDb(async (c) => {
    // Verify tables
    for (const table of REQUIRED_TABLES) {
      await verifyTable(c, table);

      // Verify columns
      const columns = REQUIRED_COLUMNS[table] || [];
      for (const column of columns) {
        await verifyColumn(c, table, column);
      }

      // Verify RLS
      await verifyRLS(c, table);

      // Verify policies
      await verifyPolicies(c, table);
    }

    // Verify indexes
    for (const idx of REQUIRED_INDEXES) {
      await verifyIndex(c, idx.name, idx.table);
    }

    // Verify functions
    for (const func of REQUIRED_FUNCTIONS) {
      await verifyFunction(c, func);
    }
  });

  log("✅ Database verification passed");
}

(async () => {
  try {
    await verifyDatabase();
    process.exit(0);
  } catch (e: any) {
    err("Database verification failed", e);
    process.exit(1);
  }
})();
