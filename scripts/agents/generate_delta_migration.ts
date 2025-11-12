#!/usr/bin/env node
/**
 * Delta Migration Generator
 * Introspects database and writes only missing objects to a new migration file
 * Idempotent, safe to re-run
 */

import { withDb } from "../lib/db";
import { log, err } from "../lib/logger";
import fs from "fs";
import path from "path";

async function checkTableExists(c: any, tableName: string): Promise<boolean> {
  const result = await c.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    ) AS exists`,
    [tableName]
  );
  return result.rows[0]?.exists || false;
}

async function checkIndexExists(c: any, indexName: string): Promise<boolean> {
  const result = await c.query(
    `SELECT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname = $1
    ) AS exists`,
    [indexName]
  );
  return result.rows[0]?.exists || false;
}

async function checkPolicyExists(c: any, tableName: string, policyName: string): Promise<boolean> {
  const result = await c.query(
    `SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = $1 
      AND policyname = $2
    ) AS exists`,
    [tableName, policyName]
  );
  return result.rows[0]?.exists || false;
}

async function checkExtensionExists(c: any, extName: string): Promise<boolean> {
  const result = await c.query(
    `SELECT EXISTS (
      SELECT 1 FROM pg_extension 
      WHERE extname = $1
    ) AS exists`,
    [extName]
  );
  return result.rows[0]?.exists || false;
}

async function checkFunctionExists(c: any, functionName: string): Promise<boolean> {
  const result = await c.query(
    `SELECT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
      AND p.proname = $1
    ) AS exists`,
    [functionName]
  );
  return result.rows[0]?.exists || false;
}

async function generateDeltaMigration(): Promise<string | null> {
  log("Starting delta migration generation");

  const requiredTables = ["events", "spend", "metrics_daily"];
  const requiredIndexes = [
    { name: "idx_events_name_time", table: "events" },
    { name: "idx_spend_platform_dt", table: "spend" },
    { name: "idx_metrics_day", table: "metrics_daily" },
  ];
  const requiredExtensions = ["pgcrypto", "pg_trgm"];
  const requiredFunctions = [
    "upsert_events",
    "upsert_spend",
    "recompute_metrics_daily",
    "system_healthcheck",
  ];
  const requiredPolicies = [
    { table: "events", policy: "events_select_all_srv" },
    { table: "spend", policy: "spend_select_all_srv" },
    { table: "metrics_daily", policy: "metrics_select_all_srv" },
  ];

  const migrations: string[] = [];
  migrations.push("-- Delta Migration - Generated Objects Only");
  migrations.push(`-- Generated: ${new Date().toISOString()}`);
  migrations.push("");

  return await withDb(async (c) => {
    // Check extensions
    for (const ext of requiredExtensions) {
      const exists = await checkExtensionExists(c, ext);
      if (!exists) {
        migrations.push(`CREATE EXTENSION IF NOT EXISTS ${ext};`);
        log(`Missing extension: ${ext}`);
      }
    }

    // Check tables (warn but don't create - should be in base migration)
    for (const table of requiredTables) {
      const exists = await checkTableExists(c, table);
      if (!exists) {
        log(`Missing table: ${table} - will be created by base migration`);
      }
    }

    // Check indexes
    for (const idx of requiredIndexes) {
      const exists = await checkIndexExists(c, idx.name);
      if (!exists) {
        let indexSql = "";
        if (idx.name === "idx_events_name_time") {
          indexSql = "CREATE INDEX IF NOT EXISTS idx_events_name_time ON public.events(event_name, occurred_at);";
        } else if (idx.name === "idx_spend_platform_dt") {
          indexSql = "CREATE INDEX IF NOT EXISTS idx_spend_platform_dt ON public.spend(platform, date);";
        } else if (idx.name === "idx_metrics_day") {
          indexSql = "CREATE INDEX IF NOT EXISTS idx_metrics_day ON public.metrics_daily(day);";
        }
        if (indexSql) {
          migrations.push(indexSql);
          log(`Missing index: ${idx.name}`);
        }
      }
    }

    // Check functions (warn but don't create - should be in base migration)
    for (const func of requiredFunctions) {
      const exists = await checkFunctionExists(c, func);
      if (!exists) {
        log(`Missing function: ${func} - will be created by base migration`);
      }
    }

    // Check RLS policies
    for (const pol of requiredPolicies) {
      const exists = await checkPolicyExists(c, pol.table, pol.policy);
      if (!exists) {
        migrations.push(`CREATE POLICY IF NOT EXISTS ${pol.policy} ON public.${pol.table} FOR SELECT USING (true);`);
        log(`Missing policy: ${pol.table}.${pol.policy}`);
      }
    }

    if (migrations.length <= 3) {
      log("No missing objects found - database is up to date");
      return null;
    }

    const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
    const migrationContent = migrations.join("\n");
    const migrationFileName = `${timestamp}_delta.sql`;
    const migrationPath = path.join(process.cwd(), "supabase", "migrations", migrationFileName);

    fs.mkdirSync(path.dirname(migrationPath), { recursive: true });
    fs.writeFileSync(migrationPath, migrationContent);

    log(`Delta migration written: ${migrationPath}`);
    return migrationPath;
  });
}

(async () => {
  try {
    const migrationPath = await generateDeltaMigration();
    if (migrationPath) {
      console.log(`✅ Delta migration created: ${migrationPath}`);
      process.exit(0);
    } else {
      console.log("✅ Database is up to date - no delta migration needed");
      process.exit(0);
    }
  } catch (e: any) {
    err("Failed to generate delta migration", e);
    process.exit(1);
  }
})();
