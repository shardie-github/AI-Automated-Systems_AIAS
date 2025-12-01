#!/usr/bin/env tsx
/**
 * Check for missing telemetry instrumentation
 * Scans API routes and pages for telemetry tracking
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface TelemetryCheckResult {
  file: string;
  hasTelemetry: boolean;
  hasPerformanceTracking: boolean;
  issues: string[];
}

const API_ROUTES_DIR = 'app/api';
const PAGES_DIR = 'app';

async function checkFile(filePath: string): Promise<TelemetryCheckResult> {
  const content = await readFile(filePath, 'utf-8');
  const hasTelemetry = content.includes('telemetry.track') || content.includes('telemetry.trackPerformance');
  const hasPerformanceTracking = content.includes('trackPerformance') || content.includes('X-Response-Time');
  
  const issues: string[] = [];
  
  // Check if it's an API route handler
  if (filePath.includes('/api/') && filePath.endsWith('route.ts')) {
    if (!hasPerformanceTracking) {
      issues.push('Missing performance tracking');
    }
  }
  
  // Check if it's a page component
  if (filePath.includes('/page.tsx') && !filePath.includes('/api/')) {
    if (!hasTelemetry && content.includes('useEffect')) {
      issues.push('Consider adding Web Vitals tracking');
    }
  }
  
  return {
    file: filePath,
    hasTelemetry,
    hasPerformanceTracking,
    issues,
  };
}

async function findRouteFiles(dir: string, fileList: string[] = []): Promise<string[]> {
  const files = await readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = join(dir, file.name);
    
    if (file.isDirectory()) {
      await findRouteFiles(filePath, fileList);
    } else if (file.name === 'route.ts' || file.name === 'page.tsx') {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

async function main() {
  console.log('🔍 Checking telemetry instrumentation...\n');
  
  const apiRoutes = await findRouteFiles(API_ROUTES_DIR);
  const pages = await findRouteFiles(PAGES_DIR).then(files => 
    files.filter(f => f.includes('/page.tsx') && !f.includes('/api/'))
  );
  
  const results: TelemetryCheckResult[] = [];
  
  // Check API routes
  for (const route of apiRoutes) {
    const result = await checkFile(route);
    results.push(result);
  }
  
  // Check critical pages
  const criticalPages = pages.filter(p => 
    p.includes('/admin/') || 
    p.includes('/billing/') || 
    p.includes('/checkout')
  );
  
  for (const page of criticalPages) {
    const result = await checkFile(page);
    results.push(result);
  }
  
  // Report results
  const filesWithIssues = results.filter(r => r.issues.length > 0);
  
  if (filesWithIssues.length === 0) {
    console.log('✅ All checked files have telemetry instrumentation\n');
    process.exit(0);
  }
  
  console.log(`⚠️  Found ${filesWithIssues.length} files with missing telemetry:\n`);
  
  for (const result of filesWithIssues) {
    console.log(`  ${result.file}`);
    for (const issue of result.issues) {
      console.log(`    - ${issue}`);
    }
    console.log();
  }
  
  process.exit(1);
}

main().catch(console.error);
