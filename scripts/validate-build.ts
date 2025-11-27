#!/usr/bin/env tsx
/**
 * Build Validation Script
 * 
 * Validates Next.js build output to ensure Vercel deployment will succeed.
 * Checks for common issues like missing index files, JSON parsing errors, etc.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

const BUILD_DIR = join(process.cwd(), '.next');
const REQUIRED_DIRS = ['static', 'server'];
const REQUIRED_FILES = [
  '.next/BUILD_ID',
  '.next/package.json',
];

/**
 * Validate build directory exists
 */
function validateBuildDirectory(): ValidationResult {
  const result: ValidationResult = { success: true, errors: [], warnings: [] };

  if (!existsSync(BUILD_DIR)) {
    result.success = false;
    result.errors.push(`Build directory not found: ${BUILD_DIR}`);
    return result;
  }

  const stats = statSync(BUILD_DIR);
  if (!stats.isDirectory()) {
    result.success = false;
    result.errors.push(`${BUILD_DIR} exists but is not a directory`);
    return result;
  }

  return result;
}

/**
 * Validate required directories exist
 */
function validateRequiredDirectories(): ValidationResult {
  const result: ValidationResult = { success: true, errors: [], warnings: [] };

  for (const dir of REQUIRED_DIRS) {
    const dirPath = join(BUILD_DIR, dir);
    if (!existsSync(dirPath)) {
      result.success = false;
      result.errors.push(`Required directory missing: ${dirPath}`);
    } else {
      const stats = statSync(dirPath);
      if (!stats.isDirectory()) {
        result.success = false;
        result.errors.push(`${dirPath} exists but is not a directory`);
      }
    }
  }

  return result;
}

/**
 * Validate required files exist
 */
function validateRequiredFiles(): ValidationResult {
  const result: ValidationResult = { success: true, errors: [], warnings: [] };

  for (const file of REQUIRED_FILES) {
    const filePath = join(process.cwd(), file);
    if (!existsSync(filePath)) {
      result.success = false;
      result.errors.push(`Required file missing: ${filePath}`);
    }
  }

  return result;
}

/**
 * Validate BUILD_ID file
 */
function validateBuildId(): ValidationResult {
  const result: ValidationResult = { success: true, errors: [], warnings: [] };
  const buildIdPath = join(BUILD_DIR, 'BUILD_ID');

  if (!existsSync(buildIdPath)) {
    result.success = false;
    result.errors.push('BUILD_ID file missing');
    return result;
  }

  try {
    const buildId = readFileSync(buildIdPath, 'utf-8').trim();
    if (!buildId || buildId.length === 0) {
      result.success = false;
      result.errors.push('BUILD_ID file is empty');
    }
  } catch (error: any) {
    result.success = false;
    result.errors.push(`Failed to read BUILD_ID: ${error.message}`);
  }

  return result;
}

/**
 * Validate package.json in build output
 */
function validatePackageJson(): ValidationResult {
  const result: ValidationResult = { success: true, errors: [], warnings: [] };
  const packageJsonPath = join(BUILD_DIR, 'package.json');

  if (!existsSync(packageJsonPath)) {
    result.warnings.push('package.json not found in build output (may be optional)');
    return result;
  }

  try {
    const content = readFileSync(packageJsonPath, 'utf-8');
    JSON.parse(content);
  } catch (error: any) {
    result.success = false;
    result.errors.push(`Invalid JSON in package.json: ${error.message}`);
  }

  return result;
}

/**
 * Validate static directory structure
 */
function validateStaticDirectory(): ValidationResult {
  const result: ValidationResult = { success: true, errors: [], warnings: [] };
  const staticDir = join(BUILD_DIR, 'static');

  if (!existsSync(staticDir)) {
    result.warnings.push('Static directory not found (may be empty)');
    return result;
  }

  try {
    const entries = readdirSync(staticDir);
    if (entries.length === 0) {
      result.warnings.push('Static directory is empty');
    }
  } catch (error: any) {
    result.success = false;
    result.errors.push(`Failed to read static directory: ${error.message}`);
  }

  return result;
}

