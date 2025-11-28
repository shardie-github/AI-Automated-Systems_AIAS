/**
 * Next.js Instrumentation Hook
 * 
 * This file runs migrations automatically on server startup.
 * It ensures the database schema is always up-to-date before serving requests.
 * 
 * NOTE: Migrations do NOT run automatically on PR commits or merges to main.
 * They only run on server startup in deployed environments.
 * 
 * SERVER-ONLY: This module should never be imported in client components.
 */

import 'server-only';

// Lazy load migrations to avoid webpack bundling
async function getRunMigrations() {
  if (typeof window !== 'undefined') {
    return null;
  }
  try {
    // Use eval to prevent webpack from analyzing this import
    const migrations = await eval('import')('@/lib/database/migrations');
    return migrations.runMigrationsOnStartup;
  } catch {
    return null;
  }
}

/**
 * Check if we're in a CI/CD environment that should skip migrations
 */
function shouldSkipMigrations(): boolean {
  // Skip migrations in CI/CD environments (GitHub Actions, etc.)
  if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
    // Skip on PR events
    if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
      console.log('⏭️  [Instrumentation] Skipping migrations - PR event detected');
      return true;
    }
    
    // Skip on push to main (merge events)
    if (process.env.GITHUB_EVENT_NAME === 'push' && process.env.GITHUB_REF === 'refs/heads/main') {
      console.log('⏭️  [Instrumentation] Skipping migrations - Main branch merge detected');
      return true;
    }
  }
  
  // Skip if explicitly disabled
  if (process.env.SKIP_MIGRATIONS === 'true') {
    console.log('⏭️  [Instrumentation] Skipping migrations - SKIP_MIGRATIONS=true');
    return true;
  }
  
  return false;
}

/**
 * Next.js instrumentation hook
 * Runs automatically when the server starts
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Skip migrations in CI/CD for PRs and main merges
    if (shouldSkipMigrations()) {
      return;
    }
    
    // Only run migrations in Node.js runtime (not Edge runtime)
    try {
      console.log('🔄 [Instrumentation] Checking for pending database migrations...');
      const runMigrations = await getRunMigrations();
      if (runMigrations) {
        await runMigrations();
        console.log('✅ [Instrumentation] Database migrations check completed');
      } else {
        console.log('⚠️  [Instrumentation] Migrations module not available');
      }
    } catch (error) {
      // Log error but don't crash the server
      // Migrations will be retried on next startup or via CI/CD
      console.error('❌ [Instrumentation] Migration check failed:', error);
      console.error('⚠️  [Instrumentation] Server will continue, but migrations should be applied manually');
      
      // In production, we might want to fail fast
      if (process.env.NODE_ENV === 'production' && process.env.FAIL_ON_MIGRATION_ERROR === 'true') {
        console.error('💥 [Instrumentation] Failing fast due to migration error in production');
        process.exit(1);
      }
    }
  }
}
