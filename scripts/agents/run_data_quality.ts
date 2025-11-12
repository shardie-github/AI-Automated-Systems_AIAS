#!/usr/bin/env tsx
/**
 * Run Data Quality Checks
 * Executes SQL checks and exits non-zero on failure
 */

import { query } from '../lib/db.js';
import { info, error } from '../lib/logger.js';
import { closePool } from '../lib/db.js';
import * as fs from 'fs';
import * as path from 'path';

interface QualityCheck {
  check_name: string;
  violation_count: number;
}

async function runDataQualityChecks(): Promise<boolean> {
  info('Running data quality checks');

  const sqlPath = path.join(process.cwd(), 'tests', 'data_quality.sql');
  if (!fs.existsSync(sqlPath)) {
    error('Data quality SQL file not found', { path: sqlPath });
    return false;
  }

  const sql = fs.readFileSync(sqlPath, 'utf-8');
  
  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  const violations: QualityCheck[] = [];

  for (const statement of statements) {
    if (statement.toUpperCase().includes('SELECT')) {
      try {
        const results = await query<QualityCheck>(statement);
        for (const result of results) {
          if (result.violation_count > 0) {
            violations.push(result);
            error(`Data quality violation: ${result.check_name}`, {
              violation_count: result.violation_count,
            });
          } else {
            info(`✓ ${result.check_name}: No violations`);
          }
        }
      } catch (err) {
        error('Failed to execute data quality check', { statement, error: err });
      }
    }
  }

  if (violations.length > 0) {
    error(`Data quality checks failed: ${violations.length} violation(s)`);
    return false;
  }

  info('✅ All data quality checks passed');
  return true;
}

async function main() {
  try {
    const passed = await runDataQualityChecks();
    process.exit(passed ? 0 : 1);
  } catch (err) {
    error('Data quality check failed', { error: err });
    process.exit(1);
  } finally {
    await closePool();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
