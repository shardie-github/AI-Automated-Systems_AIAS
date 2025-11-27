/**
 * Next.js Instrumentation Hook
 * 
 * This file runs migrations automatically on server startup.
 * It ensures the database schema is always up-to-date before serving requests.
 * 
 * This runs in all environments: development, preview, and production.
 */

import { runMigrationsOnStartup } from '@/lib/database/migrations';

/**
 * Next.js instrumentation hook
 * Runs automatically when the server starts
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run migrations in Node.js runtime (not Edge runtime)
    try {
      console.log('🔄 [Instrumentation] Checking for pending database migrations...');
      await runMigrationsOnStartup();
      console.log('✅ [Instrumentation] Database migrations check completed');
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
