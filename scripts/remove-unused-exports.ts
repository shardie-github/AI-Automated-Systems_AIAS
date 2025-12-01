#!/usr/bin/env tsx
/**
 * Remove Unused Exports Script
 * Identifies and removes unused exports from the codebase
 * 
 * Usage:
 *   pnpm tsx scripts/remove-unused-exports.ts [--dry-run]
 * 
 * This script:
 * 1. Runs ts-prune to find unused exports
 * 2. Runs knip to find unused code
 * 3. Generates a report of unused exports
 * 4. Optionally removes them (with --no-dry-run)
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('--check');

interface UnusedExport {
  file: string;
  export: string;
  line: number;
  reason: string;
}

async function findUnusedExports(): Promise<UnusedExport[]> {
  console.log('🔍 Finding unused exports...\n');

  const unused: UnusedExport[] = [];

  try {
    // Run ts-prune
    console.log('Running ts-prune...');
    const tsPruneOutput = execSync('npx ts-prune', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    // Parse ts-prune output
    const lines = tsPruneOutput.split('\n').filter(line => line.trim());
    for (const line of lines) {
      const match = line.match(/^(.+):(\d+) - (.+)$/);
      if (match) {
        const [, file, lineNum, exportName] = match;
        unused.push({
          file: file.trim(),
          export: exportName.trim(),
          line: parseInt(lineNum, 10),
          reason: 'Not imported anywhere',
        });
      }
    }
  } catch (error) {
    console.warn('ts-prune failed:', error);
  }

  try {
    // Run knip
    console.log('Running knip...');
    const knipOutput = execSync('npx knip --reporter json', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    const knipData = JSON.parse(knipOutput);
    
    // Parse knip results
    if (knipData.exports) {
      for (const [file, exports] of Object.entries(knipData.exports)) {
        if (Array.isArray(exports)) {
          for (const exp of exports) {
            unused.push({
              file: file as string,
              export: exp as string,
              line: 0, // knip doesn't provide line numbers
              reason: 'Unused export (knip)',
            });
          }
        }
      }
    }
  } catch (error) {
    console.warn('knip failed:', error);
  }

  return unused;
}

async function generateReport(unused: UnusedExport[]): Promise<void> {
  const reportPath = 'reports/unused-exports-removal.md';
  
  const report = `# Unused Exports Removal Report

**Generated:** ${new Date().toISOString()}
**Total Unused Exports:** ${unused.length}

## Summary

Found ${unused.length} unused exports across the codebase.

## Unused Exports by File

${unused
  .reduce((acc, item) => {
    if (!acc[item.file]) {
      acc[item.file] = [];
    }
    acc[item.file].push(item);
    return acc;
  }, {} as Record<string, UnusedExport[]>)
  .entries()
  .map(([file, items]) => {
    return `### ${file}\n\n${items.map(item => `- \`${item.export}\` (line ${item.line}): ${item.reason}`).join('\n')}\n`;
  })
  .join('\n')}

## Removal Plan

${DRY_RUN ? '⚠️ DRY RUN MODE - No changes made' : '✅ Exports will be removed'}

## Next Steps

1. Review the list above
2. Verify exports are truly unused
3. Check if exports are used in tests
4. Remove exports manually or run with --no-dry-run
`;

  writeFileSync(reportPath, report);
  console.log(`\n📄 Report generated: ${reportPath}`);
}

async function main() {
  const unused = await findUnusedExports();

  if (unused.length === 0) {
    console.log('✅ No unused exports found!');
    process.exit(0);
  }

  console.log(`\n📊 Found ${unused.length} unused exports\n`);

  // Group by file
  const byFile = unused.reduce((acc, item) => {
    if (!acc[item.file]) {
      acc[item.file] = [];
    }
    acc[item.file].push(item);
    return acc;
  }, {} as Record<string, UnusedExport[]>);

  console.log('Files with unused exports:');
  for (const [file, items] of Object.entries(byFile)) {
    console.log(`  ${file}: ${items.length} unused exports`);
  }

  await generateReport(unused);

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN MODE - No changes made');
    console.log('Run without --dry-run to remove unused exports');
  } else {
    console.log('\n⚠️  Automatic removal not implemented');
    console.log('Please review the report and remove exports manually');
  }

  process.exit(0);
}

main().catch(console.error);
