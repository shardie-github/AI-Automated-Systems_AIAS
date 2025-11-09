/**
 * Uptime Monitor & Error Triage
 * Pings /api/health every 6 hours
 * Records latency in Supabase metrics_log
 * Creates issues for downtime > 2 minutes
 */

import type { ModuleResult } from '../orchestrator';

interface UptimeCheck {
  timestamp: string;
  endpoints: Array<{
    url: string;
    status: 'up' | 'down' | 'degraded';
    latency_ms: number;
    status_code?: number;
    error?: string;
  }>;
  uptime_percent: number;
  downtime_minutes: number;
  recommendations: string[];
}

interface ErrorPattern {
  error: string;
  count: number;
  first_seen: string;
  last_seen: string;
  occurrences: Array<{
    timestamp: string;
    deployment_id: string;
    context: any;
  }>;
}

export class UptimeMonitor {
  private healthEndpoints = [
    '/api/health',
    '/api/healthz',
    '/api/metrics'
  ];

  private supabaseFunctions = [
    // Add Supabase function endpoints to monitor
  ];

  constructor(
    private supabase: any,
    private config: any
  ) {}

  async check(): Promise<ModuleResult> {
    try {
      const check: UptimeCheck = {
        timestamp: new Date().toISOString(),
        endpoints: [],
        uptime_percent: 100,
        downtime_minutes: 0,
        recommendations: []
      };

      // Check all health endpoints
      for (const endpoint of this.healthEndpoints) {
        const result = await this.checkEndpoint(endpoint);
        check.endpoints.push(result);
      }

      // Check Supabase functions
      for (const func of this.supabaseFunctions) {
        const result = await this.checkSupabaseFunction(func);
        check.endpoints.push(result);
      }

      // Calculate uptime
      check.uptime_percent = this.calculateUptime(check.endpoints);
      check.downtime_minutes = this.calculateDowntime(check.endpoints);

      // Analyze error patterns
      const errorPatterns = await this.analyzeErrorPatterns();

      // Generate recommendations
      check.recommendations = this.generateRecommendations(check, errorPatterns);

      // Store metrics
      await this.storeMetrics(check);

      // Alert on downtime
      if (check.downtime_minutes > 2) {
        await this.alertDowntime(check);
      }

      // Create issues for recurring errors
      await this.triageErrors(errorPatterns);

      const status = check.uptime_percent < 99.9 ? 'warning' : 'success';

      return {
        status,
        message: `Uptime: ${check.uptime_percent.toFixed(2)}%, ${check.endpoints.filter(e => e.status === 'down').length} endpoints down`,
        data: check
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: `Uptime check failed: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  private async checkEndpoint(endpoint: string): Promise<UptimeCheck['endpoints'][0]> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const url = `${baseUrl}${endpoint}`;
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Orchestrator-UptimeMonitor/1.0'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const latency = Date.now() - startTime;
      const status = response.ok ? 'up' : response.status >= 500 ? 'down' : 'degraded';

      return {
        url: endpoint,
        status,
        latency_ms: latency,
        status_code: response.status
      };
    } catch (error: any) {
      const latency = Date.now() - startTime;
      return {
        url: endpoint,
        status: 'down',
        latency_ms: latency,
        error: error.message
      };
    }
  }

  private async checkSupabaseFunction(functionName: string): Promise<UptimeCheck['endpoints'][0]> {
    // Placeholder - would invoke Supabase function
    return {
      url: `supabase:${functionName}`,
      status: 'up',
      latency_ms: 0
    };
  }

  private calculateUptime(endpoints: UptimeCheck['endpoints']): number {
    if (endpoints.length === 0) return 100;

    const upCount = endpoints.filter(e => e.status === 'up').length;
    return (upCount / endpoints.length) * 100;
  }

  private calculateDowntime(endpoints: UptimeCheck['endpoints']): number {
    // Simplified - would track historical downtime
    const downCount = endpoints.filter(e => e.status === 'down').length;
    return downCount * 2; // Assume 2 minutes per down endpoint
  }

  private async analyzeErrorPatterns(): Promise<ErrorPattern[]> {
    try {
      // Query recent errors from logs
      const { data: errors } = await this.supabase
        .from('logs')
        .select('*')
        .eq('level', 'error')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (!errors || errors.length === 0) {
        return [];
      }

      // Group errors by message
      const patterns = new Map<string, ErrorPattern>();

      errors.forEach((error: any) => {
        const message = error.message || error.error || 'Unknown error';
        const key = this.normalizeError(message);

        if (!patterns.has(key)) {
          patterns.set(key, {
            error: message,
            count: 0,
            first_seen: error.created_at,
            last_seen: error.created_at,
            occurrences: []
          });
        }

        const pattern = patterns.get(key)!;
        pattern.count++;
        if (new Date(error.created_at) < new Date(pattern.first_seen)) {
          pattern.first_seen = error.created_at;
        }
        if (new Date(error.created_at) > new Date(pattern.last_seen)) {
          pattern.last_seen = error.created_at;
        }
        pattern.occurrences.push({
          timestamp: error.created_at,
          deployment_id: error.deployment_id || 'unknown',
          context: error.context || {}
        });
      });

      return Array.from(patterns.values()).filter(p => p.count >= 3); // Only recurring errors
    } catch (error) {
      console.warn('Could not analyze error patterns:', error);
      return [];
    }
  }

  private normalizeError(error: string): string {
    // Normalize error messages to group similar errors
    return error
      .replace(/\d+/g, 'N')
      .replace(/['"]/g, '')
      .substring(0, 100)
      .toLowerCase()
      .trim();
  }

  private generateRecommendations(check: UptimeCheck, errorPatterns: ErrorPattern[]): string[] {
    const recommendations: string[] = [];

    if (check.uptime_percent < 99.9) {
      recommendations.push(`⚠️ Uptime below target (${check.uptime_percent.toFixed(2)}% < 99.9%)`);
    }

    const slowEndpoints = check.endpoints.filter(e => e.latency_ms > 2000);
    if (slowEndpoints.length > 0) {
      recommendations.push(`🐌 ${slowEndpoints.length} endpoints have latency > 2s`);
    }

    if (errorPatterns.length > 0) {
      recommendations.push(`🚨 ${errorPatterns.length} recurring error patterns detected`);
    }

    return recommendations;
  }

  private async storeMetrics(check: UptimeCheck): Promise<void> {
    try {
      // Store in metrics_log
      await this.supabase
        .from('metrics_log')
        .insert([{
          source: 'orchestrator',
          metric: {
            uptime_percent: check.uptime_percent,
            endpoints_checked: check.endpoints.length,
            endpoints_down: check.endpoints.filter(e => e.status === 'down').length,
            avg_latency: check.endpoints.reduce((sum, e) => sum + e.latency_ms, 0) / check.endpoints.length
          },
          ts: new Date().toISOString()
        }]);
    } catch (error) {
      console.warn('Could not store uptime metrics:', error);
    }
  }

  private async alertDowntime(check: UptimeCheck): Promise<void> {
    if (!this.config.securityAlertWebhook) {
      return;
    }

    try {
      const downEndpoints = check.endpoints.filter(e => e.status === 'down');
      
      await fetch(this.config.securityAlertWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Downtime Alert: ${downEndpoints.length} endpoints down for > 2 minutes`,
          endpoints: downEndpoints.map(e => e.url),
          downtime_minutes: check.downtime_minutes
        })
      });
    } catch (error) {
      console.warn('Could not send downtime alert:', error);
    }
  }

  private async triageErrors(errorPatterns: ErrorPattern[]): Promise<void> {
    // Create GitHub issues for recurring errors (> 3 occurrences)
    const criticalPatterns = errorPatterns.filter(p => p.count > 3);

    if (criticalPatterns.length === 0) return;

    const { Octokit } = require('@octokit/rest');
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    for (const pattern of criticalPatterns) {
      try {
        // Check if issue already exists
        const { data: issues } = await octokit.rest.issues.listForRepo({
          owner: this.config.githubOwner,
          repo: this.config.githubRepo,
          state: 'open',
          labels: 'recurring-error'
        });

        const existingIssue = issues?.find(i => 
          i.title.includes(pattern.error.substring(0, 50))
        );

        if (!existingIssue) {
          await octokit.rest.issues.create({
            owner: this.config.githubOwner,
            repo: this.config.githubRepo,
            title: `🚨 Recurring Failure: ${pattern.error.substring(0, 100)}`,
            body: this.generateErrorIssueBody(pattern),
            labels: ['recurring-error', 'automated', 'high']
          });
        }
      } catch (error) {
        console.warn('Could not create error issue:', error);
      }
    }
  }

  private generateErrorIssueBody(pattern: ErrorPattern): string {
    return `
## Recurring Error Pattern Detected

**Error:** \`${pattern.error}\`
**Occurrences:** ${pattern.count}
**First Seen:** ${pattern.first_seen}
**Last Seen:** ${pattern.last_seen}

### Occurrences
${pattern.occurrences.slice(0, 10).map(occ => `
- **${occ.timestamp}** (Deployment: ${occ.deployment_id})
`).join('')}

### Next Steps
1. Investigate root cause
2. Implement fix or circuit breaker
3. Monitor for resolution

---
*Generated by Orchestrator Uptime Monitor*
    `.trim();
  }
}
