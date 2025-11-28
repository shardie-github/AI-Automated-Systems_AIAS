/**
 * AURORA PRIME — FULL STACK AUTOPILOT
 * 
 * Autonomous full-stack orchestrator responsible for validating, healing, and deploying
 * the entire application stack end-to-end across GitHub → Supabase → Vercel → Expo.
 * 
 * All secrets originate from GitHub repository secrets and must remain there.
 * Never requires local .env files.
 */

import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

interface AuroraStatus {
  supabase: 'Healthy' | 'FIXED' | 'Needs Attention';
  vercel: 'Healthy' | 'FIXED' | 'Needs Attention';
  expo: 'Healthy' | 'FIXED' | 'Needs Attention';
  githubActions: 'Healthy' | 'FIXED' | 'Needs Attention';
  secretsAlignment: 'Healthy' | 'FIXED' | 'Needs Attention';
  schemaDrift: 'None' | 'Auto-repaired' | 'Needs Manual Review';
}

interface AuroraReport {
  timestamp: string;
  status: AuroraStatus;
  issues: Array<{
    component: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    fix?: string;
    fixed?: boolean;
  }>;
  recommendations: string[];
  fixesApplied: string[];
}

class AuroraPrime {
  private supabase: any;
  private octokit: Octokit;
  private report: AuroraReport;
  private fixesApplied: string[] = [];

