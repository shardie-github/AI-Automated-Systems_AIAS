#!/usr/bin/env tsx
/**
 * Apply all pending Supabase migrations
 * Checks migration status and applies any that haven't been run
 */

import { execSync } from 'child_process';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || process.env.VITE_SUPABASE_PROJECT_ID;
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');

interface MigrationFile {
  name: string;
  path: string;
  timestamp: string;
}

async function getAppliedMigrations(dbUrl: string): Promise<string[]> {
  const pool = new Pool({ connectionString: dbUrl });
  try {
    // Check if supabase_migrations table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'supabase_migrations' 
        AND table_name = 'schema_migrations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️  Migration tracking table not found. Will apply all migrations.');
      return [];
    }

    const result = await pool.query(`
      SELECT version FROM supabase_migrations.schema_migrations 
      ORDER BY version;
    `);

    return result.rows.map((row: any) => row.version);
  } catch (error: any) {
    if (error.message.includes('does not exist') || error.message.includes('relation')) {
      console.log('⚠️  Migration tracking table not found. Will apply all migrations.');
      return [];
    }
    throw error;
  } finally {
    await pool.end();
  }
}

function getMigrationFiles(): MigrationFile[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .map(f => ({
      name: f,
      path: join(MIGRATIONS_DIR, f),
      timestamp: f.replace('.sql', '').replace(/[^0-9]/g, ''),
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return files;
}

function extractMigrationName(filename: string): string {
  // Extract migration identifier from filename
  // e.g., "20250129000000_consolidated_rls_policies_and_functions.sql" -> "20250129000000_consolidated_rls_policies_and_functions"
  return filename.replace('.sql', '');
}

async function applyMigrationViaSupabaseCLI(migrationPath: string): Promise<boolean> {
  try {
    if (!SUPABASE_PROJECT_REF) {
      throw new Error('SUPABASE_PROJECT_REF not set');
    }

    let command = `npx supabase db push --include-all`;
    
    if (SUPABASE_ACCESS_TOKEN) {
      command = `SUPABASE_ACCESS_TOKEN=${SUPABASE_ACCESS_TOKEN} ${command}`;
    }

    console.log(`📦 Applying migrations via Supabase CLI...`);
    execSync(command, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        SUPABASE_PROJECT_REF,
        SUPABASE_ACCESS_TOKEN: SUPABASE_ACCESS_TOKEN || '',
      },
      cwd: process.cwd(),
    });
    return true;
  } catch (error: any) {
    console.error(`❌ Supabase CLI failed: ${error.message}`);
    return false;
  }
}

async function applyMigrationViaPsql(migrationPath: string, dbUrl: string): Promise<boolean> {
  try {
    const migrationContent = readFileSync(migrationPath, 'utf-8');
    const pool = new Pool({ connectionString: dbUrl });
    
    console.log(`📝 Applying migration: ${migrationPath}`);
    await pool.query(migrationContent);
    await pool.end();
    
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to apply migration ${migrationPath}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting migration application process...\n');

  // Get all migration files
  const migrationFiles = getMigrationFiles();
  console.log(`📋 Found ${migrationFiles.length} migration files\n`);

  // Try to get applied migrations if DB URL is available
  let appliedMigrations: string[] = [];
  if (SUPABASE_DB_URL) {
    try {
      appliedMigrations = await getAppliedMigrations(SUPABASE_DB_URL);
      console.log(`✅ Found ${appliedMigrations.length} applied migrations\n`);
    } catch (error: any) {
      console.log(`⚠️  Could not check applied migrations: ${error.message}\n`);
      console.log('   Will attempt to apply all migrations via Supabase CLI\n');
    }
  }

  // Determine pending migrations
  const pendingMigrations = migrationFiles.filter(m => {
    const migrationName = extractMigrationName(m.name);
    return !appliedMigrations.includes(migrationName);
  });

  if (pendingMigrations.length === 0) {
    console.log('✅ All migrations are already applied!\n');
    return;
  }

  console.log(`📦 Found ${pendingMigrations.length} pending migrations:\n`);
  pendingMigrations.forEach(m => console.log(`   - ${m.name}`));
  console.log('');

  // Try to apply via Supabase CLI first
  if (SUPABASE_PROJECT_REF) {
    console.log('🔄 Attempting to apply migrations via Supabase CLI...\n');
    const success = await applyMigrationViaSupabaseCLI('');
    
    if (success) {
      console.log('\n✅ Migrations applied successfully via Supabase CLI!\n');
      return;
    }
  }

  // Fallback to psql if DB URL is available
  if (SUPABASE_DB_URL) {
    console.log('🔄 Falling back to direct psql application...\n');
    for (const migration of pendingMigrations) {
      const success = await applyMigrationViaPsql(migration.path, SUPABASE_DB_URL);
      if (!success) {
        console.error(`\n❌ Failed to apply migration: ${migration.name}`);
        process.exit(1);
      }
    }
    console.log('\n✅ All migrations applied successfully!\n');
  } else {
    console.error('\n❌ Cannot apply migrations:');
    console.error('   - SUPABASE_PROJECT_REF or SUPABASE_DB_URL must be set');
    console.error('   - SUPABASE_ACCESS_TOKEN is recommended for CLI method');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
