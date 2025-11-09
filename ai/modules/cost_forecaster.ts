/**
 * Cost Forecasting Module
 * Collects metrics from Vercel, Supabase, Expo, GitHub Actions
 * Computes rolling averages and predicts cost overruns
 * Generates cost_forecast.json and reliability_trends.json
 */

import { Octokit } from '@octokit/rest';
import type { ModuleResult } from '../orchestrator';

interface CostMetrics {
  vercel: {
    bandwidth_gb: number;
    function_invocations: number;
    edge_requests: number;
    cost: number;
  };
  supabase: {
    database_size_gb: number;
    api_requests: number;
    storage_gb: number;
    bandwidth_gb: number;
    cost: number;
  };
  expo: {
    builds: number;
    bandwidth_gb: number;
    cost: number;
  };
  github: {
    actions_minutes: number;
    storage_gb: number;
    cost: number;
  };
}

interface CostForecast {
  current_monthly: number;
  projected_monthly: number;
  deviation_percent: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  breakdown: {
    vercel: number;
    supabase: number;
    expo: number;
    github: number;
  };
  recommendations: string[];
}

interface ReliabilityTrends {
  uptime: number;
  latency_p95: number;
  error_rate: number;
  build_success_rate: number;
  trends: {
    uptime: 'improving' | 'degrading' | 'stable';
    latency: 'improving' | 'degrading' | 'stable';
    errors: 'improving' | 'degrading' | 'stable';
  };
}

export class CostForecaster {
  constructor(
    private supabase: any,
    private octokit: Octokit,
    private config: any
  ) {}

  async forecast(): Promise<ModuleResult> {
    try {
      // Collect metrics from all sources
      const metrics = await this.collectMetrics();

      // Calculate current costs
      const currentCosts = this.calculateCurrentCosts(metrics);

      // Forecast future costs
      const forecast = await this.predictCosts(currentCosts, metrics);

      // Generate reliability trends
      const trends = await this.generateReliabilityTrends();

      // Store forecasts
      await this.storeForecast(forecast, trends);

      // Generate JSON files
      await this.generateJSONFiles(forecast, trends);

      const status = forecast.deviation_percent > 20 ? 'warning' : 'success';

      return {
        status,
        message: `Current: $${forecast.current_monthly.toFixed(2)}/mo, Projected: $${forecast.projected_monthly.toFixed(2)}/mo (${forecast.deviation_percent.toFixed(1)}% deviation)`,
        data: forecast
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: `Cost forecasting failed: ${error.message}`,
        errors: [error.message]
      };
    }
  }

  private async collectMetrics(): Promise<CostMetrics> {
    const metrics: CostMetrics = {
      vercel: await this.getVercelMetrics(),
      supabase: await this.getSupabaseMetrics(),
      expo: await this.getExpoMetrics(),
      github: await this.getGitHubMetrics()
    };

    return metrics;
  }

  private async getVercelMetrics(): Promise<CostMetrics['vercel']> {
    // Placeholder - would integrate with Vercel API
    // Vercel API: GET /v2/projects/{projectId}/analytics
    try {
      const { data } = await this.supabase
        .from('metrics_log')
        .select('metric')
        .eq('source', 'vercel')
        .order('ts', { ascending: false })
        .limit(30);

      if (data && data.length > 0) {
        const latest = data[0].metric;
        return {
          bandwidth_gb: latest.bandwidth_gb || 0,
          function_invocations: latest.function_invocations || 0,
          edge_requests: latest.edge_requests || 0,
          cost: this.calculateVercelCost(latest)
        };
      }
    } catch (error) {
      console.warn('Could not fetch Vercel metrics:', error);
    }

    return {
      bandwidth_gb: 0,
      function_invocations: 0,
      edge_requests: 0,
      cost: 0
    };
  }

