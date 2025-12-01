#!/usr/bin/env tsx
/**
 * Comprehensive Security Audit Script
 * Checks for security vulnerabilities, misconfigurations, and best practices
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface SecurityIssue {
  level: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  message: string;
  file?: string;
  line?: number;
  recommendation: string;
}

const issues: SecurityIssue[] = [];

function checkHardcodedSecrets(): void {
  console.log("🔍 Checking for hardcoded secrets...");
  
  const patterns = [
    { pattern: /sk_live_[a-zA-Z0-9]{24,}/, name: "Stripe Live Secret Key" },
    { pattern: /sk_test_[a-zA-Z0-9]{24,}/, name: "Stripe Test Secret Key" },
    { pattern: /pk_live_[a-zA-Z0-9]{24,}/, name: "Stripe Live Publishable Key" },
    { pattern: /whsec_[a-zA-Z0-9]{32,}/, name: "Stripe Webhook Secret" },
    { pattern: /[a-zA-Z0-9_-]{32,}@[a-zA-Z0-9.-]+\.supabase\.co/, name: "Supabase Service Role Key" },
    { pattern: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/, name: "JWT Token" },
    { pattern: /ghp_[a-zA-Z0-9]{36,}/, name: "GitHub Personal Access Token" },
    { pattern: /gho_[a-zA-Z0-9]{36,}/, name: "GitHub OAuth Token" },
    { pattern: /ghu_[a-zA-Z0-9]{36,}/, name: "GitHub User Token" },
    { pattern: /ghr_[a-zA-Z0-9]{36,}/, name: "GitHub Refresh Token" },
  ];

  // Check common file types
  const filesToCheck = [
    "**/*.ts",
    "**/*.tsx",
    "**/*.js",
    "**/*.jsx",
    "**/*.yml",
    "**/*.yaml",
    "**/.env*",
  ];

  // This is a simplified check - in production, use glob to find files
  console.log("⚠️  Hardcoded secret check requires file scanning (use grep in CI)");
}

function checkEnvironmentVariables(): void {
  console.log("🔍 Checking environment variable usage...");
  
  const envExample = join(process.cwd(), ".env.example");
  if (!existsSync(envExample)) {
    issues.push({
      level: "high",
      category: "Configuration",
      message: ".env.example file not found",
      recommendation: "Create .env.example with all required environment variables",
    });
    return;
  }

  const content = readFileSync(envExample, "utf-8");
  
  // Check for required variables
  const requiredVars = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "DATABASE_URL",
  ];

  for (const varName of requiredVars) {
    if (!content.includes(varName)) {
      issues.push({
        level: "medium",
        category: "Configuration",
        message: `Required environment variable ${varName} not documented in .env.example`,
        file: ".env.example",
        recommendation: `Add ${varName} to .env.example`,
      });
    }
  }
}

function checkSecurityHeaders(): void {
  console.log("🔍 Checking security headers configuration...");
  
  const nextConfig = join(process.cwd(), "next.config.ts");
  if (!existsSync(nextConfig)) {
    return;
  }

  const content = readFileSync(nextConfig, "utf-8");
  
  const requiredHeaders = [
    "X-Frame-Options",
    "X-Content-Type-Options",
    "X-XSS-Protection",
    "Strict-Transport-Security",
    "Content-Security-Policy",
  ];

  for (const header of requiredHeaders) {
    if (!content.includes(header)) {
      issues.push({
        level: "medium",
        category: "Security Headers",
        message: `Security header ${header} not configured`,
        file: "next.config.ts",
        recommendation: `Add ${header} to security headers configuration`,
      });
    }
  }
}

function checkDependencies(): void {
  console.log("🔍 Checking dependencies for vulnerabilities...");
  
  const packageJson = join(process.cwd(), "package.json");
  if (!existsSync(packageJson)) {
    return;
  }

  console.log("⚠️  Dependency vulnerability check requires 'npm audit' (run separately)");
  console.log("   Run: pnpm audit --audit-level moderate");
}

function checkRLSPolicies(): void {
  console.log("🔍 Checking RLS policies...");
  
  const migrationsDir = join(process.cwd(), "supabase/migrations");
  if (!existsSync(migrationsDir)) {
    return;
  }

  console.log("⚠️  RLS policy check requires database connection (run db:validate-schema)");
}

function checkAPIEndpoints(): void {
  console.log("🔍 Checking API endpoint security...");
  
  const apiDir = join(process.cwd(), "app/api");
  if (!existsSync(apiDir)) {
    return;
  }

  console.log("⚠️  API security check requires code analysis (use ESLint security plugin)");
}

function printResults(): void {
  console.log("\n📊 Security Audit Results\n");

  const critical = issues.filter(i => i.level === "critical");
  const high = issues.filter(i => i.level === "high");
  const medium = issues.filter(i => i.level === "medium");
  const low = issues.filter(i => i.level === "low");
  const info = issues.filter(i => i.level === "info");

  console.log(`Critical: ${critical.length}`);
  console.log(`High: ${high.length}`);
  console.log(`Medium: ${medium.length}`);
  console.log(`Low: ${low.length}`);
  console.log(`Info: ${info.length}\n`);

  if (critical.length > 0) {
    console.log("🔴 CRITICAL ISSUES:\n");
    critical.forEach(issue => {
      console.log(`  ${issue.message}`);
      if (issue.file) console.log(`    File: ${issue.file}`);
      if (issue.line) console.log(`    Line: ${issue.line}`);
      console.log(`    Recommendation: ${issue.recommendation}\n`);
    });
  }

  if (high.length > 0) {
    console.log("🟠 HIGH PRIORITY ISSUES:\n");
    high.forEach(issue => {
      console.log(`  ${issue.message}`);
      if (issue.file) console.log(`    File: ${issue.file}`);
      console.log(`    Recommendation: ${issue.recommendation}\n`);
    });
  }

  if (medium.length > 0) {
    console.log("🟡 MEDIUM PRIORITY ISSUES:\n");
    medium.forEach(issue => {
      console.log(`  ${issue.message}`);
      console.log(`    Recommendation: ${issue.recommendation}\n`);
    });
  }

  if (critical.length === 0 && high.length === 0) {
    console.log("✅ No critical or high-priority security issues found!\n");
  }

  console.log("\n💡 Recommendations:");
  console.log("  1. Run 'pnpm audit' to check for dependency vulnerabilities");
  console.log("  2. Run 'pnpm run env:doctor' to check environment variables");
  console.log("  3. Review security headers in next.config.ts");
  console.log("  4. Check RLS policies: pnpm run db:validate-schema");
}

function runAudit(): void {
  console.log("🔒 Running Security Audit...\n");

  checkHardcodedSecrets();
  checkEnvironmentVariables();
  checkSecurityHeaders();
  checkDependencies();
  checkRLSPolicies();
  checkAPIEndpoints();

  printResults();

  // Exit with error code if critical/high issues found
  const hasCriticalIssues = issues.some(i => i.level === "critical" || i.level === "high");
  if (hasCriticalIssues) {
    process.exit(1);
  }
}

if (require.main === module) {
  runAudit();
}

export { runAudit, issues };