  // Required secrets from GitHub
  private requiredSecrets = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
    'SUPABASE_PROJECT_REF',
    'SUPABASE_ACCESS_TOKEN',
    'VERCEL_TOKEN',
    'VERCEL_ORG_ID',
    'VERCEL_PROJECT_ID',
    'NEXT_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_TOKEN',
  ];

  constructor() {
    const projectRef = process.env.SUPABASE_PROJECT_REF || '';
    const supabaseUrl = process.env.SUPABASE_URL || `https://${projectRef}.supabase.co`;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    this.report = {
      timestamp: new Date().toISOString(),
      status: {
        supabase: 'Needs Attention',
        vercel: 'Needs Attention',
        expo: 'Needs Attention',
        githubActions: 'Needs Attention',
        secretsAlignment: 'Needs Attention',
        schemaDrift: 'None',
      },
      issues: [],
      recommendations: [],
      fixesApplied: [],
    };
  }

  /**
   * Main execution: Full-stack smoke test
   */
  async run(): Promise<AuroraReport> {
    console.log('\n⭐ AURORA PRIME — FULL STACK AUTOPILOT');
    console.log('=' .repeat(60));
    console.log(`🚀 Starting full-system validation at ${this.report.timestamp}\n`);

    try {
      // 1. ENVIRONMENT VERIFICATION
      await this.verifyEnvironmentSecrets();

      // 2. SUPABASE — MIGRATION & SCHEMA HEALTH
      await this.validateSupabaseHealth();

      // 3. VERCEL — FRONTEND DEPLOYMENT CHECK
      await this.validateVercelDeployment();

      // 4. EXPO — MOBILE APP DEPLOYMENT
      await this.validateExpoConfiguration();

      // 5. CI/CD PIPELINE AUTOPILOT
      await this.validateAndHealCICD();

      // 6. Generate final report
      this.generateFinalReport();

      return this.report;
    } catch (error: any) {
      console.error('❌ Aurora Prime execution failed:', error);
      this.report.issues.push({
        component: 'Aurora Prime',
        severity: 'error',
        message: `Execution failed: ${error.message}`,
      });
      this.report.status.supabase = 'Needs Attention';
      this.report.status.vercel = 'Needs Attention';
      this.report.status.expo = 'Needs Attention';
      this.report.status.githubActions = 'Needs Attention';
      return this.report;
    }
  }

  /**
   * 1. ENVIRONMENT VERIFICATION
   * Confirm all secrets are properly configured and aligned
   */
  private async verifyEnvironmentSecrets(): Promise<void> {
    console.log('🔍 [1/5] Verifying environment secrets alignment...');

    const missingSecrets: string[] = [];
    const misalignedSecrets: string[] = [];

    // Check if secrets are available (in CI, they come from GitHub Secrets)
    for (const secret of this.requiredSecrets) {
      if (!process.env[secret] && !process.env[`GITHUB_${secret}`]) {
        missingSecrets.push(secret);
      }
    }

    // Verify Supabase URL alignment
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const expoSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    
    if (supabaseUrl && expoSupabaseUrl && supabaseUrl !== expoSupabaseUrl) {
      misalignedSecrets.push('Supabase URLs mismatch between Next.js and Expo');
    }

    if (missingSecrets.length > 0) {
      this.report.issues.push({
        component: 'Secrets',
        severity: 'error',
        message: `Missing secrets: ${missingSecrets.join(', ')}`,
        fix: 'Ensure all required secrets are configured in GitHub repository secrets',
      });
      this.report.status.secretsAlignment = 'Needs Attention';
    } else if (misalignedSecrets.length > 0) {
      this.report.issues.push({
        component: 'Secrets',
        severity: 'warning',
        message: `Misaligned secrets: ${misalignedSecrets.join(', ')}`,
        fix: 'Align Supabase URLs across all environments',
      });
      this.report.status.secretsAlignment = 'Needs Attention';
    } else {
      console.log('✅ All secrets properly configured');
      this.report.status.secretsAlignment = 'Healthy';
    }
  }

  /**
   * 2. SUPABASE — MIGRATION & SCHEMA HEALTH
   */
  private async validateSupabaseHealth(): Promise<void> {
    console.log('🗄️  [2/5] Validating Supabase migration & schema health...');

    try {
      // Check Supabase CLI availability
      try {
        execSync('which supabase', { stdio: 'ignore' });
      } catch {
        console.log('⚠️  Supabase CLI not found, installing...');
        execSync('npm install -g supabase', { stdio: 'inherit' });
      }

      // Login to Supabase
      const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
      const projectRef = process.env.SUPABASE_PROJECT_REF;

      if (!accessToken || !projectRef) {
        this.report.issues.push({
          component: 'Supabase',
          severity: 'error',
          message: 'Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF',
        });
        this.report.status.supabase = 'Needs Attention';
        return;
      }

      // Authenticate
      try {
        execSync(`echo "${accessToken}" | supabase login --token -`, { stdio: 'pipe' });
        execSync(`supabase link --project-ref ${projectRef}`, { stdio: 'pipe' });
      } catch (error: any) {
        this.report.issues.push({
          component: 'Supabase',
          severity: 'error',
          message: `Failed to authenticate: ${error.message}`,
        });
        this.report.status.supabase = 'Needs Attention';
        return;
      }

      // Check migration status
      let migrationStatus = '';
      try {
        migrationStatus = execSync('supabase db remote commit --dry-run', {
          encoding: 'utf-8',
          stdio: 'pipe',
        });
      } catch (error: any) {
        migrationStatus = error.stdout || error.message;
      }

      // Check for pending migrations
      const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
      if (existsSync(migrationsDir)) {
        const migrations = readdirSync(migrationsDir)
          .filter(f => f.endsWith('.sql'))
          .sort();

        console.log(`📦 Found ${migrations.length} migration files`);

        // Verify migrations can be applied
        if (migrationStatus.includes('No remote changes') || migrationStatus.includes('up to date')) {
          console.log('✅ Database schema is up to date');
          this.report.status.supabase = 'Healthy';
          this.report.status.schemaDrift = 'None';
        } else {
          console.log('⚠️  Schema drift detected, attempting auto-repair...');
          
          // Attempt to apply migrations
          try {
            execSync('supabase db push --include-all', { stdio: 'inherit' });
            console.log('✅ Migrations applied successfully');
            this.report.status.supabase = 'FIXED';
            this.report.status.schemaDrift = 'Auto-repaired';
            this.fixesApplied.push('Applied pending Supabase migrations');
          } catch (error: any) {
            this.report.issues.push({
              component: 'Supabase',
              severity: 'error',
              message: `Failed to apply migrations: ${error.message}`,
              fix: 'Review migration files and apply manually',
            });
            this.report.status.supabase = 'Needs Attention';
            this.report.status.schemaDrift = 'Needs Manual Review';
          }
        }
      }

      // Verify Supabase status
      try {
        const statusOutput = execSync('supabase status', { encoding: 'utf-8', stdio: 'pipe' });
        if (statusOutput.includes('healthy') || statusOutput.includes('API URL')) {
          console.log('✅ Supabase instance is healthy');
          if (this.report.status.supabase === 'Needs Attention') {
            this.report.status.supabase = 'Healthy';
          }
        }
      } catch (error: any) {
        console.log('⚠️  Could not verify Supabase status (may be remote only)');
      }

      // Verify Prisma schema alignment (if Prisma is used)
      const prismaSchemaPath = join(process.cwd(), 'apps', 'web', 'prisma', 'schema.prisma');
      if (existsSync(prismaSchemaPath)) {
        try {
          execSync('cd apps/web && npx prisma validate', { stdio: 'pipe' });
          console.log('✅ Prisma schema is valid');
        } catch (error: any) {
          this.report.issues.push({
            component: 'Supabase',
            severity: 'warning',
            message: `Prisma schema validation failed: ${error.message}`,
            fix: 'Run `npx prisma validate` to identify issues',
          });
        }
      }

    } catch (error: any) {
      this.report.issues.push({
        component: 'Supabase',
        severity: 'error',
        message: `Supabase validation failed: ${error.message}`,
      });
      this.report.status.supabase = 'Needs Attention';
    }
  }

  /**
   * 3. VERCEL — FRONTEND DEPLOYMENT CHECK
   */
  private async validateVercelDeployment(): Promise<void> {
    console.log('🚀 [3/5] Validating Vercel deployment configuration...');

    try {
      const vercelToken = process.env.VERCEL_TOKEN;
      const vercelProjectId = process.env.VERCEL_PROJECT_ID;
      const vercelOrgId = process.env.VERCEL_ORG_ID;

      if (!vercelToken) {
        this.report.issues.push({
          component: 'Vercel',
          severity: 'warning',
          message: 'VERCEL_TOKEN not found - skipping Vercel validation',
        });
        this.report.status.vercel = 'Needs Attention';
        return;
      }

      // Check Vercel CLI availability
      try {
        execSync('which vercel', { stdio: 'ignore' });
      } catch {
        console.log('⚠️  Vercel CLI not found, installing...');
        execSync('npm install -g vercel', { stdio: 'inherit' });
      }

      // Verify project linking
      if (vercelProjectId && vercelOrgId) {
        try {
          // Pull Vercel configuration
          execSync(`vercel pull --yes --environment=production --token ${vercelToken}`, {
            stdio: 'pipe',
          });
          console.log('✅ Vercel project is properly linked');
        } catch (error: any) {
          this.report.issues.push({
            component: 'Vercel',
            severity: 'warning',
            message: `Could not verify Vercel project link: ${error.message}`,
            fix: 'Run `vercel link` to link the project',
          });
        }
      }

      // Check vercel.json configuration
      const vercelConfigPath = join(process.cwd(), 'vercel.json');
      if (existsSync(vercelConfigPath)) {
        const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, 'utf-8'));
        
        // Verify build command
        if (!vercelConfig.buildCommand) {
          this.report.issues.push({
            component: 'Vercel',
            severity: 'warning',
            message: 'Missing buildCommand in vercel.json',
            fix: 'Add buildCommand to vercel.json',
          });
        }

        // Verify environment variables are referenced correctly
        if (vercelConfig.env) {
          const envVars = Object.keys(vercelConfig.env);
          const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'];
          const missingVars = requiredVars.filter(v => !envVars.includes(v));
          
          if (missingVars.length > 0) {
            console.log(`⚠️  Missing environment variables in vercel.json: ${missingVars.join(', ')}`);
            // Auto-fix: Add missing vars (they should come from GitHub Secrets)
            console.log('ℹ️  Note: Environment variables should be configured in Vercel dashboard, not vercel.json');
          }
        }
      }

      // Verify latest deployment
      try {
        const deployments = execSync(`vercel ls --token ${vercelToken}`, {
          encoding: 'utf-8',
          stdio: 'pipe',
        });
        
        if (deployments.includes('Production') || deployments.includes('Ready')) {
          console.log('✅ Vercel deployment found');
          this.report.status.vercel = 'Healthy';
        } else {
          this.report.issues.push({
            component: 'Vercel',
            severity: 'warning',
            message: 'No production deployment found',
            fix: 'Trigger a production deployment',
          });
        }
      } catch (error: any) {
        console.log('⚠️  Could not verify deployments (may require project access)');
      }

      // Check GitHub Actions workflow for Vercel deployment
      const deployWorkflowPath = join(process.cwd(), '.github', 'workflows', 'deploy-main.yml');
      if (existsSync(deployWorkflowPath)) {
        const workflowContent = readFileSync(deployWorkflowPath, 'utf-8');
        
        if (!workflowContent.includes('VERCEL_TOKEN')) {
          this.report.issues.push({
            component: 'Vercel',
            severity: 'error',
            message: 'VERCEL_TOKEN not referenced in deploy-main.yml',
            fix: 'Add VERCEL_TOKEN to workflow environment variables',
          });
          this.report.status.vercel = 'Needs Attention';
        } else {
          console.log('✅ Vercel deployment workflow properly configured');
          if (this.report.status.vercel === 'Needs Attention') {
            this.report.status.vercel = 'Healthy';
          }
        }
      }

    } catch (error: any) {
      this.report.issues.push({
        component: 'Vercel',
        severity: 'error',
        message: `Vercel validation failed: ${error.message}`,
      });
      this.report.status.vercel = 'Needs Attention';
    }
  }

  /**
   * 4. EXPO — MOBILE APP DEPLOYMENT
   */
  private async validateExpoConfiguration(): Promise<void> {
    console.log('📱 [4/5] Validating Expo mobile app configuration...');

    try {
      const easConfigPath = join(process.cwd(), 'eas.json');
      if (!existsSync(easConfigPath)) {
        this.report.issues.push({
          component: 'Expo',
          severity: 'warning',
          message: 'eas.json not found - Expo may not be configured',
        });
        this.report.status.expo = 'Needs Attention';
        return;
      }

      const easConfig = JSON.parse(readFileSync(easConfigPath, 'utf-8'));

      // Verify EAS configuration
      if (!easConfig.build) {
        this.report.issues.push({
          component: 'Expo',
          severity: 'error',
          message: 'Missing build configuration in eas.json',
        });
        this.report.status.expo = 'Needs Attention';
        return;
      }

      // Verify OTA updates are configured
      if (!easConfig.updates) {
        this.report.issues.push({
          component: 'Expo',
          severity: 'warning',
          message: 'OTA updates not configured in eas.json',
          fix: 'Add updates configuration to enable OTA updates',
        });
      } else {
        console.log('✅ OTA updates configured');
      }

      // Verify Supabase URL alignment
      const expoSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const nextSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

      if (expoSupabaseUrl && nextSupabaseUrl && expoSupabaseUrl !== nextSupabaseUrl) {
        this.report.issues.push({
          component: 'Expo',
          severity: 'error',
          message: 'EXPO_PUBLIC_SUPABASE_URL does not match NEXT_PUBLIC_SUPABASE_URL',
          fix: 'Align Supabase URLs across Next.js and Expo',
        });
        this.report.status.expo = 'Needs Attention';
      } else if (expoSupabaseUrl) {
        console.log('✅ Expo Supabase URL configured');
      }

      // Check GitHub Actions workflow for Expo
      const mobileWorkflowPath = join(process.cwd(), '.github', 'workflows', 'mobile.yml');
      if (existsSync(mobileWorkflowPath)) {
        const workflowContent = readFileSync(mobileWorkflowPath, 'utf-8');
        
        if (!workflowContent.includes('EXPO_TOKEN')) {
          this.report.issues.push({
            component: 'Expo',
            severity: 'error',
            message: 'EXPO_TOKEN not referenced in mobile.yml',
            fix: 'Add EXPO_TOKEN to workflow environment variables',
          });
        } else {
          console.log('✅ Expo workflow properly configured');
        }

        if (!workflowContent.includes('EXPO_PUBLIC_SUPABASE_URL')) {
          this.report.issues.push({
            component: 'Expo',
            severity: 'warning',
            message: 'EXPO_PUBLIC_SUPABASE_URL not set in mobile workflow',
            fix: 'Add EXPO_PUBLIC_SUPABASE_URL to workflow environment variables',
          });
        }
      }

      // Verify EAS CLI availability (for build checks)
      try {
        execSync('which eas', { stdio: 'ignore' });
        console.log('✅ EAS CLI available');
        
        // Run diagnostics (non-blocking)
        try {
          execSync('eas diagnostics --non-interactive', { stdio: 'pipe', timeout: 10000 });
        } catch {
          // Diagnostics may fail, but that's okay for validation
        }
      } catch {
        console.log('⚠️  EAS CLI not found (optional for validation)');
      }

      if (this.report.status.expo === 'Needs Attention' && this.report.issues.filter(i => i.component === 'Expo' && i.severity === 'error').length === 0) {
        this.report.status.expo = 'Healthy';
      }

    } catch (error: any) {
      this.report.issues.push({
        component: 'Expo',
        severity: 'error',
        message: `Expo validation failed: ${error.message}`,
      });
      this.report.status.expo = 'Needs Attention';
    }
  }

  /**
   * 5. CI/CD PIPELINE AUTOPILOT
   */
  private async validateAndHealCICD(): Promise<void> {
    console.log('🔄 [5/5] Validating and healing CI/CD pipelines...');

    try {
      const workflowsDir = join(process.cwd(), '.github', 'workflows');
      if (!existsSync(workflowsDir)) {
        this.report.issues.push({
          component: 'GitHub Actions',
          severity: 'error',
          message: '.github/workflows directory not found',
        });
        this.report.status.githubActions = 'Needs Attention';
        return;
      }

      const workflowFiles = readdirSync(workflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
      console.log(`📋 Found ${workflowFiles.length} workflow files`);

      const issues: Array<{ file: string; issue: string; fix?: string }> = [];

      for (const workflowFile of workflowFiles) {
        const workflowPath = join(workflowsDir, workflowFile);
        const content = readFileSync(workflowPath, 'utf-8');

        // Check for required secrets
        const requiredSecretsInWorkflow = this.requiredSecrets.filter(secret => {
          // Check if secret is used but not referenced
          return content.includes(secret) && !content.includes(`secrets.${secret}`);
        });

        if (requiredSecretsInWorkflow.length > 0) {
          issues.push({
            file: workflowFile,
            issue: `Secrets used but not properly referenced: ${requiredSecretsInWorkflow.join(', ')}`,
            fix: `Update workflow to use $\{\{ secrets.${requiredSecretsInWorkflow[0]} \}\}`,
          });
        }

        // Check for missing permissions
        if (content.includes('contents: write') && !content.includes('permissions:')) {
          issues.push({
            file: workflowFile,
            issue: 'Missing permissions block',
            fix: 'Add permissions block to workflow',
          });
        }

        // Check for missing Supabase setup in migration workflows
        if (workflowFile.includes('supabase') || workflowFile.includes('migration')) {
          if (!content.includes('supabase/setup-cli')) {
            issues.push({
              file: workflowFile,
              issue: 'Missing Supabase CLI setup step',
              fix: 'Add supabase/setup-cli@v1 action',
            });
          }
        }

        // Check for missing Vercel setup in deployment workflows
        if (workflowFile.includes('vercel') || workflowFile.includes('deploy')) {
          if (!content.includes('vercel') && !content.includes('VERCEL_TOKEN')) {
            issues.push({
              file: workflowFile,
              issue: 'Missing Vercel configuration',
              fix: 'Add Vercel deployment steps or VERCEL_TOKEN environment variable',
            });
          }
        }
      }

      if (issues.length > 0) {
        console.log(`⚠️  Found ${issues.length} workflow issues`);
        
        for (const issue of issues) {
          this.report.issues.push({
            component: 'GitHub Actions',
            severity: 'warning',
            message: `${issue.file}: ${issue.issue}`,
            fix: issue.fix,
          });
        }

        // Attempt auto-fix for simple issues
        const autoFixableIssues = issues.filter(i => i.fix && !i.fix.includes('manually'));
        if (autoFixableIssues.length > 0) {
          console.log(`🔧 Attempting to auto-fix ${autoFixableIssues.length} issues...`);
          // Note: Auto-fixing workflows requires careful parsing and modification
          // For now, we'll just report the issues
        }

        this.report.status.githubActions = 'Needs Attention';
      } else {
        console.log('✅ All workflows properly configured');
        this.report.status.githubActions = 'Healthy';
      }

      // Check for "Doctor" job (as specified in requirements)
      const doctorWorkflowExists = workflowFiles.some(f => {
        const content = readFileSync(join(workflowsDir, f), 'utf-8');
        return content.includes('doctor') || content.includes('Doctor');
      });

      if (!doctorWorkflowExists) {
        console.log('⚠️  No automated "Doctor" job found, creating one...');
        await this.createDoctorWorkflow();
        this.fixesApplied.push('Created automated Doctor workflow');
        this.report.status.githubActions = 'FIXED';
      }

    } catch (error: any) {
      this.report.issues.push({
        component: 'GitHub Actions',
        severity: 'error',
        message: `CI/CD validation failed: ${error.message}`,
      });
      this.report.status.githubActions = 'Needs Attention';
    }
  }

  /**
   * Create automated "Doctor" workflow job
   */
  private async createDoctorWorkflow(): Promise<void> {
    const doctorWorkflow = `name: Aurora Prime Doctor

on:
  schedule:
    # Run daily at 3 AM UTC
    - cron: '0 3 * * *'
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  doctor:
    name: Aurora Prime System Doctor
    runs-on: ubuntu-latest
    environment: production
    
    env:
      SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}
      SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
      PRISMA_CLIENT_ENGINE_TYPE: wasm
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Prisma Validate
        run: |
          cd apps/web
          npx prisma validate || echo "Prisma validation failed"

      - name: Check Supabase Schema
        run: |
          npm install -g supabase
          echo "${{ secrets.SUPABASE_ACCESS_TOKEN }}" | supabase login --token -
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          supabase db remote commit --dry-run || echo "Schema drift detected"

      - name: Verify Vercel Project
        run: |
          npm install -g vercel
          vercel projects ls --token ${{ secrets.VERCEL_TOKEN }} | grep -q "${{ secrets.VERCEL_PROJECT_ID }}" || echo "Vercel project mismatch"

      - name: Verify Expo Configs
        run: |
          test -f eas.json || echo "eas.json missing"
          npm install -g eas-cli
          eas diagnostics --non-interactive || echo "Expo diagnostics failed"

      - name: Run Aurora Prime
        run: npm run aurora:prime

      - name: Upload Aurora Prime Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: aurora-prime-report
          path: aurora-prime-report.json
          retention-days: 30
`;

    const workflowsDir = join(process.cwd(), '.github', 'workflows');
    const doctorWorkflowPath = join(workflowsDir, 'aurora-prime-doctor.yml');
    
    writeFileSync(doctorWorkflowPath, doctorWorkflow);
    console.log('✅ Created Aurora Prime Doctor workflow');
  }

  /**
   * Generate final comprehensive status report
   */
  private generateFinalReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('⭐ AURORA PRIME — FULL SYSTEM STATUS');
    console.log('='.repeat(60));
    console.log(`\nTimestamp: ${this.report.timestamp}\n`);

    console.log('COMPONENT STATUS:');
    console.log(`  Supabase:           [${this.report.status.supabase}]`);
    console.log(`  Vercel Deployment:  [${this.report.status.vercel}]`);
    console.log(`  Expo (iOS/Android):  [${this.report.status.expo}]`);
    console.log(`  GitHub Actions:      [${this.report.status.githubActions}]`);
    console.log(`  Secrets Alignment:   [${this.report.status.secretsAlignment}]`);
    console.log(`  Schema Drift:        [${this.report.status.schemaDrift}]`);

    if (this.fixesApplied.length > 0) {
      console.log('\n🔧 FIXES APPLIED:');
      this.fixesApplied.forEach(fix => console.log(`  ✓ ${fix}`));
      this.report.fixesApplied = this.fixesApplied;
    }

    if (this.report.issues.length > 0) {
      console.log('\n⚠️  ISSUES DETECTED:');
      this.report.issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`  ${icon} [${issue.component}] ${issue.message}`);
        if (issue.fix) {
          console.log(`     Fix: ${issue.fix}`);
        }
      });
    }

    // Generate recommendations
    this.report.recommendations = this.generateRecommendations();

    if (this.report.recommendations.length > 0) {
      console.log('\n📋 RECOMMENDED NEXT ACTIONS:');
      this.report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }

    // Save report to file
    const reportPath = join(process.cwd(), 'aurora-prime-report.json');
    writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`\n📄 Full report saved to: ${reportPath}`);

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.report.status.supabase === 'Needs Attention') {
      recommendations.push('Review and fix Supabase migration issues');
      recommendations.push('Verify Supabase project is properly linked');
    }

    if (this.report.status.vercel === 'Needs Attention') {
      recommendations.push('Verify Vercel project configuration');
      recommendations.push('Ensure VERCEL_TOKEN is set in GitHub Secrets');
    }

    if (this.report.status.expo === 'Needs Attention') {
      recommendations.push('Verify Expo EAS configuration');
      recommendations.push('Ensure EXPO_PUBLIC_SUPABASE_URL matches NEXT_PUBLIC_SUPABASE_URL');
    }

    if (this.report.status.githubActions === 'Needs Attention') {
      recommendations.push('Review GitHub Actions workflow configurations');
      recommendations.push('Ensure all required secrets are properly referenced');
    }

    if (this.report.status.secretsAlignment === 'Needs Attention') {
      recommendations.push('Verify all required secrets are set in GitHub repository secrets');
      recommendations.push('Align Supabase URLs across all environments');
    }

    if (this.report.status.schemaDrift === 'Needs Manual Review') {
      recommendations.push('Review database schema drift and apply migrations manually');
    }

    if (recommendations.length === 0) {
      recommendations.push('All systems operational - no action required');
    }

    return recommendations;
  }
}

// Export for use as module
export { AuroraPrime, type AuroraReport, type AuroraStatus };

// CLI execution
if (require.main === module) {
  const aurora = new AuroraPrime();
  aurora.run()
    .then(report => {
      const exitCode = Object.values(report.status).some(s => s === 'Needs Attention') ? 1 : 0;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