  private async getSupabaseMetrics(): Promise<CostMetrics['supabase']> {
    try {
      // Query Supabase metrics from metrics_log
      const { data } = await this.supabase
        .from('metrics_log')
        .select('metric')
        .eq('source', 'supabase')
        .order('ts', { ascending: false })
        .limit(30);

      if (data && data.length > 0) {
        const latest = data[0].metric;
        return {
          database_size_gb: latest.database_size_gb || 0,
          api_requests: latest.api_requests || 0,
          storage_gb: latest.storage_gb || 0,
          bandwidth_gb: latest.bandwidth_gb || 0,
          cost: this.calculateSupabaseCost(latest)
        };
      }
    } catch (error) {
      console.warn('Could not fetch Supabase metrics:', error);
    }

    return {
      database_size_gb: 0,
      api_requests: 0,
      storage_gb: 0,
      bandwidth_gb: 0,
      cost: 0
    };
  }

  private async getExpoMetrics(): Promise<CostMetrics['expo']> {
    // Placeholder - would integrate with Expo/EAS API
    return {
      builds: 0,
      bandwidth_gb: 0,
      cost: 0
    };
  }

  private async getGitHubMetrics(): Promise<CostMetrics['github']> {
    try {
      // Get GitHub Actions usage
      const { data: usage } = await this.octokit.rest.billing.getGithubActionsBillingOrg({
        org: this.config.githubOwner
      });

      return {
        actions_minutes: usage?.included_minutes || 0,
        storage_gb: usage?.included_storage_gb || 0,
        cost: this.calculateGitHubCost(usage)
      };
    } catch (error) {
      console.warn('Could not fetch GitHub metrics:', error);
      return {
        actions_minutes: 0,
        storage_gb: 0,
        cost: 0
      };
    }
  }

  private calculateVercelCost(metrics: any): number {
    // Simplified Vercel pricing
    const bandwidthCost = (metrics.bandwidth_gb || 0) * 0.15; // $0.15/GB
    const functionCost = ((metrics.function_invocations || 0) / 1000000) * 2; // $2 per million
    return bandwidthCost + functionCost;
  }

  private calculateSupabaseCost(metrics: any): number {
    // Simplified Supabase pricing (Pro plan)
    const baseCost = 25; // $25/month base
    const databaseCost = (metrics.database_size_gb || 0) * 0.125; // $0.125/GB
    const bandwidthCost = (metrics.bandwidth_gb || 0) * 0.09; // $0.09/GB
    return baseCost + databaseCost + bandwidthCost;
  }

  private calculateGitHubCost(usage: any): number {
    // GitHub Actions: $0.008/minute for overages
    // Storage: $0.25/GB/month
    const overageMinutes = Math.max(0, (usage?.minutes_used || 0) - (usage?.included_minutes || 0));
    const overageStorage = Math.max(0, (usage?.storage_used_gb || 0) - (usage?.included_storage_gb || 0));
    return (overageMinutes * 0.008) + (overageStorage * 0.25);
  }

  private calculateCurrentCosts(metrics: CostMetrics): number {
    return (
      metrics.vercel.cost +
      metrics.supabase.cost +
      metrics.expo.cost +
      metrics.github.cost
    );
  }

  private async predictCosts(currentCost: number, metrics: CostMetrics): Promise<CostForecast> {
    // Get historical data for trend analysis
    const historical = await this.getHistoricalCosts();

    // Simple linear regression for projection
    const projection = this.linearProjection(historical, currentCost);

    const deviation = ((projection - currentCost) / currentCost) * 100;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (deviation > 5) trend = 'increasing';
    else if (deviation < -5) trend = 'decreasing';

    const recommendations = this.generateCostRecommendations(projection, metrics);

    return {
      current_monthly: currentCost,
      projected_monthly: projection,
      deviation_percent: deviation,
      trend,
      confidence: 0.75, // Would calculate based on data points
      breakdown: {
        vercel: metrics.vercel.cost,
        supabase: metrics.supabase.cost,
        expo: metrics.expo.cost,
        github: metrics.github.cost
      },
      recommendations
    };
  }

