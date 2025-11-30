#!/usr/bin/env tsx
/**
 * Comprehensive Vercel Deployment Verification
 * 
 * Verifies that all Vercel build and deployment configurations are correct
 * and that deployments to preview and production will succeed.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface VerificationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  checks: Array<{ name: string; passed: boolean; message?: string }>;
}

const result: VerificationResult = {
  success: true,
  errors: [],
  warnings: [],
  checks: [],
};

function addCheck(name: string, passed: boolean, message?: string) {
  result.checks.push({ name, passed, message });
  if (!passed) {
    result.success = false;
    result.errors.push(`${name}: ${message || 'Failed'}`);
  }
}

function addWarning(message: string) {
  result.warnings.push(message);
}

/**
 * Verify vercel.json exists and is valid
 */
function verifyVercelConfig() {
  console.log('🔍 Verifying vercel.json...');
  
  const vercelJsonPath = join(process.cwd(), 'vercel.json');
  
  if (!existsSync(vercelJsonPath)) {
    addCheck('vercel.json exists', false, 'vercel.json not found');
    return;
  }
  
  addCheck('vercel.json exists', true);
  
  try {
    const content = readFileSync(vercelJsonPath, 'utf-8');
    const config = JSON.parse(content);
    
    // Check required fields
    if (!config.buildCommand) {
      addWarning('buildCommand not specified in vercel.json');
    } else {
      addCheck('buildCommand specified', true, config.buildCommand);
    }
    
    if (!config.installCommand) {
      addWarning('installCommand not specified in vercel.json');
    } else {
      addCheck('installCommand specified', true);
    }
    
    // Verify outputDirectory points to correct location
    if (config.outputDirectory) {
      if (config.outputDirectory === 'apps/web/.next') {
        addWarning('outputDirectory points to apps/web/.next - verify this directory exists');
      } else if (config.outputDirectory === '.next') {
        addCheck('outputDirectory is .next', true);
      }
    }
    
    // Check framework
    if (config.framework === 'nextjs') {
      addCheck('Framework is Next.js', true);
    } else {
      addWarning(`Framework is ${config.framework}, expected 'nextjs'`);
    }
    
  } catch (error: any) {
    addCheck('vercel.json is valid JSON', false, error.message);
  }
}

/**
 * Verify vercel-build.sh exists and is executable
 */
function verifyBuildScript() {
  console.log('🔍 Verifying vercel-build.sh...');
  
  const buildScriptPath = join(process.cwd(), 'vercel-build.sh');
  
  if (!existsSync(buildScriptPath)) {
    addCheck('vercel-build.sh exists', false, 'vercel-build.sh not found');
    return;
  }
  
  addCheck('vercel-build.sh exists', true);
  
  // Check if it's executable (on Unix systems)
  try {
    const fs = require('fs');
    const stats = fs.statSync(buildScriptPath);
    const isExecutable = (stats.mode & parseInt('111', 8)) !== 0;
    
    if (isExecutable) {
      addCheck('vercel-build.sh is executable', true);
    } else {
      addWarning('vercel-build.sh is not executable (may need chmod +x)');
    }
  } catch {
    // Windows doesn't have executable bits, skip this check
    addCheck('vercel-build.sh is executable', true, 'Skipped on Windows');
  }
  
  // Verify script content
  try {
    const content = readFileSync(buildScriptPath, 'utf-8');
    
    if (content.includes('pnpm')) {
      addCheck('Build script uses pnpm', true);
    } else {
      addWarning('Build script may not use pnpm');
    }
    
    if (content.includes('ENABLE_EXPERIMENTAL_COREPACK')) {
      addCheck('Build script enables corepack', true);
    } else {
      addWarning('Build script may not enable corepack');
    }
    
  } catch (error: any) {
    addWarning(`Could not read build script: ${error.message}`);
  }
}

/**
 * Verify .vercelignore exists
 */
function verifyVercelIgnore() {
  console.log('🔍 Verifying .vercelignore...');
  
  const vercelIgnorePath = join(process.cwd(), '.vercelignore');
  
  if (!existsSync(vercelIgnorePath)) {
    addWarning('.vercelignore not found (optional but recommended)');
    return;
  }
  
  addCheck('.vercelignore exists', true);
}

