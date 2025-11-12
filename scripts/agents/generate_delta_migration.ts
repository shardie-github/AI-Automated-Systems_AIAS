#!/usr/bin/env tsx
/**
 * Delta Migration Generator
 * Introspects database and writes only missing objects to a new migration file
 * Idempotent, safe to re-run
 */

import { query, queryOne, getPool, closePool } from '../lib/db.js';
import { info, error, warn } from '../lib/logger.js';
import * as fs from 'fs';
import * as path from 'path';

interface TableInfo {
  name: string;
  exists: boolean;
}

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface IndexInfo {
  indexname: string;
  tablename: string;
}

interface PolicyInfo {
  schemaname: string;
  tablename: string;
  policyname: string;
}

interface ExtensionInfo {
  extname: string;
}

async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    ) AS exists`,
    [tableName]
  );
  return result?.exists || false;
}

async function checkColumnExists(
  tableName: string,
  columnName: string
): Promise<boolean> {
  const result = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1 
      AND column_name = $2
    ) AS exists`,
    [tableName, columnName]
  );
  return result?.exists || false;
}

async function checkIndexExists(indexName: string): Promise<boolean> {
  const result = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname = $1
    ) AS exists`,
    [indexName]
  );
  return result?.exists || false;
}

async function checkPolicyExists(
  tableName: string,
  policyName: string
): Promise<boolean> {
  const result = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = $1 
      AND policyname = $2
    ) AS exists`,
    [tableName, policyName]
  );
  return result?.exists || false;
}

async function checkExtensionExists(extName: string): Promise<boolean> {
  const result = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM pg_extension 
      WHERE extname = $1
    ) AS exists`,
    [extName]
  );
  return result?.exists || false;
}

async function checkFunctionExists(functionName: string): Promise<boolean> {
  const result = await queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
      AND p.proname = $1
    ) AS exists`,
    [functionName]
  );
  return result?.exists || false;
}

async function generateDeltaMigration(): Promise<string | null> {
  info('Starting delta migration generation');

  const requiredTables = ['events', 'spend', 'metrics_daily'];
  const requiredIndexes = [
    { name: 'idx_events_name_time', table: 'events' },
    { name: 'idx_spend_platform_dt', table: 'spend' },
    { name: 'idx_metrics_day', table: 'metrics_daily' },
  ];
  const requiredExtensions = ['pgcrypto', 'pg_trgm'];
  const requiredFunctions = [
    'upsert_events',
    'upsert_spend',
    'recompute_metrics_daily',
    'system_healthcheck',
  ];

  const migrations: string[] = [];
  migrations.push('-- Delta Migration - Generated Objects Only');
  migrations.push(`-- Generated: ${new Date().toISOString()}`);
  migrations.push('');

  // Check extensions
  for (const ext of requiredExtensions) {
    const exists = await checkExtensionExists(ext);
    if (!exists) {
      migrations.push(`CREATE EXTENSION IF NOT EXISTS ${ext};`);
      info(`Missing extension: ${ext}`);
    }
  }

  // Check tables
  for (const table of requiredTables) {
    const exists = await checkTableExists(table);
    if (!exists) {
      warn(`Missing table: ${table} - will be created by base migration`);
      // Don't create tables here - they should be in the base migration
    }
  }

  // Check indexes
  for (const idx of requiredIndexes) {
    const exists = await checkIndexExists(idx.name);
    if (!exists) {
      let indexSql = '';
      if (idx.name === 'idx_events_name_time') {
        indexSql = 'CREATE INDEX IF NOT EXISTS idx_events_name_time ON public.events(name, timestamp DESC);';
      } else if (idx.name === 'idx_spend_platform_dt') {
        indexSql = 'CREATE INDEX IF NOT EXISTS idx_spend_platform_dt ON public.spend(platform, date DESC);';
      } else if (idx.name === 'idx_metrics_day') {
        indexSql = 'CREATE INDEX IF NOT EXISTS idx_metrics_day ON public.metrics_daily(date DESC);';
      }
      if (indexSql) {
        migrations.push(indexSql);
        info(`Missing index: ${idx.name}`);
      }
    }
  }

  // Check functions
  for (const func of requiredFunctions) {
    const exists = await checkFunctionExists(func);
    if (!exists) {
      warn(`Missing function: ${func} - will be created by base migration`);
      // Functions should be in base migration
    }
  }

  // Check RLS policies
  const requiredPolicies = [
    { table: 'events', policy: 'events_service_role_all' },
    { table: 'events', policy: 'events_authenticated_select' },
    { table: 'spend', policy: 'spend_service_role_all' },
    { table: 'spend', policy: 'spend_authenticated_select' },
    { table: 'metrics_daily', policy: 'metrics_daily_service_role_all' },
    { table: 'metrics_daily', policy: 'metrics_daily_authenticated_select' },
  ];

  for (const pol of requiredPolicies) {
    const exists = await checkPolicyExists(pol.table, pol.policy);
    if (!exists) {
      warn(`Missing policy: ${pol.table}.${pol.policy} - will be created by base migration`);
      // Policies should be in base migration
    }
  }

  if (migrations.length <= 3) {
    info('No missing objects found - database is up to date');
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const migrationContent = migrations.join('\n');
  const migrationFileName = `${timestamp}_delta.sql`;
  const migrationPath = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    migrationFileName
  );

  fs.mkdirSync(path.dirname(migrationPath), { recursive: true });
  fs.writeFileSync(migrationPath, migrationContent);

  info(`Delta migration written: ${migrationPath}`);
  return migrationPath;
}

async function main() {
  try {
    const migrationPath = await generateDeltaMigration();
    if (migrationPath) {
      console.log(`✅ Delta migration created: ${migrationPath}`);
      process.exit(0);
    } else {
      console.log('✅ Database is up to date - no delta migration needed');
      process.exit(0);
    }
  } catch (err) {
    error('Failed to generate delta migration', { error: err });
    process.exit(1);
  } finally {
    await closePool();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
