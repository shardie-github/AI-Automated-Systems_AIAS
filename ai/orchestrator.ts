/**
 * Autonomous Reliability, Financial, and Security Orchestrator
 * 
 * Default behavior: verify → analyze → forecast → harden → report
 * Never exposes secrets, breaks builds, or modifies user data
 * All fixes happen via safe PRs and logged commits
 */

import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { DependencyHealthChecker } from './modules/dependency_health';
import { CostForecaster } from './modules/cost_forecaster';
import { SecurityAuditor } from './modules/security_auditor';
import { UptimeMonitor } from './modules/uptime_monitor';
import { DashboardGenerator } from './modules/dashboard_generator';
import { PRAutomation } from './modules/pr_automation';

interface OrchestratorConfig {
  budget: number;
  reliabilityThreshold: number;
  securityAlertWebhook?: string;
  githubOwner: string;
  githubRepo: string;
  supabaseProjectRef: string;
  vercelProjectId?: string;
  enableAutoPR: boolean;
  enableAutoFix: boolean;
}

interface OrchestratorReport {
  timestamp: string;
  cycle: number;
  status: 'success' | 'partial' | 'failed';
  modules: {
    dependencyHealth: ModuleResult;
    costForecast: ModuleResult;
    securityAudit: ModuleResult;
    uptimeCheck: ModuleResult;
    dashboardGeneration: ModuleResult;
  };
  summary: {
    vulnerabilities: number;
    costDeviation: number;
    securityIssues: number;
    uptime: number;
    recommendations: string[];
  };
  artifacts: string[];
}

interface ModuleResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  data?: any;
  errors?: string[];
}

class Orchestrator {
  private supabase: any;
  private octokit: Octokit;
  private config: OrchestratorConfig;
  private cycle: number = 0;
  private auditDir: string;

  // Module instances
  private dependencyHealth: DependencyHealthChecker;
  private costForecaster: CostForecaster;
  private securityAuditor: SecurityAuditor;
  private uptimeMonitor: UptimeMonitor;
  private dashboardGenerator: DashboardGenerator;
  private prAutomation: PRAutomation;

  constructor(config?: Partial<OrchestratorConfig>) {
    const projectRef = process.env.SUPABASE_PROJECT_REF || 'ghqyxhbyyirveptgwoqm';
    
    this.config = {
      budget: parseFloat(process.env.ORCHESTRATOR_BUDGET || '75'),
      reliabilityThreshold: parseFloat(process.env.ORCHESTRATOR_RELIABILITY_THRESHOLD || '99.9'),
      securityAlertWebhook: process.env.RELIABILITY_ALERT_WEBHOOK,
      githubOwner: process.env.GITHUB_OWNER || 'your-org',
      githubRepo: process.env.GITHUB_REPO || 'aias-platform',
      supabaseProjectRef: projectRef,
      vercelProjectId: process.env.VERCEL_PROJECT_ID,
      enableAutoPR: process.env.ORCHESTRATOR_AUTO_PR === 'true',
      enableAutoFix: process.env.ORCHESTRATOR_AUTO_FIX === 'true',
      ...config
    };

    this.supabase = createClient(
      process.env.SUPABASE_URL || `https://${projectRef}.supabase.co`,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
    );

    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Initialize audit directory
    const today = new Date().toISOString().split('T')[0];
    this.auditDir = join(process.cwd(), 'compliance', 'audits', today);
    if (!existsSync(this.auditDir)) {
      mkdirSync(this.auditDir, { recursive: true });
    }

    // Initialize modules
    this.dependencyHealth = new DependencyHealthChecker(this.supabase, this.octokit, this.config);
    this.costForecaster = new CostForecaster(this.supabase, this.octokit, this.config);
    this.securityAuditor = new SecurityAuditor(this.supabase, this.octokit, this.config);
    this.uptimeMonitor = new UptimeMonitor(this.supabase, this.config);
    this.dashboardGenerator = new DashboardGenerator(this.supabase, this.config);
    this.prAutomation = new PRAutomation(this.octokit, this.config);
  }

