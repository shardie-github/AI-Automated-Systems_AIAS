#!/usr/bin/env tsx
/**
 * Preflight Checks
 * Validates environment variables, database connectivity, and base table presence
 * Writes report to /reports/exec/preflight_report.md
 */

import { queryOne, getPool, closePool } from '../lib/db.js';
import { info, error, warn } from '../lib/logger.js';
import * as fs from 'fs';
import * as path from 'path';

interface PreflightResult {
  check: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: PreflightResult[] = [];

function addResult(check: string, status: PreflightResult['status'], message: string) {
  results.push({ check, status, message });
  if (status === 'pass') {
    info(`✓ ${check}: ${message}`);
  } else if (status === 'warn') {
    warn(`⚠ ${check}: ${message}`);
  } else {
    error(`✗ ${check}: ${message}`);
  }
}

async function checkEnvVar(name: string, required: boolean = true): Promise<void> {
  const value = process.env[name];
  if (!value && required) {
    addResult(`Env: ${name}`, 'fail', 'Missing required environment variable');
  } else if (!value && !required) {
    addResult(`Env: ${name}`, 'warn', 'Optional environment variable not set');
  } else {
    const masked = name.includes('KEY') || name.includes('SECRET') || name.includes('TOKEN')
      ? `${value?.substring(0, 8)}...`
      : value;
    addResult(`Env: ${name}`, 'pass', `Set (${masked})`);
  }
}

async function checkDatabaseConnection(): Promise<void> {
  try {
    const result = await queryOne<{ version: string }>('SELECT version() AS version');
    if (result?.version) {
      addResult('Database Connection', 'pass', 'Connected successfully');
    } else {
      addResult('Database Connection', 'fail', 'Connection failed');
    }
  } catch (err) {
    addResult('Database Connection', 'fail', `Connection error: ${err}`);
  }
}

async function checkTableExists(tableName: string): Promise<void> {
  try {
    const result = await queryOne<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      ) AS exists`,
      [tableName]
    );
    if (result?.exists) {
      addResult(`Table: ${tableName}`, 'pass', 'Table exists');
    } else {
      addResult(`Table: ${tableName}`, 'fail', 'Table missing');
    }
  } catch (err) {
    addResult(`Table: ${tableName}`, 'fail', `Check error: ${err}`);
  }
}

async function checkTimezone(): Promise<void> {
  try {
    const result = await queryOne<{ timezone: string }>(
      "SHOW timezone"
    );
    const tz = result?.timezone || 'unknown';
    const expectedTz = process.env.TZ || 'America/Toronto';
    if (tz.includes('Toronto') || tz.includes('America')) {
      addResult('Timezone', 'pass', `Set to ${tz}`);
    } else {
      addResult('Timezone', 'warn', `Set to ${tz} (expected ${expectedTz})`);
    }
  } catch (err) {
    addResult('Timezone', 'warn', `Could not check timezone: ${err}`);
  }
}

async function runPreflight(): Promise<void> {
  info('Running preflight checks');

  // Check environment variables
  await checkEnvVar('SUPABASE_DB_URL', true);
  await checkEnvVar('SUPABASE_URL', false);
  await checkEnvVar('SUPABASE_SERVICE_ROLE_KEY', false);
  await checkEnvVar('TZ', false);
  await checkEnvVar('SLACK_WEBHOOK_URL', false);
  await checkEnvVar('GENERIC_SOURCE_A_TOKEN', false);
  await checkEnvVar('GENERIC_SOURCE_B_TOKEN', false);

  // Check database connection
  await checkDatabaseConnection();

  // Check required tables
  await checkTableExists('events');
  await checkTableExists('spend');
  await checkTableExists('metrics_daily');

  // Check timezone
  await checkTimezone();

  // Write report
  const reportPath = path.join(process.cwd(), 'reports', 'exec', 'preflight_report.md');
  const reportContent = generateReport();
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, reportContent);

  info(`Preflight report written: ${reportPath}`);

  // Exit with error if any failures
  const failures = results.filter(r => r.status === 'fail');
  if (failures.length > 0) {
    error(`Preflight failed: ${failures.length} check(s) failed`);
    process.exit(1);
  }
}

function generateReport(): string {
  const timestamp = new Date().toISOString();
  const passCount = results.filter(r => r.status === 'pass').length;
  const warnCount = results.filter(r => r.status === 'warn').length;
  const failCount = results.filter(r => r.status === 'fail').length;

  return `# Preflight Report

**Generated:** ${timestamp}  
**Status:** ${failCount > 0 ? '❌ FAILED' : warnCount > 0 ? '⚠️ WARNINGS' : '✅ PASSED'}

## Summary

- ✅ Passed: ${passCount}
- ⚠️ Warnings: ${warnCount}
- ❌ Failed: ${failCount}

## Checks

${results.map(r => {
  const icon = r.status === 'pass' ? '✅' : r.status === 'warn' ? '⚠️' : '❌';
  return `### ${icon} ${r.check}\n\n**Status:** ${r.status.toUpperCase()}\n**Message:** ${r.message}\n`;
}).join('\n')}

## Next Steps

${failCount > 0 
  ? '**Action Required:** Fix failed checks before proceeding with ETL or migrations.'
  : warnCount > 0
  ? '**Note:** Some optional checks are missing but not required for operation.'
  : '**Ready:** All checks passed. Proceed with ETL and migrations.'
}
`;
}

async function main() {
  try {
    await runPreflight();
    process.exit(0);
  } catch (err) {
    error('Preflight check failed', { error: err });
    process.exit(1);
  } finally {
    await closePool();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
