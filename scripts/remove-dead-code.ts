#!/usr/bin/env tsx
/**
 * Dead Code Removal Script
 * Safely removes unused files identified by knip
 */

import { readFileSync, existsSync, unlinkSync, rmdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface RemovalPlan {
  safeToRemove: string[];
  needsReview: string[];
}

const DEAD_CODE_REPORT = './reports/knip.json';

function getDeadFiles(): string[] {
  if (!existsSync(DEAD_CODE_REPORT)) {
    console.error('Knip report not found. Run: npm run scan:usage');
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(DEAD_CODE_REPORT, 'utf-8'));
  return report.files || [];
}

function isSafeToRemove(file: string): boolean {
  // Don't remove config files, tests, or docs
  if (
    file.includes('.config.') ||
    file.includes('.test.') ||
    file.includes('.spec.') ||
    file.includes('README') ||
    file.includes('docs/')
  ) {
    return false;
  }

  // Legacy React Router files in src/ are safe if Next.js equivalents exist
  if (file.startsWith('src/')) {
    // Check if Next.js equivalent exists in app/
    const nextJsPath = file.replace('src/pages/', 'app/').replace('src/components/', 'components/');
    if (existsSync(nextJsPath)) {
      return true;
    }
  }

  // Unused Supabase functions - be careful
  if (file.includes('supabase/functions/')) {
    return false; // Needs manual review
  }

  return true;
}

function removeFile(file: string): void {
  try {
    if (existsSync(file)) {
      unlinkSync(file);
      console.log(`✓ Removed: ${file}`);
    } else {
      console.log(`⚠ Not found: ${file}`);
    }
  } catch (error) {
    console.error(`✗ Failed to remove ${file}:`, error);
  }
}

function main() {
  const deadFiles = getDeadFiles();
  const plan: RemovalPlan = {
    safeToRemove: [],
    needsReview: [],
  };

  for (const file of deadFiles) {
    if (isSafeToRemove(file)) {
      plan.safeToRemove.push(file);
    } else {
      plan.needsReview.push(file);
    }
  }

  console.log(`\n📊 Dead Code Analysis:`);
  console.log(`   Safe to remove: ${plan.safeToRemove.length} files`);
  console.log(`   Needs review: ${plan.needsReview.length} files\n`);

  if (plan.safeToRemove.length > 0) {
    console.log('🗑️  Removing safe files...\n');
    for (const file of plan.safeToRemove) {
      removeFile(file);
    }
  }

  if (plan.needsReview.length > 0) {
    console.log('\n⚠️  Files needing manual review:');
    for (const file of plan.needsReview.slice(0, 20)) {
      console.log(`   - ${file}`);
    }
    if (plan.needsReview.length > 20) {
      console.log(`   ... and ${plan.needsReview.length - 20} more`);
    }
  }

  console.log(`\n✅ Removed ${plan.safeToRemove.length} files`);
}

if (require.main === module) {
  main();
}
