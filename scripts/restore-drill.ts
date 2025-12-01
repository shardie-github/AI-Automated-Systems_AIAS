#!/usr/bin/env tsx
/**
 * Restore Drill Script
 * Tests backup integrity and restore capability
 * 
 * Usage:
 *   pnpm tsx scripts/restore-drill.ts
 * 
 * This script:
 * 1. Verifies latest backup exists
 * 2. Tests restore to temporary database
 * 3. Verifies data integrity
 * 4. Cleans up test database
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const BACKUPS_DIR = 'backups';
const TEST_DB_NAME = 'restore_drill_test';

interface DrillResult {
  success: boolean;
  steps: Array<{
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    message: string;
    duration?: number;
  }>;
  errors: string[];
}

async function runRestoreDrill(): Promise<DrillResult> {
  const result: DrillResult = {
    success: true,
    steps: [],
    errors: [],
  };

  console.log('🔍 Starting restore drill...\n');

  // Step 1: Check backup directory exists
  const step1Start = Date.now();
  if (!existsSync(BACKUPS_DIR)) {
    result.steps.push({
      name: 'Check backup directory',
      status: 'failed',
      message: `Backup directory not found: ${BACKUPS_DIR}`,
    });
    result.success = false;
    result.errors.push('Backup directory missing');
    return result;
  }
  result.steps.push({
    name: 'Check backup directory',
    status: 'passed',
    message: `Backup directory exists: ${BACKUPS_DIR}`,
    duration: Date.now() - step1Start,
  });

  // Step 2: Find latest backup
  const step2Start = Date.now();
  try {
    const backups = execSync(`ls -t ${BACKUPS_DIR}/*.sql 2>/dev/null | head -1`, {
      encoding: 'utf-8',
    }).trim();

    if (!backups) {
      result.steps.push({
        name: 'Find latest backup',
        status: 'failed',
        message: 'No backup files found',
      });
      result.success = false;
      result.errors.push('No backup files found');
      return result;
    }

    const backupPath = backups.split('\n')[0];
    result.steps.push({
      name: 'Find latest backup',
      status: 'passed',
      message: `Found backup: ${backupPath}`,
      duration: Date.now() - step2Start,
    });

    // Step 3: Verify backup file integrity
    const step3Start = Date.now();
    try {
      const backupContent = readFileSync(backupPath, 'utf-8');
      const hasCreateTable = backupContent.includes('CREATE TABLE');
      const hasInsert = backupContent.includes('INSERT INTO');

      if (!hasCreateTable && !hasInsert) {
        result.steps.push({
          name: 'Verify backup integrity',
          status: 'failed',
          message: 'Backup file appears empty or invalid',
        });
        result.success = false;
        result.errors.push('Invalid backup file');
        return result;
      }

      result.steps.push({
        name: 'Verify backup integrity',
        status: 'passed',
        message: `Backup file valid (${(backupContent.length / 1024).toFixed(2)} KB)`,
        duration: Date.now() - step3Start,
      });

      // Step 4: Test restore (if DATABASE_URL is set)
      const step4Start = Date.now();
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        result.steps.push({
          name: 'Test restore',
          status: 'skipped',
          message: 'DATABASE_URL not set, skipping restore test',
        });
      } else {
        try {
          // Extract connection details for test database
          const testDbUrl = databaseUrl.replace(/\/[^\/]+$/, `/${TEST_DB_NAME}`);
          
          // Create test database
          execSync(`createdb ${TEST_DB_NAME} 2>/dev/null || true`, { stdio: 'ignore' });
          
          // Restore backup
          execSync(`psql ${testDbUrl} < ${backupPath}`, {
            stdio: 'pipe',
            timeout: 60000, // 60 second timeout
          });
          
          // Verify restore
          const tableCount = execSync(
            `psql ${testDbUrl} -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"`,
            { encoding: 'utf-8' }
          ).trim();
          
          // Cleanup
          execSync(`dropdb ${TEST_DB_NAME} 2>/dev/null || true`, { stdio: 'ignore' });
          
          result.steps.push({
            name: 'Test restore',
            status: 'passed',
            message: `Restore successful (${tableCount} tables)`,
            duration: Date.now() - step4Start,
          });
        } catch (error) {
          // Cleanup on error
          execSync(`dropdb ${TEST_DB_NAME} 2>/dev/null || true`, { stdio: 'ignore' });
          
          result.steps.push({
            name: 'Test restore',
            status: 'failed',
            message: error instanceof Error ? error.message : String(error),
          });
          result.success = false;
          result.errors.push('Restore test failed');
        }
      }

    } catch (error) {
      result.steps.push({
        name: 'Verify backup integrity',
        status: 'failed',
        message: error instanceof Error ? error.message : String(error),
      });
      result.success = false;
      result.errors.push('Backup verification failed');
    }
  } catch (error) {
    result.steps.push({
      name: 'Find latest backup',
      status: 'failed',
      message: error instanceof Error ? error.message : String(error),
    });
    result.success = false;
    result.errors.push('Backup search failed');
  }

  return result;
}

async function main() {
  const result = await runRestoreDrill();

  console.log('\n📊 Restore Drill Results:\n');
  
  for (const step of result.steps) {
    const icon = step.status === 'passed' ? '✅' : step.status === 'failed' ? '❌' : '⏭️';
    const duration = step.duration ? ` (${step.duration}ms)` : '';
    console.log(`${icon} ${step.name}: ${step.message}${duration}`);
  }

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    for (const error of result.errors) {
      console.log(`   - ${error}`);
    }
  }

  if (result.success) {
    console.log('\n✅ Restore drill passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Restore drill failed!');
    process.exit(1);
  }
}

main().catch(console.error);
