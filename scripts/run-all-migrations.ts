#!/usr/bin/env tsx
/**
 * Master Migration Orchestrator
 * 
 * Runs all migration-related scripts in the correct order:
 * 1. Migration Guardian (Prisma migrations)
 * 2. Supabase migrations (if needed)
 * 3. Schema validation
 * 4. Post-migration checks
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command: string, description: string): { success: boolean; output: string } {
  log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  log(`${colors.bright}${description}${colors.reset}`);
  log(`${colors.blue}Running: ${command}${colors.reset}\n`);
  
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    return { success: true, output: output || '' };
  } catch (error: any) {
    log(`\n${colors.red}❌ Failed: ${error.message}${colors.reset}`, 'red');
    return { success: false, output: error.message || '' };
  }
}

async function checkPrerequisites(): Promise<boolean> {
  log(`\n${colors.bright}📋 Checking Prerequisites${colors.reset}`);
  
  const checks = [
    {
      name: 'DATABASE_URL or SUPABASE_DB_URL',
      check: () => !!(process.env.DATABASE_URL || process.env.SUPABASE_DB_URL),
    },
    {
      name: 'Prisma schema exists',
      check: () => existsSync(join(process.cwd(), 'apps', 'web', 'prisma', 'schema.prisma')),
    },
    {
      name: 'Migration Guardian script exists',
      check: () => existsSync(join(process.cwd(), 'scripts', 'migration-guardian.ts')),
    },
  ];
  
  let allPassed = true;
  for (const { name, check } of checks) {
    const passed = check();
    if (passed) {
      log(`  ✅ ${name}`, 'green');
    } else {
      log(`  ❌ ${name}`, 'red');
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function main() {
  log(`\n${colors.bright}${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
  log(`${colors.bright}${colors.cyan}║   Master Migration Orchestrator              ║${colors.reset}`);
  log(`${colors.bright}${colors.cyan}║   Running all migrations and validations     ║${colors.reset}`);
  log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}`);
  
  // Check prerequisites
  const prerequisitesOk = await checkPrerequisites();
  if (!prerequisitesOk) {
    log(`\n${colors.red}❌ Prerequisites not met. Please configure your environment.${colors.reset}`, 'red');
    log(`\nRequired environment variables:`, 'yellow');
    log(`  - DATABASE_URL or SUPABASE_DB_URL`, 'yellow');
    process.exit(1);
  }
  
  const results: Array<{ name: string; success: boolean }> = [];
  
  // Step 1: Run Migration Guardian (Prisma migrations)
  log(`\n${colors.bright}${colors.green}Step 1: Migration Guardian (Prisma Migrations)${colors.reset}`);
  const guardianResult = runCommand(
    'pnpm run migrate:guardian',
    'Migration Guardian - Prisma + Supabase + Upstash'
  );
  results.push({ name: 'Migration Guardian', success: guardianResult.success });
  
  if (!guardianResult.success) {
    log(`\n${colors.yellow}⚠️  Migration Guardian failed. Continuing with other checks...${colors.reset}`, 'yellow');
  }
  
  // Step 2: Check for Supabase migrations (if SUPABASE_DB_URL is set)
  if (process.env.SUPABASE_DB_URL || process.env.DATABASE_URL) {
    log(`\n${colors.bright}${colors.green}Step 2: Supabase Migrations Check${colors.reset}`);
    
    const supabaseMigrationsDir = join(process.cwd(), 'supabase', 'migrations');
    if (existsSync(supabaseMigrationsDir)) {
      log(`  ℹ️  Supabase migrations directory found`, 'blue');
      log(`  ℹ️  Note: Supabase migrations are typically handled by Supabase CLI`, 'blue');
      log(`  ℹ️  If needed, run: supabase db push${colors.reset}`, 'blue');
    }
  }
  
  // Step 3: Schema Validation
  log(`\n${colors.bright}${colors.green}Step 3: Schema Validation${colors.reset}`);
  const validateResult = runCommand(
    'pnpm run db:validate-schema',
    'Validating database schema'
  );
  results.push({ name: 'Schema Validation', success: validateResult.success });
  
  // Step 4: Generate Prisma Client (if needed)
  log(`\n${colors.bright}${colors.green}Step 4: Prisma Client Generation${colors.reset}`);
  const generateResult = runCommand(
    'pnpm run db:generate',
    'Generating Prisma Client'
  );
  results.push({ name: 'Prisma Client Generation', success: generateResult.success });
  
  // Summary
  log(`\n${colors.bright}${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
  log(`${colors.bright}${colors.cyan}║              Migration Summary                  ║${colors.reset}`);
  log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);
  
  let allSuccess = true;
  for (const result of results) {
    if (result.success) {
      log(`  ✅ ${result.name}`, 'green');
    } else {
      log(`  ❌ ${result.name}`, 'red');
      allSuccess = false;
    }
  }
  
  if (allSuccess) {
    log(`\n${colors.bright}${colors.green}✅ All migrations completed successfully!${colors.reset}\n`, 'green');
    process.exit(0);
  } else {
    log(`\n${colors.bright}${colors.yellow}⚠️  Some steps failed. Check the output above for details.${colors.reset}\n`, 'yellow');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n${colors.red}❌ Fatal error: ${error.message}${colors.reset}`, 'red');
  console.error(error);
  process.exit(1);
});
