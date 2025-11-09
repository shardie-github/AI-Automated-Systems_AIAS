/**
 * Dashboard Generator
 * Generates /admin/reliability.json and /admin/reliability.md
 * Aggregates data from all modules
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { ModuleResult } from '../orchestrator';

interface ReliabilityDashboard {
  timestamp: string;
  uptime: {
    current: number;
    target: number;
    status: 'healthy' | 'degraded' | 'critical';
    trend: 'improving' | 'degrading' | 'stable';
  };
  performance: {
    latency_p95: number;
    error_rate: number;
    throughput: number;
  };
  dependencies: {
    outdated: number;
    vulnerabilities: number;
    critical_vulnerabilities: number;
  };
  cost: {
    current_monthly: number;
    projected_monthly: number;
    budget: number;
    status: 'within_budget' | 'over_budget';
  };
  security: {
    secrets_exposed: number;
    rls_enabled: boolean;
    tls_enforced: boolean;
    compliance_score: number;
  };
  trends: {
    last_7_days: {
      uptime: number[];
      latency: number[];
      cost: number[];
    };
  };
  recommendations: string[];
}

export class DashboardGenerator {
  constructor(
    private supabase: any,
    private config: any
  ) {}

  async generate(): Promise<ModuleResult> {
    try {
      const dashboard = await this.buildDashboard();
      
      // Generate JSON dashboard
      await this.generateJSONDashboard(dashboard);
      
      // Generate Markdown dashboard
      await this.generateMarkdownDashboard(dashboard);

      const artifacts = [
        join(process.cwd(), 'app', 'admin', 'reliability.json'),
        join(process.cwd(), 'app', 'admin', 'reliability.md')
      ];

      return {
        status: 'success',
        message: 'Dashboards generated successfully',
        data: { dashboard, artifacts }
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: `Dashboard generation failed: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  private async buildDashboard(): Promise<ReliabilityDashboard> {
    // Aggregate data from all sources
    const [uptimeData, performanceData, dependencyData, costData, securityData, trends] = await Promise.all([
      this.getUptimeData(),
      this.getPerformanceData(),
      this.getDependencyData(),
      this.getCostData(),
      this.getSecurityData(),
      this.getTrends()
    ]);

    return {
      timestamp: new Date().toISOString(),
      uptime: uptimeData,
      performance: performanceData,
      dependencies: dependencyData,
      cost: costData,
      security: securityData,
      trends,
      recommendations: []
    };
  }

  private async getUptimeData(): Promise<ReliabilityDashboard['uptime']> {
    try {
      const { data } = await this.supabase
        .from('metrics_log')
        .select('metric')
        .eq('source', 'orchestrator')
        .order('ts', { ascending: false })
        .limit(1);

      const current = data?.[0]?.metric?.uptime_percent || 100;
      const target = this.config.reliabilityThreshold || 99.9;

      let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (current < target - 0.5) status = 'critical';
      else if (current < target) status = 'degraded';

      // Determine trend
      const { data: historical } = await this.supabase
        .from('metrics_log')
        .select('metric')
        .eq('source', 'orchestrator')
        .order('ts', { ascending: false })
        .limit(7);

      const trend = this.calculateTrend(historical?.map((h: any) => h.metric?.uptime_percent) || []);

      return {
        current,
        target,
        status,
        trend
      };
    } catch (error) {
      return {
        current: 100,
        target: 99.9,
        status: 'healthy',
        trend: 'stable'
      };
    }
  }

  private async getPerformanceData(): Promise<ReliabilityDashboard['performance']> {
    try {
      const { data } = await this.supabase
        .from('metrics_log')
        .select('metric')
        .order('ts', { ascending: false })
        .limit(100);

      const latencies = data?.map((d: any) => d.metric?.latency || d.metric?.response_time).filter(Boolean) || [];
      const errors = data?.filter((d: any) => d.metric?.error).length || 0;

      const sortedLatencies = latencies.sort((a: number, b: number) => a - b);
      const p95Index = Math.ceil(sortedLatencies.length * 0.95) - 1;
      const latency_p95 = sortedLatencies[p95Index] || 0;

      return {
        latency_p95,
        error_rate: (errors / (data?.length || 1)) * 100,
        throughput: data?.length || 0
      };
    } catch (error) {
      return {
        latency_p95: 0,
        error_rate: 0,
        throughput: 0
      };
    }
  }

  private async getDependencyData(): Promise<ReliabilityDashboard['dependencies']> {
    try {
      const { data } = await this.supabase
        .from('dependency_reports')
        .select('report')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const report = data?.report || {};
      return {
        outdated: report.outdated?.length || 0,
        vulnerabilities: report.vulnerabilities?.length || 0,
        critical_vulnerabilities: report.vulnerabilities?.filter((v: any) => v.severity === 'critical').length || 0
      };
    } catch (error) {
      return {
        outdated: 0,
        vulnerabilities: 0,
        critical_vulnerabilities: 0
      };
    }
  }

  private async getCostData(): Promise<ReliabilityDashboard['cost']> {
    try {
      const { data } = await this.supabase
        .from('cost_forecasts')
        .select('forecast')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const forecast = data?.forecast || {};
      const budget = this.config.budget || 75;

      return {
        current_monthly: forecast.current_monthly || 0,
        projected_monthly: forecast.projected_monthly || 0,
        budget,
        status: (forecast.projected_monthly || 0) > budget ? 'over_budget' : 'within_budget'
      };
    } catch (error) {
      return {
        current_monthly: 0,
        projected_monthly: 0,
        budget: this.config.budget || 75,
        status: 'within_budget'
      };
    }
  }

  private async getSecurityData(): Promise<ReliabilityDashboard['security']> {
    try {
      const { data } = await this.supabase
        .from('security_audits')
        .select('audit')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const audit = data?.audit || {};
      const issues = audit.issues || [];
      const complianceScore = issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 10));

      return {
        secrets_exposed: audit.secrets?.exposed || 0,
        rls_enabled: audit.rls?.status === 'enabled',
        tls_enforced: audit.tls?.status === 'enforced',
        compliance_score: complianceScore
      };
    } catch (error) {
      return {
        secrets_exposed: 0,
        rls_enabled: false,
        tls_enforced: false,
        compliance_score: 0
      };
    }
  }

  private async getTrends(): Promise<ReliabilityDashboard['trends']> {
    try {
      const { data } = await this.supabase
        .from('metrics_log')
        .select('metric, ts')
        .gte('ts', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('ts', { ascending: true });

      const uptime: number[] = [];
      const latency: number[] = [];
      const cost: number[] = [];

      data?.forEach((d: any) => {
        if (d.metric?.uptime_percent) uptime.push(d.metric.uptime_percent);
        if (d.metric?.latency) latency.push(d.metric.latency);
        if (d.metric?.cost) cost.push(d.metric.cost);
      });

      return {
        last_7_days: {
          uptime: uptime.slice(-7),
          latency: latency.slice(-7),
          cost: cost.slice(-7)
        }
      };
    } catch (error) {
      return {
        last_7_days: {
          uptime: [],
          latency: [],
          cost: []
        }
      };
    }
  }

  private calculateTrend(values: number[]): 'improving' | 'degrading' | 'stable' {
    if (values.length < 2) return 'stable';

    const first = values[0];
    const last = values[values.length - 1];
    const diff = last - first;

    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'degrading';
    return 'stable';
  }

  private async generateJSONDashboard(dashboard: ReliabilityDashboard): Promise<void> {
    const adminDir = join(process.cwd(), 'app', 'admin');
    if (!existsSync(adminDir)) {
      mkdirSync(adminDir, { recursive: true });
    }

    writeFileSync(
      join(adminDir, 'reliability.json'),
      JSON.stringify(dashboard, null, 2)
    );
  }

  private async generateMarkdownDashboard(dashboard: ReliabilityDashboard): Promise<void> {
    const adminDir = join(process.cwd(), 'app', 'admin');
    if (!existsSync(adminDir)) {
      mkdirSync(adminDir, { recursive: true });
    }

    const markdown = `# Reliability Dashboard

**Generated:** ${dashboard.timestamp}

## Uptime

- **Current:** ${dashboard.uptime.current.toFixed(2)}%
- **Target:** ${dashboard.uptime.target}%
- **Status:** ${dashboard.uptime.status.toUpperCase()}
- **Trend:** ${dashboard.uptime.trend}

## Performance

- **P95 Latency:** ${dashboard.performance.latency_p95.toFixed(0)}ms
- **Error Rate:** ${dashboard.performance.error_rate.toFixed(2)}%
- **Throughput:** ${dashboard.performance.throughput} req/min

## Dependencies

- **Outdated:** ${dashboard.dependencies.outdated}
- **Vulnerabilities:** ${dashboard.dependencies.vulnerabilities}
- **Critical:** ${dashboard.dependencies.critical_vulnerabilities}

## Cost

- **Current Monthly:** $${dashboard.cost.current_monthly.toFixed(2)}
- **Projected Monthly:** $${dashboard.cost.projected_monthly.toFixed(2)}
- **Budget:** $${dashboard.cost.budget}
- **Status:** ${dashboard.cost.status === 'over_budget' ? '⚠️ OVER BUDGET' : '✅ Within Budget'}

## Security

- **Secrets Exposed:** ${dashboard.security.secrets_exposed}
- **RLS Enabled:** ${dashboard.security.rls_enabled ? '✅' : '❌'}
- **TLS Enforced:** ${dashboard.security.tls_enforced ? '✅' : '❌'}
- **Compliance Score:** ${dashboard.security.compliance_score}/100

## Trends (Last 7 Days)

### Uptime
${dashboard.trends.last_7_days.uptime.length > 0 
  ? dashboard.trends.last_7_days.uptime.map((v, i) => `- Day ${i + 1}: ${v.toFixed(2)}%`).join('\n')
  : 'No data available'
}

### Latency
${dashboard.trends.last_7_days.latency.length > 0
  ? dashboard.trends.last_7_days.latency.map((v, i) => `- Day ${i + 1}: ${v.toFixed(0)}ms`).join('\n')
  : 'No data available'
}

### Cost
${dashboard.trends.last_7_days.cost.length > 0
  ? dashboard.trends.last_7_days.cost.map((v, i) => `- Day ${i + 1}: $${v.toFixed(2)}`).join('\n')
  : 'No data available'
}

---
*Auto-generated by Orchestrator*
`;

    writeFileSync(
      join(adminDir, 'reliability.md'),
      markdown
    );
  }
}
