/**
 * Migration Health Check Endpoint
 * 
 * GET /api/healthz/migrations
 * 
 * Checks if database migrations are up-to-date and schema is valid.
 * Used by monitoring systems to verify database state.
 */

import { NextResponse } from 'next/server';
import { getMigrationFiles, getAppliedMigrations, validateSchemaAfterMigrations } from '@/lib/database/migrations';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const dbUrl = process.env.SUPABASE_DB_URL || 
                  process.env.DATABASE_URL ||
                  process.env.DIRECT_URL;

    if (!dbUrl) {
      return NextResponse.json(
        {
          status: 'unknown',
          message: 'Database URL not configured',
          migrations: {
            total: 0,
            applied: 0,
            pending: 0,
          },
        },
        { status: 503 }
      );
    }

    // Get migration files
    const migrationFiles = getMigrationFiles();
    
    // Get applied migrations
    let appliedMigrations: string[] = [];
    try {
      appliedMigrations = await getAppliedMigrations(dbUrl);
    } catch (error: any) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Failed to check migrations: ${error.message}`,
          migrations: {
            total: migrationFiles.length,
            applied: 0,
            pending: migrationFiles.length,
          },
        },
        { status: 500 }
      );
    }

    // Calculate pending migrations
    const pendingMigrations = migrationFiles.filter(
      m => !appliedMigrations.includes(m.version)
    );

    // Validate schema
    const schemaValid = await validateSchemaAfterMigrations();

    const status = pendingMigrations.length === 0 && schemaValid ? 'healthy' : 'degraded';
    const httpStatus = pendingMigrations.length === 0 ? 200 : 503;

    return NextResponse.json({
      status,
      message: pendingMigrations.length === 0 
        ? 'All migrations applied' 
        : `${pendingMigrations.length} pending migrations`,
      migrations: {
        total: migrationFiles.length,
        applied: appliedMigrations.length,
        pending: pendingMigrations.length,
        pendingFiles: pendingMigrations.map(m => m.name),
      },
      schema: {
        valid: schemaValid,
      },
      timestamp: new Date().toISOString(),
    }, { status: httpStatus });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
