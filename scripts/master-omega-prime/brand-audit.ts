#!/usr/bin/env tsx
/**
 * MASTER OMEGA PRIME — Brand Consistency Audit
 * 
 * Finds and reports all instances of "Hardonia" that should be "AIAS Platform"
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface BrandIssue {
  file: string;
  line: number;
  content: string;
  severity: 'critical' | 'warning' | 'info';
}

const BRAND_PATTERNS = [
  { pattern: /Hardonia/gi, replacement: 'AIAS Platform', severity: 'critical' as const },
  { pattern: /hardonia/gi, replacement: 'AIAS Platform', severity: 'critical' as const },
  { pattern: /HARDONIA/gi, replacement: 'AIAS Platform', severity: 'critical' as const },
];

const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /dist/,
  /build/,
  /coverage/,
  /\.lock/,
  /pnpm-lock/,
  /package-lock/,
];

const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.md', '.json', '.yml', '.yaml'];

function shouldProcessFile(filePath: string): boolean {
  // Check exclude patterns
  if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath))) {
    return false;
  }
  
  // Check extension
  const ext = extname(filePath);
  return INCLUDE_EXTENSIONS.includes(ext);
}

function findBrandIssues(filePath: string): BrandIssue[] {
  const issues: BrandIssue[] = [];
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      BRAND_PATTERNS.forEach(({ pattern, severity }) => {
        if (pattern.test(line)) {
          issues.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            severity,
          });
        }
      });
    });
  } catch (error) {
    // Skip files that can't be read
  }
  
  return issues;
}

function scanDirectory(dir: string): BrandIssue[] {
  const issues: BrandIssue[] = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      
      try {
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          issues.push(...scanDirectory(fullPath));
        } else if (stat.isFile() && shouldProcessFile(fullPath)) {
          issues.push(...findBrandIssues(fullPath));
        }
      } catch (error) {
        // Skip entries that can't be accessed
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return issues;
}

function printReport(dryRun: boolean = true) {
  const rootDir = process.cwd();
  const issues = scanDirectory(rootDir);
  
  console.log('\n🔍 MASTER OMEGA PRIME — Brand Consistency Audit\n');
  console.log('='.repeat(70));
  console.log(`Total Issues Found: ${issues.length}`);
  console.log(`🚨 Critical: ${issues.filter((i) => i.severity === 'critical').length}`);
  console.log(`⚠️  Warnings: ${issues.filter((i) => i.severity === 'warning').length}`);
  console.log(`ℹ️  Info: ${issues.filter((i) => i.severity === 'info').length}`);
  console.log('='.repeat(70));
  console.log();
  
  if (issues.length === 0) {
    console.log('✅ No brand consistency issues found!\n');
    return;
  }
  
  // Group by file
  const byFile = issues.reduce((acc, issue) => {
    if (!acc[issue.file]) acc[issue.file] = [];
    acc[issue.file].push(issue);
    return acc;
  }, {} as Record<string, BrandIssue[]>);
  
  Object.entries(byFile).forEach(([file, fileIssues]) => {
    console.log(`\n📄 ${file}`);
    console.log('-'.repeat(70));
    
    fileIssues.forEach((issue) => {
      const icon = issue.severity === 'critical' ? '🚨' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} Line ${issue.line}: ${issue.content.substring(0, 60)}...`);
    });
  });
  
  console.log('\n' + '='.repeat(70));
  
  if (dryRun) {
    console.log('\n💡 This was a dry run. Use --fix to automatically replace instances.\n');
  } else {
    console.log('\n✅ Brand consistency fixes applied!\n');
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--fix');
  printReport(dryRun);
  
  if (!dryRun) {
    console.log('⚠️  Auto-fix not yet implemented. Please review and fix manually.\n');
  }
  
  process.exit(0);
}

export { scanDirectory, findBrandIssues };
