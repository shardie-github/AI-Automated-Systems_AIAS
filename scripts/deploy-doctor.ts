#!/usr/bin/env tsx
/**
 * Deploy Doctor - Diagnostic tool for deployment configuration
 * 
 * Checks for common misconfigurations that prevent reliable deployments:
 * - Missing required environment variables
 * - Node version mismatches
 * - Package manager mismatches
 * - Missing deploy scripts
 * - Workflow configuration issues
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface DiagnosticResult {
  check: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  fix?: string;
}

const results: DiagnosticResult[] = [];

// Helper to add results
function addResult(check: string, status: 'pass' | 'fail' | 'warn', message: string, fix?: string) {
  results.push({ check, status, message, fix });
}

// Check Node version in package.json
function checkNodeVersion() {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    if (!existsSync(packageJsonPath)) {
      addResult('Node Version', 'fail', 'package.json not found');
      return;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const engines = packageJson.engines || {};
    const nodeVersion = engines.node;

    if (!nodeVersion) {
      addResult('Node Version', 'warn', 'No Node version specified in package.json engines', 'Add "engines": { "node": ">=20 <21" } to package.json');
      return;
    }

    if (!nodeVersion.includes('20')) {
      addResult('Node Version', 'fail', `Node version mismatch: ${nodeVersion} (should include 20)`, 'Update engines.node to ">=20 <21"');
      return;
    }

    addResult('Node Version', 'pass', `Node version correctly specified: ${nodeVersion}`);
  } catch (error) {
    addResult('Node Version', 'fail', `Error checking Node version: ${error}`);
  }
}

// Check package manager
function checkPackageManager() {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    if (!existsSync(packageJsonPath)) {
      addResult('Package Manager', 'fail', 'package.json not found');
      return;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const packageManager = packageJson.packageManager;

    if (!packageManager) {
      addResult('Package Manager', 'warn', 'No packageManager field in package.json', 'Add "packageManager": "pnpm@8.15.0" to package.json');
      return;
    }

    if (!packageManager.startsWith('pnpm@')) {
      addResult('Package Manager', 'fail', `Wrong package manager: ${packageManager} (should be pnpm)`, 'Update packageManager to "pnpm@8.15.0"');
      return;
    }

    addResult('Package Manager', 'pass', `Package manager correctly specified: ${packageManager}`);
  } catch (error) {
    addResult('Package Manager', 'fail', `Error checking package manager: ${error}`);
  }
}

// Check for lockfile consistency
function checkLockfiles() {
  const lockfiles = [
    { name: 'pnpm-lock.yaml', expected: true },
    { name: 'package-lock.json', expected: false },
    { name: 'yarn.lock', expected: false },
  ];

  let hasCorrectLockfile = false;
  let hasWrongLockfile = false;

  for (const lockfile of lockfiles) {
    const exists = existsSync(join(process.cwd(), lockfile.name));
    if (lockfile.expected && exists) {
      hasCorrectLockfile = true;
    } else if (!lockfile.expected && exists) {
      hasWrongLockfile = true;
      addResult('Lockfiles', 'fail', `Found ${lockfile.name} (should use pnpm-lock.yaml only)`, `Remove ${lockfile.name} and use pnpm install`);
    }
  }

  if (!hasCorrectLockfile) {
    addResult('Lockfiles', 'warn', 'No pnpm-lock.yaml found', 'Run pnpm install to generate lockfile');
  } else if (!hasWrongLockfile) {
    addResult('Lockfiles', 'pass', 'Correct lockfile present (pnpm-lock.yaml)');
  }
}

// Check deploy scripts in package.json
function checkDeployScripts() {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    if (!existsSync(packageJsonPath)) {
      addResult('Deploy Scripts', 'fail', 'package.json not found');
      return;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const scripts = packageJson.scripts || {};
    const requiredScripts = ['build', 'vercel:deploy:preview', 'vercel:deploy:prod'];

    const missing: string[] = [];
    for (const script of requiredScripts) {
      if (!scripts[script]) {
        missing.push(script);
      }
    }

    if (missing.length > 0) {
      addResult('Deploy Scripts', 'fail', `Missing deploy scripts: ${missing.join(', ')}`, `Add missing scripts to package.json`);
      return;
    }

    addResult('Deploy Scripts', 'pass', 'All required deploy scripts present');
  } catch (error) {
    addResult('Deploy Scripts', 'fail', `Error checking deploy scripts: ${error}`);
  }
}

// Check .env.example for required variables
function checkEnvExample() {
  try {
    const envExamplePath = join(process.cwd(), '.env.example');
    if (!existsSync(envExamplePath)) {
      addResult('Environment Variables', 'warn', '.env.example not found', 'Create .env.example with required variables');
      return;
    }

    const envExample = readFileSync(envExamplePath, 'utf-8');
    const requiredVars = [
      'VERCEL_TOKEN',
      'VERCEL_ORG_ID',
      'VERCEL_PROJECT_ID',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];

    const missing: string[] = [];
    for (const varName of requiredVars) {
      if (!envExample.includes(varName)) {
        missing.push(varName);
      }
    }

    if (missing.length > 0) {
      addResult('Environment Variables', 'warn', `Missing variables in .env.example: ${missing.join(', ')}`, `Add missing variables to .env.example`);
      return;
    }

    addResult('Environment Variables', 'pass', 'Required variables documented in .env.example');
  } catch (error) {
    addResult('Environment Variables', 'warn', `Error checking .env.example: ${error}`);
  }
}

// Check GitHub workflows
function checkWorkflows() {
  try {
    const workflowsPath = join(process.cwd(), '.github', 'workflows');
    if (!existsSync(workflowsPath)) {
      addResult('GitHub Workflows', 'fail', '.github/workflows directory not found');
      return;
    }

    const requiredWorkflows = [
      'frontend-deploy.yml',
      'ci.yml',
      'apply-supabase-migrations.yml',
    ];

    const missing: string[] = [];
    for (const workflow of requiredWorkflows) {
      const workflowPath = join(workflowsPath, workflow);
      if (!existsSync(workflowPath)) {
        missing.push(workflow);
      }
    }

    if (missing.length > 0) {
      addResult('GitHub Workflows', 'fail', `Missing workflows: ${missing.join(', ')}`, `Create missing workflow files`);
      return;
    }

    // Check for deprecated workflows
    const deprecatedWorkflows = ['deploy-main.yml'];
    const foundDeprecated: string[] = [];
    for (const workflow of deprecatedWorkflows) {
      const workflowPath = join(workflowsPath, workflow);
      if (existsSync(workflowPath)) {
        foundDeprecated.push(workflow);
      }
    }

    if (foundDeprecated.length > 0) {
      addResult('GitHub Workflows', 'warn', `Deprecated workflows found: ${foundDeprecated.join(', ')}`, `Remove deprecated workflows or mark as disabled`);
      return;
    }

    addResult('GitHub Workflows', 'pass', 'Required workflows present');
  } catch (error) {
    addResult('GitHub Workflows', 'fail', `Error checking workflows: ${error}`);
  }
}

// Check vercel.json configuration
function checkVercelConfig() {
  try {
    const vercelJsonPath = join(process.cwd(), 'vercel.json');
    if (!existsSync(vercelJsonPath)) {
      addResult('Vercel Config', 'warn', 'vercel.json not found', 'Create vercel.json if needed for custom configuration');
      return;
    }

    const vercelJson = JSON.parse(readFileSync(vercelJsonPath, 'utf-8'));
    
    // Check if Git integration is disabled
    if (vercelJson.git?.deploymentEnabled?.main === true || vercelJson.github?.deploymentEnabled?.main === true) {
      addResult('Vercel Config', 'fail', 'Vercel Git integration is enabled (conflicts with GitHub Actions)', 'Set git.deploymentEnabled and github.deploymentEnabled to false in vercel.json');
      return;
    }

    addResult('Vercel Config', 'pass', 'Vercel Git integration correctly disabled');
  } catch (error) {
    addResult('Vercel Config', 'warn', `Error checking vercel.json: ${error}`);
  }
}

// Run all checks
function runDiagnostics() {
  console.log('🔍 Running deployment diagnostics...\n');

  checkNodeVersion();
  checkPackageManager();
  checkLockfiles();
  checkDeployScripts();
  checkEnvExample();
  checkWorkflows();
  checkVercelConfig();

  // Print results
  console.log('📊 Diagnostic Results:\n');

  const statusEmoji = {
    pass: '✅',
    fail: '❌',
    warn: '⚠️',
  };

  let hasFailures = false;
  let hasWarnings = false;

  for (const result of results) {
    const emoji = statusEmoji[result.status];
    console.log(`${emoji} ${result.check}: ${result.message}`);
    
    if (result.fix) {
      console.log(`   💡 Fix: ${result.fix}`);
    }

    if (result.status === 'fail') {
      hasFailures = true;
    } else if (result.status === 'warn') {
      hasWarnings = true;
    }
  }

  console.log('\n' + '='.repeat(60));
  
  if (hasFailures) {
    console.log('\n❌ FAILURES DETECTED - Deployment will likely fail');
    console.log('Please fix the issues above before deploying.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  WARNINGS DETECTED - Review recommendations above');
    console.log('Deployment may work, but configuration could be improved.\n');
    process.exit(0);
  } else {
    console.log('\n✅ ALL CHECKS PASSED - Configuration looks good!');
    console.log('Deployment should work correctly.\n');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  runDiagnostics();
}

export { runDiagnostics };
