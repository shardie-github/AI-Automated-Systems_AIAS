#!/usr/bin/env tsx
/**
 * Migration Runner CLI Script
 * 
 * Run migrations manually or in CI/CD:
 *   npm run migrate:run
 *   tsx scripts/run-migrations.ts
 */

import { runMigrationsInCI, validateSchemaAfterMigrations } from '@/lib/database/migrations';

async function main() {
  console.log('🚀 Database Migration Runner\n');
  
  try {
    // Run migrations
    const result = await runMigrationsInCI();
    
    if (!result.success) {
      console.error('\n❌ Migration failed');
      process.exit(1);
    }
    
    // Validate schema after migrations
    console.log('\n🔍 Validating database schema...');
    const isValid = await validateSchemaAfterMigrations();
    
    if (!isValid) {
      console.error('\n❌ Schema validation failed');
      process.exit(1);
    }
    
    console.log('\n✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
