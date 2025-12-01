#!/usr/bin/env tsx
/**
 * Master Orchestration Script
 * Executes all phases in order: Preflight → Guardrails → System Health → Migrations → ETL → DQ → Doctor → Summary
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { info, error, getLogs, writeLogsToMarkdown } from './lib/logger.js';
import { notify } from './agents/notify.js';

const execAsync = promisify(exec);

interface PhaseResult {
  phase: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration?: number;
}

const results: PhaseResult[] = [];

async function runCommand(command: string, phase: string): Promise<boolean> {
  const startTime = Date.now();
  info(`Starting phase: ${phase}`);
  
  try {
    const { stdout, stderr } = await execAsync(command);
    const duration = Date.now() - startTime;
    
    if (stderr && !stderr.includes('info') && !stderr.includes('warn')) {
      results.push({
        phase,
        status: 'fail',
        message: stderr,
        duration,
      });
      error(`Phase failed: ${phase}`, { stderr });
      return false;
    }
    
    results.push({
      phase,
      status: 'pass',
      message: stdout || 'Completed successfully',
      duration,
    });
    info(`Phase completed: ${phase}`, { duration: `${duration}ms` });
    return true;
  } catch (err: any) {
    const duration = Date.now() - startTime;
    results.push({
      phase,
      status: 'fail',
      message: err.message || String(err),
      duration,
    });
    error(`Phase failed: ${phase}`, { error: err });
    return false;
  }
}

async function orchestrateMaster(): Promise<void> {
  info('Starting master orchestration');

  // Phase 1: Preflight
  const preflightOk = await runCommand(
    'tsx scripts/agents/preflight.ts',
    'Preflight Checks'
  );

  if (!preflightOk) {
    error('Preflight failed - aborting orchestration');
    await generateSummary();
    process.exit(1);
  }

  // Phase 2: System Health Audit (stub reports)
  await runCommand('tsx scripts/agents/system_health.ts', 'System Health Audit');

  // Phase 3: Generate Delta Migration
  const deltaOk = await runCommand(
    'tsx scripts/agents/generate_delta_migration.ts',
    'Delta Migration Generation'
  );

  // Phase 4: Apply Migrations (if delta was generated)
  if (deltaOk) {
    // Try Supabase CLI first
    const cliOk = await runCommand(
      'supabase db push --include-all',
      'Supabase CLI Migration'
    );

    if (!cliOk) {
      // Fallback to psql
      info('Supabase CLI failed, attempting psql fallback');
      const migrationFiles = fs
        .readdirSync(path.join(process.cwd(), 'supabase', 'migrations'))
        .filter((f) => f.endsWith('.sql'))
        .sort()
        .slice(-1);

      if (migrationFiles.length > 0) {
        const migrationPath = path.join(
          process.cwd(),
          'supabase',
          'migrations',
          migrationFiles[0]
        );
        const dbUrl = process.env.SUPABASE_DB_URL;
        if (dbUrl) {
          await runCommand(
            `psql "${dbUrl}" -f "${migrationPath}"`,
            'PSQL Fallback Migration'
          );
        }
      }
    }
  }

  // Phase 5: Verify Database
  const verifyOk = await runCommand(
    'tsx scripts/agents/verify_db.ts',
    'Database Verification'
  );

  if (!verifyOk) {
    error('Database verification failed');
  }

  // Phase 6: Smoke Test ETL (dry-run)
  const dryRunOk = await runCommand(
    'tsx scripts/etl/pull_events.ts --dry-run',
    'ETL Smoke Test (Dry-Run)'
  );

  // Phase 7: Compute Metrics (if backfill enabled)
  const runBackfill = process.env.RUN_BACKFILL === 'true';
  if (runBackfill) {
    await runCommand('tsx scripts/etl/compute_metrics.ts', 'Metrics Computation');
  } else {
    // Default: compute for yesterday
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    process.env.BACKFILL_START = yesterday;
    process.env.BACKFILL_END = yesterday;
    await runCommand('tsx scripts/etl/compute_metrics.ts', 'Metrics Computation (Yesterday)');
  }

  // Phase 8: Data Quality Checks
  const dqOk = await runCommand(
    'tsx scripts/agents/run_data_quality.ts',
    'Data Quality Checks'
  );

  // Phase 9: System Doctor
  const doctorOk = await runCommand(
    'tsx scripts/agents/system_doctor.ts',
    'System Doctor'
  );

  // Phase 10: Generate Summary
  await generateSummary();

  // Notify
  const failures = results.filter((r) => r.status === 'fail');
  if (failures.length > 0) {
    await notify({
      title: 'Master Orchestration: Failures Detected',
      message: `${failures.length} phase(s) failed. Check summary report.`,
      level: 'error',
      metadata: { failures: failures.map((f) => f.phase) },
    });
  } else {
    await notify({
      title: 'Master Orchestration: Success',
      message: 'All phases completed successfully.',
      level: 'info',
    });
  }
}

async function generateSummary(): Promise<void> {
  const timestamp = new Date().toISOString().slice(0, 10);
  const summaryPath = path.join(
    process.cwd(),
    'reports',
    'exec',
    `run_summary_${timestamp}.md`
  );

  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.filter((r) => r.status === 'fail').length;
  const skipCount = results.filter((r) => r.status === 'skip').length;

  const summaryContent = `# Master Orchestration Run Summary

**Generated:** ${new Date().toISOString()}  
**Status:** ${failCount > 0 ? '❌ FAILED' : '✅ SUCCESS'}

## Summary

- ✅ Passed: ${passCount}
- ❌ Failed: ${failCount}
- ⏭️ Skipped: ${skipCount}

## Phase Results

${results
  .map((r) => {
    const icon = r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⏭️';
    return `### ${icon} ${r.phase}

**Status:** ${r.status.toUpperCase()}
**Duration:** ${r.duration ? `${r.duration}ms` : 'N/A'}
**Message:** ${r.message.substring(0, 200)}${r.message.length > 200 ? '...' : ''}
`;
  })
  .join('\n')}

## Created Files

${getCreatedFiles().map((f) => `- \`${f}\``).join('\n')}

## Next Best Actions

${getNextActions().map((a) => `- ${a}`).join('\n')}

## Failures

${failCount > 0
  ? failures
      .map((f) => `- **${f.phase}**: ${f.message.substring(0, 100)}`)
      .join('\n')
  : 'None'}

## Links

- Preflight Report: \`reports/exec/preflight_report.md\`
- System Health: \`reports/system_health_${timestamp}.md\`
- Backlog Tickets: \`backlog/READY_*\`
`;

  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
  fs.writeFileSync(summaryPath, summaryContent);

  // Write logs
  writeLogsToMarkdown(
    path.join(process.cwd(), 'reports', 'exec', `run_logs_${timestamp}.md`)
  );

  info(`Summary written: ${summaryPath}`);
}

function getCreatedFiles(): string[] {
  const files: string[] = [];
  
  // Check for migration files
  const migrationDir = path.join(process.cwd(), 'supabase', 'migrations');
  if (fs.existsSync(migrationDir)) {
    const migrations = fs.readdirSync(migrationDir).filter((f) => f.endsWith('.sql'));
    files.push(...migrations.map((f) => `supabase/migrations/${f}`));
  }

  // Check for reports
  const reportsDir = path.join(process.cwd(), 'reports');
  if (fs.existsSync(reportsDir)) {
    const reports = fs.readdirSync(reportsDir, { recursive: true }).filter((f) =>
      f.endsWith('.md')
    );
    files.push(...reports.map((f) => `reports/${f}`));
  }

  return files.slice(0, 20); // Limit to 20 files
}

function getNextActions(): string[] {
  const actions: string[] = [];
  const failures = results.filter((r) => r.status === 'fail');

  if (failures.length > 0) {
    actions.push('Review failed phases and fix issues');
    actions.push('Re-run orchestration after fixes');
  } else {
    actions.push('Monitor ETL jobs for next 7 days');
    actions.push('Review system health reports');
    actions.push('Set up alerts for data quality failures');
  }

  return actions;
}

const failures = results.filter((r) => r.status === 'fail');

async function main() {
  try {
    await orchestrateMaster();
    process.exit(failures.length > 0 ? 1 : 0);
  } catch (err) {
    error('Master orchestration failed', { error: err });
    await generateSummary();
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