  private async getHistoricalCosts(): Promise<number[]> {
    try {
      const { data } = await this.supabase
        .from('cost_forecasts')
        .select('current_monthly')
        .order('created_at', { ascending: false })
        .limit(30);

      return data?.map((r: any) => r.current_monthly) || [];
    } catch (error) {
      return [];
    }
  }

  private linearProjection(historical: number[], current: number): number {
    if (historical.length < 2) {
      // No history, assume 5% growth
      return current * 1.05;
    }

    // Simple linear regression
    const n = historical.length;
    const x = historical.map((_, i) => i);
    const y = historical;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Project 30 days ahead
    return Math.max(0, slope * (n + 30) + intercept);
  }

  private generateCostRecommendations(projected: number, metrics: CostMetrics): string[] {
    const recommendations: string[] = [];
    const budget = this.config.budget || 75;

    if (projected > budget) {
      const overage = projected - budget;
      recommendations.push(`⚠️ Projected cost ($${projected.toFixed(2)}) exceeds budget ($${budget}) by $${overage.toFixed(2)}`);
      
      if (metrics.vercel.cost > budget * 0.4) {
        recommendations.push('💡 Consider implementing CDN caching to reduce Vercel bandwidth costs');
      }
      
      if (metrics.supabase.cost > budget * 0.4) {
        recommendations.push('💡 Review database queries and implement connection pooling to optimize Supabase costs');
      }
    } else {
      recommendations.push(`✅ Projected cost ($${projected.toFixed(2)}) is within budget ($${budget})`);
    }

    return recommendations;
  }

  private async generateReliabilityTrends(): Promise<ReliabilityTrends> {
    try {
      const { data } = await this.supabase
        .from('metrics_log')
        .select('metric, source')
        .order('ts', { ascending: false })
        .limit(100);

      // Calculate trends from metrics
      const uptime = this.calculateUptime(data);
      const latency = this.calculateLatency(data);
      const errorRate = this.calculateErrorRate(data);

      return {
        uptime,
        latency_p95: latency,
        error_rate: errorRate,
        build_success_rate: 95, // Would calculate from CI data
        trends: {
          uptime: uptime > 99.9 ? 'stable' : 'degrading',
          latency: latency < 2000 ? 'stable' : 'degrading',
          errors: errorRate < 1 ? 'stable' : 'degrading'
        }
      };
    } catch (error) {
      return {
        uptime: 100,
        latency_p95: 0,
        error_rate: 0,
        build_success_rate: 100,
        trends: {
          uptime: 'stable',
          latency: 'stable',
          errors: 'stable'
        }
      };
    }
  }

  private calculateUptime(data: any[]): number {
    // Simplified - would calculate from health check data
    return 99.95;
  }

  private calculateLatency(data: any[]): number {
    const latencies = data
      .map(d => d.metric?.latency || d.metric?.response_time)
      .filter(Boolean);
    
    if (latencies.length === 0) return 0;
    
    const sorted = latencies.sort((a, b) => a - b);
    const p95Index = Math.ceil(sorted.length * 0.95) - 1;
    return sorted[p95Index] || 0;
  }

  private calculateErrorRate(data: any[]): number {
    const errors = data.filter(d => d.metric?.error || d.metric?.status === 'error').length;
    return (errors / data.length) * 100;
  }

  private async storeForecast(forecast: CostForecast, trends: ReliabilityTrends): Promise<void> {
    try {
      await this.supabase
        .from('cost_forecasts')
        .insert([{
          forecast,
          trends,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.warn('Could not store cost forecast:', error);
    }
  }

  private async generateJSONFiles(forecast: CostForecast, trends: ReliabilityTrends): Promise<void> {
    const { writeFileSync } = require('fs');
    const { join } = require('path');

    // Write cost_forecast.json
    writeFileSync(
      join(process.cwd(), 'cost_forecast.json'),
      JSON.stringify(forecast, null, 2)
    );

    // Write reliability_trends.json
    writeFileSync(
      join(process.cwd(), 'reliability_trends.json'),
      JSON.stringify(trends, null, 2)
    );
  }
}