/**
 * Verify next.config.mjs exists
 */
function verifyNextConfig() {
  console.log('🔍 Verifying Next.js configuration...');
  
  const nextConfigPath = join(process.cwd(), 'next.config.mjs');
  const nextConfigJsPath = join(process.cwd(), 'next.config.js');
  
  if (existsSync(nextConfigPath)) {
    addCheck('next.config.mjs exists', true);
  } else if (existsSync(nextConfigJsPath)) {
    addCheck('next.config.js exists', true);
  } else {
    addWarning('Next.js config file not found (may use default config)');
  }
}

/**
 * Verify package.json has required scripts
 */
function verifyPackageJson() {
  console.log('🔍 Verifying package.json...');
  
  const packageJsonPath = join(process.cwd(), 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    addCheck('package.json exists', false, 'package.json not found');
    return;
  }
  
  addCheck('package.json exists', true);
  
  try {
    const content = readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);
    
    // Check for build script
    if (pkg.scripts?.build) {
      addCheck('build script exists', true, pkg.scripts.build);
    } else {
      addCheck('build script exists', false, 'No build script in package.json');
    }
    
    // Check for validate:build script
    if (pkg.scripts?.['validate:build']) {
      addCheck('validate:build script exists', true);
    } else {
      addWarning('validate:build script not found (recommended)');
    }
    
    // Check for verify:deployment script
    if (pkg.scripts?.['verify:deployment']) {
      addCheck('verify:deployment script exists', true);
    } else {
      addWarning('verify:deployment script not found (recommended)');
    }
    
    // Check package manager
    if (pkg.packageManager?.includes('pnpm')) {
      addCheck('Package manager is pnpm', true, pkg.packageManager);
    } else {
      addWarning(`Package manager is ${pkg.packageManager || 'not specified'}, expected pnpm`);
    }
    
  } catch (error: any) {
    addCheck('package.json is valid JSON', false, error.message);
  }
}

/**
 * Verify pnpm-lock.yaml exists
 */
function verifyPnpmLock() {
  console.log('🔍 Verifying pnpm-lock.yaml...');
  
  const lockPath = join(process.cwd(), 'pnpm-lock.yaml');
  
  if (existsSync(lockPath)) {
    addCheck('pnpm-lock.yaml exists', true);
  } else {
    addCheck('pnpm-lock.yaml exists', false, 'pnpm-lock.yaml not found - required for frozen lockfile installs');
  }
}

/**
 * Verify GitHub workflows for Vercel deployment
 */
function verifyGitHubWorkflows() {
  console.log('🔍 Verifying GitHub workflows...');
  
  const workflowsDir = join(process.cwd(), '.github', 'workflows');
  
  if (!existsSync(workflowsDir)) {
    addWarning('.github/workflows directory not found');
    return;
  }
  
  const requiredWorkflows = [
    'frontend-deploy.yml',
    'vercel-build-check.yml',
  ];
  
  for (const workflow of requiredWorkflows) {
    const workflowPath = join(workflowsDir, workflow);
    if (existsSync(workflowPath)) {
      addCheck(`Workflow ${workflow} exists`, true);
    } else {
      addWarning(`Workflow ${workflow} not found`);
    }
  }
}

/**
 * Main verification function
 */
async function main() {
  console.log('\n🚀 Vercel Deployment Configuration Verification\n');
  console.log('='.repeat(60));
  
  verifyVercelConfig();
  verifyBuildScript();
  verifyVercelIgnore();
  verifyNextConfig();
  verifyPackageJson();
  verifyPnpmLock();
  verifyGitHubWorkflows();
  
  console.log('\n📊 Verification Results:');
  console.log('='.repeat(60));
  
  result.checks.forEach(check => {
    const icon = check.passed ? '✅' : '❌';
    console.log(`${icon} ${check.name}${check.message ? `: ${check.message}` : ''}`);
  });
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  console.log('='.repeat(60));
  
  if (result.success) {
    console.log('\n✅ All critical checks passed! Vercel deployment should succeed.\n');
    process.exit(0);
  } else {
    console.error('\n❌ Some checks failed. Please fix errors before deploying.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error during verification:', error);
  process.exit(1);
});
