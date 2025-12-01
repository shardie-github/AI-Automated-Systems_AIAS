#!/usr/bin/env tsx
/**
 * Apply Supabase migrations directly using psql
 * This script reads migration files and applies them in order
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import { execSync } from 'child_process';

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');

interface MigrationFile {
  name: string;
  path: string;
  timestamp: string;
}

function getMigrationFiles(): MigrationFile[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .map(f => ({
      name: f,
      path: join(MIGRATIONS_DIR, f),
      timestamp: f.replace('.sql', '').replace(/[^0-9]/g, ''),
    }))
    .sort((a, b) => {
      // Sort by timestamp, handling different formats
      const aTime = a.timestamp.padStart(20, '0');
      const bTime = b.timestamp.padStart(20, '0');
      return aTime.localeCompare(bTime);
    });

  return files;
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

function extractMigrationVersion(filename: string): string {
  // Extract version from filename
  // e.g., "20250129000000_consolidated_rls_policies_and_functions.sql" -> "20250129000000_consolidated_rls_policies_and_functions"
  return filename.replace('.sql', '');
}

async function applyMigration(dbUrl: string, migrationPath: string, migrationName: string): Promise<boolean> {
  const pool = new Pool({ connectionString: dbUrl });
  
  try {
    console.log(`\n📝 Applying: ${migrationName}`);
    const migrationContent = readFileSync(migrationPath, 'utf-8');
    
    // Apply migration in a transaction
    await pool.query('BEGIN');
    await pool.query(migrationContent);
    
    // Record migration in tracking table
    const version = extractMigrationVersion(migrationName);
    try {
      await pool.query(`
        INSERT INTO supabase_migrations.schema_migrations (version, name)
        VALUES ($1, $2)
        ON CONFLICT (version) DO NOTHING;
      `, [version, migrationName]);
    } catch (error: any) {
      // If tracking table doesn't exist, that's okay - migration still applied
      if (!error.message.includes('does not exist')) {
        throw error;
      }
    }
    
    await pool.query('COMMIT');
    console.log(`✅ Applied: ${migrationName}`);
    return true;
  } catch (error: any) {
    await pool.query('ROLLBACK').catch(() => {});
    
    // Check if error is because migration was already applied
    if (error.message.includes('already exists') || 
        error.message.includes('duplicate key') ||
        error.message.includes('relation already exists')) {
      console.log(`⏭️  Skipped (already applied): ${migrationName}`);
      return true;
    }
    
    console.error(`❌ Failed: ${migrationName}`);
    console.error(`   Error: ${error.message}`);
    return false;
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log('\n🚀 Applying Supabase Migrations Directly\n');
  console.log('=' .repeat(60));

  if (!SUPABASE_DB_URL) {
    console.error('❌ SUPABASE_DB_URL environment variable is required');
    console.log('\nTo set it up:');
    console.log('  export SUPABASE_DB_URL="postgresql://postgres:[password]@[host]:5432/postgres"');
    process.exit(1);
  }

  // Get all migration files
  const migrationFiles = getMigrationFiles();
  console.log(`📋 Found ${migrationFiles.length} migration files\n`);

  // Get applied migrations
  let appliedMigrations: string[] = [];
  try {
    appliedMigrations = await getAppliedMigrations(SUPABASE_DB_URL);
    console.log(`✅ Found ${appliedMigrations.length} already applied migrations\n`);
  } catch (error: any) {
    console.log(`⚠️  Could not check applied migrations: ${error.message}`);
    console.log('   Will attempt to apply all migrations\n');
  }

  // Determine pending migrations
  const pendingMigrations = migrationFiles.filter(m => {
    const version = extractMigrationVersion(m.name);
    return !appliedMigrations.includes(version);
  });

  if (pendingMigrations.length === 0) {
    console.log('✅ All migrations are already applied!\n');
    return;
  }

  console.log(`📦 Found ${pendingMigrations.length} pending migrations:\n`);
  pendingMigrations.forEach(m => console.log(`   - ${m.name}`));
  console.log('');

  // Apply each pending migration
  let successCount = 0;
  let failCount = 0;

  for (const migration of pendingMigrations) {
    const success = await applyMigration(SUPABASE_DB_URL, migration.path, migration.name);
    if (success) {
      successCount++;
    } else {
      failCount++;
      console.error(`\n❌ Stopping due to migration failure: ${migration.name}`);
      process.exit(1);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log(`✅ Successfully applied ${successCount} migrations`);
  if (failCount > 0) {
    console.log(`❌ Failed to apply ${failCount} migrations`);
  }
  console.log('');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