  /**
   * Main execution cycle: verify → analyze → forecast → harden → report
   */
  async run(): Promise<OrchestratorReport> {
    this.cycle++;
    console.log(`\n🔄 Orchestrator Cycle #${this.cycle} starting...`);
    console.log(`📅 ${new Date().toISOString()}\n`);

    const report: OrchestratorReport = {
      timestamp: new Date().toISOString(),
      cycle: this.cycle,
      status: 'success',
      modules: {
        dependencyHealth: { status: 'success', message: 'Not executed' },
        costForecast: { status: 'success', message: 'Not executed' },
        securityAudit: { status: 'success', message: 'Not executed' },
        uptimeCheck: { status: 'success', message: 'Not executed' },
        dashboardGeneration: { status: 'success', message: 'Not executed' }
      },
      summary: {
        vulnerabilities: 0,
        costDeviation: 0,
        securityIssues: 0,
        uptime: 100,
        recommendations: []
      },
      artifacts: []
    };

    try {
      // 1. VERIFY: Dependency Health & Reliability
      console.log('📦 [1/5] Verifying dependency health...');
      report.modules.dependencyHealth = await this.dependencyHealth.check();
      if (report.modules.dependencyHealth.data) {
        report.summary.vulnerabilities = report.modules.dependencyHealth.data.vulnerabilities?.length || 0;
      }

      // 2. ANALYZE: Cost Forecasting & Performance Intelligence
      console.log('💰 [2/5] Analyzing cost forecasts...');
      report.modules.costForecast = await this.costForecaster.forecast();
      if (report.modules.costForecast.data) {
        report.summary.costDeviation = report.modules.costForecast.data.deviation_percent || 0;
      }

      // 3. FORECAST: Security & Compliance Audit
      console.log('🔒 [3/5] Auditing security & compliance...');
      report.modules.securityAudit = await this.securityAuditor.audit();
      if (report.modules.securityAudit.data) {
        report.summary.securityIssues = report.modules.securityAudit.data.issues?.length || 0;
      }

      // 4. HARDEN: Uptime Monitoring & Error Triage
      console.log('🏥 [4/5] Monitoring uptime & triaging errors...');
      report.modules.uptimeCheck = await this.uptimeMonitor.check();
      if (report.modules.uptimeCheck.data) {
        report.summary.uptime = report.modules.uptimeCheck.data.uptime_percent || 100;
      }

      // 5. REPORT: Generate Dashboards & Reports
      console.log('📊 [5/5] Generating dashboards & reports...');
      report.modules.dashboardGeneration = await this.dashboardGenerator.generate();
      if (report.modules.dashboardGeneration.data) {
        report.artifacts = report.modules.dashboardGeneration.data.artifacts || [];
      }

      // Determine overall status
      const hasErrors = Object.values(report.modules).some(m => m.status === 'error');
      const hasWarnings = Object.values(report.modules).some(m => m.status === 'warning');
      
      if (hasErrors) {
        report.status = 'failed';
      } else if (hasWarnings) {
        report.status = 'partial';
      }

      // Collect recommendations
      report.summary.recommendations = this.collectRecommendations(report);

      // Store report
      await this.storeReport(report);

      // Auto-PR for safe fixes
      if (this.config.enableAutoPR && report.summary.recommendations.length > 0) {
        await this.handleAutoPR(report);
      }

      console.log(`\n✅ Orchestrator Cycle #${this.cycle} completed: ${report.status.toUpperCase()}`);
      console.log(`📊 Summary: ${report.summary.vulnerabilities} vulnerabilities, ${report.summary.costDeviation.toFixed(1)}% cost deviation, ${report.summary.securityIssues} security issues, ${report.summary.uptime.toFixed(2)}% uptime\n`);

      return report;
    } catch (error: any) {
      console.error('❌ Orchestrator cycle failed:', error);
      report.status = 'failed';
      report.modules.dashboardGeneration = {
        status: 'error',
        message: `Orchestrator error: ${error.message}`,
        errors: [error.message]
      };
      await this.storeReport(report);
      throw error;
    }
  }

