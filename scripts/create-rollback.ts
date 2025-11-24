#!/usr/bin/env tsx
/**
 * Create Rollback Migration
 * Generates a rollback migration template
 */

import { writeFileSync, existsSync } from "fs";
import { join } from "path";

const originalMigration = process.argv[2];
const reason = process.argv[3] || "Migration issue detected";

if (!originalMigration) {
  console.error("Usage: pnpm run create:rollback <original-migration> [reason]");
  console.error("Example: pnpm run create:rollback 20250131000000_add_user_preferences.sql 'Causing performance issues'");
  process.exit(1);
}

// Check if original migration exists
const migrationsDir = join(process.cwd(), "supabase/migrations");
const originalPath = join(migrationsDir, originalMigration);

if (!existsSync(originalPath)) {
  console.error(`❌ Original migration not found: ${originalPath}`);
  process.exit(1);
}

// Generate rollback filename
const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "");
const originalName = originalMigration.replace(/^\d+_/, "").replace(/\.sql$/, "");
const rollbackFile = join(migrationsDir, `${timestamp}_rollback_${originalName}.sql`);

const rollbackTemplate = `-- Rollback Migration
-- Reverts: ${originalMigration}
-- Date: ${new Date().toISOString()}
-- Reason: ${reason}

-- ⚠️ WARNING: Review and modify this rollback before applying
-- Always test rollback in staging before applying to production

BEGIN;

-- Add rollback SQL here based on original migration
-- Common patterns:
--   DROP TABLE IF EXISTS new_table CASCADE;
--   ALTER TABLE existing_table DROP COLUMN IF EXISTS new_column;
--   DROP INDEX IF EXISTS idx_name;
--   DROP FUNCTION IF EXISTS function_name() CASCADE;
--   DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Read original migration to determine what to rollback:
-- ${originalPath}

COMMIT;
`;

writeFileSync(rollbackFile, rollbackTemplate);
console.log(`✅ Rollback migration created: ${rollbackFile}`);
console.log("⚠️  Review and modify before applying!");
console.log(`📝 Original migration: ${originalPath}`);
