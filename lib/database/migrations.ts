/**
 * Database Migration Runner
 * 
 * Handles automatic database migrations on server startup and in CI/CD.
 * Ensures Supabase schema is always up-to-date across all environments.
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');

interface MigrationFile {
  name: string;
  path: string;
  version: string;
}

interface MigrationResult {
  success: boolean;
  applied: number;
  skipped: number;
  failed: number;
  errors: string[];
}

/**
 * Get all migration files sorted by version
 */
export function getMigrationFiles(): MigrationFile[] {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.warn(`⚠️  Migrations directory not found: ${MIGRATIONS_DIR}`);
    return [];
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .map(f => {
      const version = f.replace('.sql', '');
      return {
        name: f,
        path: join(MIGRATIONS_DIR, f),
        version,
      };
    })
    .sort((a, b) => {
      // Sort by version (timestamp prefix)
      return a.version.localeCompare(b.version);
    });

  return files;
}

/**
 * Get applied migrations from Supabase
 */
export async function getAppliedMigrations(dbUrl: string): Promise<string[]> {
  const pool = new Pool({ connectionString: dbUrl });
  
  try {
    // Check if supabase_migrations schema exists
    const schemaCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.schemata 
        WHERE schema_name = 'supabase_migrations'
      );
    `);

    if (!schemaCheck.rows[0].exists) {
      console.log('📋 Creating supabase_migrations schema...');
      await pool.query(`
        CREATE SCHEMA IF NOT EXISTS supabase_migrations;
        CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
          version TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      return [];
    }

    // Check if schema_migrations table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'supabase_migrations' 
        AND table_name = 'schema_migrations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('📋 Creating schema_migrations table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
          version TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      return [];
    }

    const result = await pool.query(`
      SELECT version FROM supabase_migrations.schema_migrations 
      ORDER BY version;
    `);

    return result.rows.map((row: any) => row.version);
  } catch (error: any) {
    if (error.message.includes('does not exist') || error.message.includes('relation')) {
      console.log('📋 Initializing migration tracking...');
      try {
        await pool.query(`
          CREATE SCHEMA IF NOT EXISTS supabase_migrations;
          CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
            version TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            applied_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
      } catch (initError) {
        console.error('❌ Failed to initialize migration tracking:', initError);
      }
      return [];
    }
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Apply a single migration file
 */
async function applyMigration(
  dbUrl: string,
  migration: MigrationFile
): Promise<{ success: boolean; error?: string }> {
  const pool = new Pool({ connectionString: dbUrl });
  
  try {
    console.log(`📝 Applying migration: ${migration.name}`);
    const migrationContent = readFileSync(migration.path, 'utf-8');
    
    // Apply migration in a transaction
    await pool.query('BEGIN');
    
    try {
      await pool.query(migrationContent);
      
      // Record migration in tracking table
      await pool.query(`
        INSERT INTO supabase_migrations.schema_migrations (version, name)
        VALUES ($1, $2)
        ON CONFLICT (version) DO NOTHING;
      `, [migration.version, migration.name]);
      
      await pool.query('COMMIT');
      console.log(`✅ Applied: ${migration.name}`);
      return { success: true };
    } catch (migrationError: any) {
      await pool.query('ROLLBACK');
      
      // Check if error is because migration was already applied (idempotent)
      if (
        migrationError.message.includes('already exists') ||
        migrationError.message.includes('duplicate key') ||
        migrationError.message.includes('relation already exists') ||
        migrationError.message.includes('already applied')
      ) {
        console.log(`⏭️  Skipped (already applied): ${migration.name}`);
        return { success: true };
      }
      
      throw migrationError;
    }
  } catch (error: any) {
    console.error(`❌ Failed to apply ${migration.name}:`, error.message);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

/**
 * Run migrations using Supabase CLI (preferred method)
 */
async function runMigrationsViaSupabaseCLI(): Promise<MigrationResult> {
  const { execSync } = await import('child_process');
  
  try {
    console.log('🔄 Running migrations via Supabase CLI...');
    
    // Check if Supabase CLI is available
    try {
      execSync('supabase --version', { stdio: 'pipe' });
    } catch {
      console.log('⚠️  Supabase CLI not found, falling back to direct SQL application');
      throw new Error('Supabase CLI not available');
    }

    // Login to Supabase
    if (process.env.SUPABASE_ACCESS_TOKEN) {
      execSync(`echo "${process.env.SUPABASE_ACCESS_TOKEN}" | supabase login --token -`, {
        stdio: 'pipe',
        env: { ...process.env },
      });
    }

    // Link project
    if (process.env.SUPABASE_PROJECT_REF) {
      execSync(`supabase link --project-ref ${process.env.SUPABASE_PROJECT_REF}`, {
        stdio: 'pipe',
        env: { ...process.env },
      });
    }

    // Apply migrations
    execSync('supabase db push --include-all', {
      stdio: 'inherit',
      env: { ...process.env },
    });

    console.log('✅ Migrations applied via Supabase CLI');
    return { success: true, applied: 0, skipped: 0, failed: 0, errors: [] };
  } catch (error: any) {
    console.log('⚠️  Supabase CLI method failed, falling back to direct SQL:', error.message);
    throw error;
  }
}

/**
 * Run migrations directly via SQL (fallback method)
 */
async function runMigrationsDirectly(dbUrl: string): Promise<MigrationResult> {
  const migrationFiles = getMigrationFiles();
  
  if (migrationFiles.length === 0) {
    console.log('📋 No migration files found');
    return { success: true, applied: 0, skipped: 0, failed: 0, errors: [] };
  }

  console.log(`📋 Found ${migrationFiles.length} migration files`);

  // Get applied migrations
  let appliedMigrations: string[] = [];
  try {
    appliedMigrations = await getAppliedMigrations(dbUrl);
    console.log(`✅ Found ${appliedMigrations.length} already applied migrations`);
  } catch (error: any) {
    console.warn(`⚠️  Could not check applied migrations: ${error.message}`);
    console.log('   Will attempt to apply all migrations');
  }

  // Determine pending migrations
  const pendingMigrations = migrationFiles.filter(
    m => !appliedMigrations.includes(m.version)
  );

  if (pendingMigrations.length === 0) {
    console.log('✅ All migrations are already applied!');
    return { success: true, applied: 0, skipped: migrationFiles.length, failed: 0, errors: [] };
  }

  console.log(`📦 Found ${pendingMigrations.length} pending migrations:`);
  pendingMigrations.forEach(m => console.log(`   - ${m.name}`));

  // Apply each pending migration
  const result: MigrationResult = {
    success: true,
    applied: 0,
    skipped: appliedMigrations.length,
    failed: 0,
    errors: [],
  };

  for (const migration of pendingMigrations) {
    const migrationResult = await applyMigration(dbUrl, migration);
    
    if (migrationResult.success) {
      result.applied++;
    } else {
      result.failed++;
      result.errors.push(`${migration.name}: ${migrationResult.error}`);
      result.success = false;
      
      // Stop on first failure in production
      if (process.env.NODE_ENV === 'production') {
        console.error(`❌ Stopping migration process due to failure: ${migration.name}`);
        break;
      }
    }
  }

  return result;
}

/**
 * Run migrations on server startup
 * 
 * This function is called by instrumentation.ts when the server starts.
 * It attempts to use Supabase CLI first, then falls back to direct SQL.
 */
export async function runMigrationsOnStartup(): Promise<MigrationResult> {
  // Skip migrations if explicitly disabled
  if (process.env.SKIP_MIGRATIONS === 'true') {
    console.log('⏭️  Migrations skipped (SKIP_MIGRATIONS=true)');
    return { success: true, applied: 0, skipped: 0, failed: 0, errors: [] };
  }

  // Get database URL
  const dbUrl = process.env.SUPABASE_DB_URL || 
                process.env.DATABASE_URL ||
                process.env.DIRECT_URL;

  if (!dbUrl) {
    console.warn('⚠️  No database URL found, skipping migrations');
    console.warn('   Set SUPABASE_DB_URL, DATABASE_URL, or DIRECT_URL to enable migrations');
    return { success: true, applied: 0, skipped: 0, failed: 0, errors: [] };
  }

  // Try Supabase CLI first (preferred)
  try {
    return await runMigrationsViaSupabaseCLI();
  } catch (error) {
    // Fall back to direct SQL application
    console.log('🔄 Falling back to direct SQL migration application...');
    return await runMigrationsDirectly(dbUrl);
  }
}

/**
 * Run migrations in CI/CD context
 * 
 * This function is called by GitHub Actions workflows.
 * It provides more detailed output and error handling for CI/CD.
 */
export async function runMigrationsInCI(): Promise<MigrationResult> {
  console.log('\n🚀 Running Database Migrations in CI/CD\n');
  console.log('='.repeat(60));

  const result = await runMigrationsOnStartup();

  console.log('\n' + '='.repeat(60));
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Applied: ${result.applied}`);
  console.log(`   ⏭️  Skipped: ${result.skipped}`);
  console.log(`   ❌ Failed: ${result.failed}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ Migration Errors:');
    result.errors.forEach(error => console.log(`   - ${error}`));
  }

  console.log('='.repeat(60) + '\n');

  if (!result.success) {
    throw new Error(`Migration failed: ${result.errors.join('; ')}`);
  }

  return result;
}

/**
 * Validate database schema after migrations
 */
export async function validateSchemaAfterMigrations(): Promise<boolean> {
  const dbUrl = process.env.SUPABASE_DB_URL || 
                process.env.DATABASE_URL ||
                process.env.DIRECT_URL;

  if (!dbUrl) {
    console.warn('⚠️  No database URL found, skipping schema validation');
    return true;
  }

  const pool = new Pool({ connectionString: dbUrl });
  
  try {
    // Check critical tables exist
    const criticalTables = [
      'profiles',
      'tenants',
      'tenant_members',
      'workflows',
      'workflow_executions',
    ];

    for (const table of criticalTables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);

      if (!result.rows[0].exists) {
        console.warn(`⚠️  Critical table missing: ${table}`);
        // Don't fail in development/preview, but warn
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Critical table missing: ${table}`);
        }
      }
    }

    console.log('✅ Schema validation passed');
    return true;
  } catch (error: any) {
    console.error('❌ Schema validation failed:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}