/**
 * Validate server directory structure
 */
function validateServerDirectory(): ValidationResult {
  const result: ValidationResult = { success: true, errors: [], warnings: [] };
  const serverDir = join(BUILD_DIR, 'server');

  if (!existsSync(serverDir)) {
    result.success = false;
    result.errors.push('Server directory missing - build may be incomplete');
    return result;
  }

  // Check for required server files
  const requiredServerFiles = ['pages-manifest.json', 'app-paths-manifest.json'];
  for (const file of requiredServerFiles) {
    const filePath = join(serverDir, file);
    if (!existsSync(filePath)) {
      result.warnings.push(`Server file not found: ${file} (may be optional)`);
    } else {
      // Validate JSON files
      try {
        const content = readFileSync(filePath, 'utf-8');
        JSON.parse(content);
      } catch (error: any) {
        result.success = false;
        result.errors.push(`Invalid JSON in ${file}: ${error.message}`);
      }
    }
  }

  return result;
}

/**
 * Validate all JSON files in build output
 */
function validateJsonFiles(): ValidationResult {
  const result: ValidationResult = { success: true, errors: [], warnings: [] };

  function checkDirectory(dirPath: string, depth: number = 0) {
    if (depth > 5) return; // Prevent infinite recursion

    try {
      const entries = readdirSync(dirPath);
      for (const entry of entries) {
        const entryPath = join(dirPath, entry);
        const stats = statSync(entryPath);

        if (stats.isDirectory()) {
          checkDirectory(entryPath, depth + 1);
        } else if (entry.endsWith('.json')) {
          try {
            const content = readFileSync(entryPath, 'utf-8');
            JSON.parse(content);
          } catch (error: any) {
            result.success = false;
            result.errors.push(`Invalid JSON file: ${entryPath} - ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      // Skip directories we can't read
      result.warnings.push(`Could not read directory: ${dirPath}`);
    }
  }

  if (existsSync(BUILD_DIR)) {
    checkDirectory(BUILD_DIR);
  }

  return result;
}

/**
 * Validate index files exist where needed
 */
function validateIndexFiles(): ValidationResult {
  const result: ValidationResult = { success: true, errors: [], warnings: [] };

  // Check for app directory index
  const appDir = join(BUILD_DIR, 'server', 'app');
  if (existsSync(appDir)) {
    const hasIndex = readdirSync(appDir).some(entry => 
      entry.includes('index') || entry.includes('page')
    );
    if (!hasIndex) {
      result.warnings.push('No index/page files found in app directory');
    }
  }

  // Check for pages directory index
  const pagesDir = join(BUILD_DIR, 'server', 'pages');
  if (existsSync(pagesDir)) {
    const hasIndex = readdirSync(pagesDir).some(entry => 
      entry.includes('index')
    );
    if (!hasIndex) {
      result.warnings.push('No index files found in pages directory');
    }
  }

  return result;
}

/**
 * Main validation function
 */
async function main() {
  console.log('\n🔍 Validating Next.js Build Output\n');
  console.log('='.repeat(60));

  const results: ValidationResult[] = [
    validateBuildDirectory(),
    validateRequiredDirectories(),
    validateRequiredFiles(),
    validateBuildId(),
    validatePackageJson(),
    validateStaticDirectory(),
    validateServerDirectory(),
    validateJsonFiles(),
    validateIndexFiles(),
  ];

  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  for (const result of results) {
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  console.log('\n📊 Validation Results:');
  console.log('='.repeat(60));

  if (allErrors.length > 0) {
    console.log('\n❌ Errors:');
    allErrors.forEach(error => console.log(`   - ${error}`));
  }

  if (allWarnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    allWarnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (allErrors.length === 0 && allWarnings.length === 0) {
    console.log('\n✅ All validations passed!');
  }

  console.log('='.repeat(60));

  if (allErrors.length > 0) {
    console.error('\n❌ Build validation failed');
    process.exit(1);
  }

  console.log('\n✅ Build validation successful Vercel deployment checks\n');
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Fatal error during validation:', error);
  process.exit(1);
});
