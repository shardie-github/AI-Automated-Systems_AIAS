#!/usr/bin/env tsx
/**
 * System Doctor
 * Runs diagnostics and opens backlog tickets on failure
 * Self-healing: attempts fixes before opening tickets
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { info, error } from '../lib/logger.js';
import { notify } from './notify.js';

const execAsync = promisify(exec);

interface DiagnosticResult {
  check: string;
  status: 'pass' | 'fail';
  message: string;
  fixAttempted?: boolean;
  fixSuccess?: boolean;
}

const diagnostics: DiagnosticResult[] = [];

function addDiagnostic(
  check: string,
  status: DiagnosticResult['status'],
  message: string,
  fixAttempted?: boolean,
  fixSuccess?: boolean
) {
  diagnostics.push({ check, status, message, fixAttempted, fixSuccess });
  if (status === 'pass') {
    info(`✓ ${check}: ${message}`);
  } else {
    error(`✗ ${check}: ${message}`);
  }
}

async function runCommand(command: string): Promise<{ stdout: string; stderr: string }> {
  try {
    return await execAsync(command);
  } catch (err: any) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || err.message || '',
    };
  }
}

async function checkDeltaMigration(): Promise<boolean> {
  info('Checking delta migration generation');
  try {
    const { stdout, stderr } = await runCommand('tsx scripts/agents/generate_delta_migration.ts');
    if (stderr && !stderr.includes('info')) {
      addDiagnostic('Delta Migration', 'fail', `Generation error: ${stderr}`);
      return false;
    }
    addDiagnostic('Delta Migration', 'pass', 'Generation successful');
    return true;
  } catch (err) {
    addDiagnostic('Delta Migration', 'fail', `Check failed: ${err}`);
    return false;
  }
}

async function checkDatabaseVerification(): Promise<boolean> {
  info('Checking database verification');
  try {
    const { stdout, stderr } = await runCommand('tsx scripts/agents/verify_db.ts');
    if (stderr || stdout.includes('error') || stdout.includes('Missing')) {
      addDiagnostic('Database Verification', 'fail', `Verification failed: ${stdout || stderr}`);
      return false;
    }
    addDiagnostic('Database Verification', 'pass', 'All checks passed');
    return true;
  } catch (err) {
    addDiagnostic('Database Verification', 'fail', `Check failed: ${err}`);
    return false;
  }
}

async function attemptFix(): Promise<boolean> {
  info('Attempting automatic fix');
  try {
    // Try to apply migrations
    const { stdout, stderr } = await runCommand('supabase db push --include-all');
    if (stderr && !stderr.includes('info')) {
      // Fallback to psql if Supabase CLI fails
      const migrationFiles = fs
        .readdirSync(path.join(process.cwd(), 'supabase', 'migrations'))
        .filter((f) => f.endsWith('.sql'))
        .sort()
        .slice(-1); // Get latest migration

      if (migrationFiles.length > 0) {
        const migrationPath = path.join(
          process.cwd(),
          'supabase',
          'migrations',
          migrationFiles[0]
        );
        const dbUrl = process.env.SUPABASE_DB_URL;
        if (dbUrl) {
          await runCommand(`psql "${dbUrl}" -f "${migrationPath}"`);
        }
      }
    }
    addDiagnostic('Auto-Fix', 'pass', 'Fix attempted');
    return true;
  } catch (err) {
    addDiagnostic('Auto-Fix', 'fail', `Fix failed: ${err}`);
    return false;
  }
}

async function createBacklogTicket(failures: DiagnosticResult[]): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const ticketPath = path.join(
    process.cwd(),
    'backlog',
    `READY_system_fix_${timestamp}.md`
  );

  const ticketContent = `# System Fix Ticket

**Created:** ${new Date().toISOString()}  
**Priority:** P1  
**Owner:** DevOps Team  
**Status:** Ready

## Issue Summary

System doctor detected ${failures.length} failure(s) requiring attention.

## Failures

${failures
  .map(
    (f) => `### ${f.check}

**Status:** ${f.status.toUpperCase()}
**Message:** ${f.message}
**Fix Attempted:** ${f.fixAttempted ? 'Yes' : 'No'}
**Fix Success:** ${f.fixSuccess ? 'Yes' : 'No'}
`
  )
  .join('\n')}

## Recommended Actions

1. Review diagnostic results above
2. Check logs in /reports/exec/
3. Run preflight checks: \`tsx scripts/agents/preflight.ts\`
4. Verify database: \`tsx scripts/agents/verify_db.ts\`
5. Apply migrations if needed: \`supabase db push\`

## 30-Day Success Signal

- All diagnostic checks pass
- System doctor reports healthy status
- No new tickets opened for 7 days

## KPI

- System uptime > 99.9%
- Diagnostic pass rate = 100%
- Mean time to resolution < 4 hours
`;

  fs.mkdirSync(path.dirname(ticketPath), { recursive: true });
  fs.writeFileSync(ticketPath, ticketContent);

  info(`Backlog ticket created: ${ticketPath}`);
}

async function runSystemDoctor(): Promise<void> {
  info('Running system doctor');

  // Run checks
  const deltaOk = await checkDeltaMigration();
  const verifyOk = await checkDatabaseVerification();

  const failures = diagnostics.filter((d) => d.status === 'fail');

  if (failures.length > 0) {
    // Attempt automatic fix
    const fixOk = await attemptFix();

    // Re-verify after fix
    if (fixOk) {
      await checkDatabaseVerification();
    }

    const stillFailing = diagnostics.filter((d) => d.status === 'fail');
    if (stillFailing.length > 0) {
      // Create backlog ticket
      await createBacklogTicket(stillFailing);

      // Notify
      await notify({
        title: 'System Doctor: Failures Detected',
        message: `${stillFailing.length} issue(s) detected. Ticket created.`,
        level: 'error',
        metadata: { failures: stillFailing.map((f) => f.check) },
      });

      error(`System doctor found ${stillFailing.length} failure(s)`);
      process.exit(1);
    }
  }

  info('✅ System doctor: All checks passed');
  await notify({
    title: 'System Doctor: Healthy',
    message: 'All diagnostic checks passed.',
    level: 'info',
  });
}

async function main() {
  try {
    await runSystemDoctor();
    process.exit(0);
  } catch (err) {
    error('System doctor failed', { error: err });
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