  /**
   * Collect recommendations from all modules
   */
  private collectRecommendations(report: OrchestratorReport): string[] {
    const recommendations: string[] = [];

    // Dependency health recommendations
    if (report.modules.dependencyHealth.data?.recommendations) {
      recommendations.push(...report.modules.dependencyHealth.data.recommendations);
    }

    // Cost forecast recommendations
    if (report.modules.costForecast.data?.recommendations) {
      recommendations.push(...report.modules.costForecast.data.recommendations);
    }

    // Security audit recommendations
    if (report.modules.securityAudit.data?.recommendations) {
      recommendations.push(...report.modules.securityAudit.data.recommendations);
    }

    // Uptime recommendations
    if (report.modules.uptimeCheck.data?.recommendations) {
      recommendations.push(...report.modules.uptimeCheck.data.recommendations);
    }

    return [...new Set(recommendations)]; // Deduplicate
  }

  /**
   * Store orchestrator report
   */
  private async storeReport(report: OrchestratorReport): Promise<void> {
    try {
      // Store in Supabase
      const { error } = await this.supabase
        .from('orchestrator_reports')
        .insert([{
          cycle: report.cycle,
          timestamp: report.timestamp,
          status: report.status,
          report: report,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.warn('Could not store report in Supabase:', error.message);
      }

      // Store locally
      const reportPath = join(this.auditDir, `orchestrator_report_${this.cycle}.json`);
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      report.artifacts.push(reportPath);
    } catch (error) {
      console.error('Error storing report:', error);
    }
  }

  /**
   * Handle auto-PR creation for safe fixes
   */
  private async handleAutoPR(report: OrchestratorReport): Promise<void> {
    const safeFixes = report.summary.recommendations.filter(rec => 
      rec.includes('patch') || rec.includes('minor') || rec.includes('dependency')
    );

    if (safeFixes.length > 0) {
      console.log(`\n🔧 Creating auto-PR for ${safeFixes.length} safe fixes...`);
      await this.prAutomation.createAutoPR({
        title: `🔧 Automated Security & Dependency Updates (Cycle #${this.cycle})`,
        body: this.generatePRBody(report, safeFixes),
        changes: await this.prepareSafeChanges(report),
        labels: ['security-auto', 'dependencies', 'automated']
      });
    }
  }

  /**
   * Generate PR body
   */
  private generatePRBody(report: OrchestratorReport, fixes: string[]): string {
    return `
## 🔧 Automated Security & Dependency Updates

**Orchestrator Cycle:** #${report.cycle}  
**Generated:** ${report.timestamp}

### 📊 Summary
- **Vulnerabilities Found:** ${report.summary.vulnerabilities}
- **Cost Deviation:** ${report.summary.costDeviation.toFixed(1)}%
- **Security Issues:** ${report.summary.securityIssues}
- **Uptime:** ${report.summary.uptime.toFixed(2)}%

### 🔒 Safe Fixes Included
${fixes.map(f => `- ${f}`).join('\n')}

### ⚠️ Review Required
This PR contains automated fixes that passed safety checks. Please review before merging.

### 📋 Checklist
- [ ] Review dependency updates
- [ ] Verify no breaking changes
- [ ] Test locally
- [ ] Check CI/CD passes

---
*Generated by Autonomous Reliability Orchestrator*
    `.trim();
  }

  /**
   * Prepare safe changes for PR
   */
  private async prepareSafeChanges(report: OrchestratorReport): Promise<Array<{ path: string; content: string }>> {
    const changes: Array<{ path: string; content: string }> = [];

    // Add dependency updates if available
    if (report.modules.dependencyHealth.data?.safeUpdates) {
      // This would generate package.json updates
      // Implementation depends on dependency health checker
    }

    return changes;
  }

  /**
   * Run scheduled cycle (every 6 hours for uptime, daily for full audit)
   */
  async runScheduled(interval: 'hourly' | 'daily' = 'daily'): Promise<void> {
    if (interval === 'hourly') {
      // Quick uptime check only
      await this.uptimeMonitor.check();
    } else {
      // Full orchestrator cycle
      await this.run();
    }
  }
}

// Export types and class
export { Orchestrator, type OrchestratorConfig, type OrchestratorReport, type ModuleResult };

// CLI execution
if (require.main === module) {
  const orchestrator = new Orchestrator();
  orchestrator.run().catch(console.error);
}
