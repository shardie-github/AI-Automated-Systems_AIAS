/**
 * Cost Optimization System
 * Track and optimize marketing and acquisition costs
 */

import { logger } from '@/lib/logging/structured-logger';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export interface CostEntry {
  source: string;
  campaign?: string;
  amount: number;
  currency: string;
  date: string;
  type: 'advertising' | 'content' | 'event' | 'tool' | 'other';
  metadata?: Record<string, unknown>;
}

export interface CostAnalysis {
  totalCost: number;
  totalLeads: number;
  costPerLead: number;
  totalConversions: number;
  costPerConversion: number;
  roi: number;
  roas: number;
  bySource: Record<string, CostMetrics>;
  byCampaign: Record<string, CostMetrics>;
  recommendations: string[];
}

export interface CostMetrics {
  cost: number;
  leads: number;
  conversions: number;
  costPerLead: number;
  costPerConversion: number;
  roi: number;
  roas: number;
}

class CostOptimizationService {
  private supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  /**
   * Record cost
   */
  async recordCost(cost: CostEntry, tenantId?: string): Promise<void> {
    try {
      await this.supabase.from('marketing_costs').insert({
        source: cost.source,
        campaign: cost.campaign,
        amount: cost.amount,
        currency: cost.currency,
        date: cost.date,
        type: cost.type,
        metadata: cost.metadata || {},
        tenant_id: tenantId,
        recorded_at: new Date().toISOString(),
      });

      logger.info('Cost recorded', {
        source: cost.source,
        campaign: cost.campaign,
        amount: cost.amount,
        tenantId,
      });
    } catch (error) {
      logger.error('Cost recording failed', error instanceof Error ? error : new Error(String(error)), {
        cost,
        tenantId,
      });
    }
  }

  /**
   * Analyze costs and performance
   */
  async analyzeCosts(
    startDate: Date,
    endDate: Date,
    tenantId?: string
  ): Promise<CostAnalysis> {
    // Get costs
    let costQuery = this.supabase
      .from('marketing_costs')
      .select('*')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

    if (tenantId) {
      costQuery = costQuery.eq('tenant_id', tenantId);
    }

    const { data: costs } = await costQuery;

    // Get leads
    let leadQuery = this.supabase
      .from('leads')
      .select('source, campaign, id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (tenantId) {
      leadQuery = leadQuery.eq('tenant_id', tenantId);
    }

    const { data: leads } = await leadQuery;

    // Get conversions
    let conversionQuery = this.supabase
      .from('conversions')
      .select('lead_id, value, attribution')
      .gte('converted_at', startDate.toISOString())
      .lte('converted_at', endDate.toISOString());

    if (tenantId) {
      conversionQuery = conversionQuery.eq('tenant_id', tenantId);
    }

    const { data: conversions } = await conversionQuery;

    // Calculate totals
    const totalCost = costs?.reduce((sum, c) => sum + c.amount, 0) || 0;
    const totalLeads = leads?.length || 0;
    const totalConversions = conversions?.length || 0;
    const totalRevenue = conversions?.reduce((sum, c) => sum + (c.value || 0), 0) || 0;

    const costPerLead = totalLeads > 0 ? totalCost / totalLeads : 0;
    const costPerConversion = totalConversions > 0 ? totalCost / totalConversions : 0;
    const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
    const roas = totalCost > 0 ? totalRevenue / totalCost : 0;

    // Calculate by source
    const bySource: Record<string, CostMetrics> = {};
    const sources = new Set(costs?.map(c => c.source) || []);
    
    for (const source of sources) {
      const sourceCosts = costs?.filter(c => c.source === source) || [];
      const sourceLeads = leads?.filter(l => l.source === source) || [];
      const sourceConversions = conversions?.filter(
        c => c.attribution?.source === source
      ) || [];
      const sourceRevenue = sourceConversions.reduce((sum, c) => sum + (c.value || 0), 0);
      const sourceCost = sourceCosts.reduce((sum, c) => sum + c.amount, 0);

      bySource[source] = {
        cost: sourceCost,
        leads: sourceLeads.length,
        conversions: sourceConversions.length,
        costPerLead: sourceLeads.length > 0 ? sourceCost / sourceLeads.length : 0,
        costPerConversion: sourceConversions.length > 0 ? sourceCost / sourceConversions.length : 0,
        roi: sourceCost > 0 ? ((sourceRevenue - sourceCost) / sourceCost) * 100 : 0,
        roas: sourceCost > 0 ? sourceRevenue / sourceCost : 0,
      };
    }

    // Calculate by campaign
    const byCampaign: Record<string, CostMetrics> = {};
    const campaigns = new Set(costs?.map(c => c.campaign).filter(Boolean) || []);
    
    for (const campaign of campaigns) {
      if (!campaign) continue;

      const campaignCosts = costs?.filter(c => c.campaign === campaign) || [];
      const campaignLeads = leads?.filter(l => l.campaign === campaign) || [];
      const campaignConversions = conversions?.filter(
        c => c.attribution?.campaign === campaign
      ) || [];
      const campaignRevenue = campaignConversions.reduce((sum, c) => sum + (c.value || 0), 0);
      const campaignCost = campaignCosts.reduce((sum, c) => sum + c.amount, 0);

      byCampaign[campaign] = {
        cost: campaignCost,
        leads: campaignLeads.length,
        conversions: campaignConversions.length,
        costPerLead: campaignLeads.length > 0 ? campaignCost / campaignLeads.length : 0,
        costPerConversion: campaignConversions.length > 0 ? campaignCost / campaignConversions.length : 0,
        roi: campaignCost > 0 ? ((campaignRevenue - campaignCost) / campaignCost) * 100 : 0,
        roas: campaignCost > 0 ? campaignRevenue / campaignCost : 0,
      };
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      bySource,
      byCampaign,
      costPerLead,
      costPerConversion,
      roi
    );

    return {
      totalCost,
      totalLeads,
      costPerLead,
      totalConversions,
      costPerConversion,
      roi,
      roas,
      bySource,
      byCampaign,
      recommendations,
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    bySource: Record<string, CostMetrics>,
    byCampaign: Record<string, CostMetrics>,
    avgCostPerLead: number,
    avgCostPerConversion: number,
    avgROI: number
  ): string[] {
    const recommendations: string[] = [];

    // Analyze sources
    for (const [source, metrics] of Object.entries(bySource)) {
      if (metrics.costPerLead > avgCostPerLead * 1.5) {
        recommendations.push(`Consider reducing spend on ${source} - CPL is ${metrics.costPerLead.toFixed(2)} vs average ${avgCostPerLead.toFixed(2)}`);
      }

      if (metrics.roi < 0) {
        recommendations.push(`Stop spending on ${source} - negative ROI of ${metrics.roi.toFixed(2)}%`);
      }

      if (metrics.roas > avgROI / 100 && metrics.roas > 3) {
        recommendations.push(`Increase budget for ${source} - strong ROAS of ${metrics.roas.toFixed(2)}`);
      }
    }

    // Analyze campaigns
    for (const [campaign, metrics] of Object.entries(byCampaign)) {
      if (metrics.costPerConversion > avgCostPerConversion * 2) {
        recommendations.push(`Optimize ${campaign} campaign - high cost per conversion`);
      }
    }

    // General recommendations
    if (avgCostPerLead > 100) {
      recommendations.push('Overall CPL is high - consider optimizing targeting and messaging');
    }

    if (avgROI < 0) {
      recommendations.push('Overall ROI is negative - review and optimize marketing strategy');
    }

    return recommendations;
  }

  /**
   * Get cost trends
   */
  async getCostTrends(
    days: number,
    tenantId?: string
  ): Promise<Array<{ date: string; cost: number; leads: number; conversions: number }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: costs } = await this.supabase
      .from('marketing_costs')
      .select('date, amount')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .eq('tenant_id', tenantId || '');

    const { data: leads } = await this.supabase
      .from('leads')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('tenant_id', tenantId || '');

    const { data: conversions } = await this.supabase
      .from('conversions')
      .select('converted_at')
      .gte('converted_at', startDate.toISOString())
      .lte('converted_at', endDate.toISOString())
      .eq('tenant_id', tenantId || '');

    // Group by date
    const trends: Record<string, { cost: number; leads: number; conversions: number }> = {};

    costs?.forEach(cost => {
      const date = cost.date.split('T')[0];
      if (!trends[date]) {
        trends[date] = { cost: 0, leads: 0, conversions: 0 };
      }
      trends[date].cost += cost.amount;
    });

    leads?.forEach(lead => {
      const date = lead.created_at.split('T')[0];
      if (!trends[date]) {
        trends[date] = { cost: 0, leads: 0, conversions: 0 };
      }
      trends[date].leads += 1;
    });

    conversions?.forEach(conversion => {
      const date = conversion.converted_at.split('T')[0];
      if (!trends[date]) {
        trends[date] = { cost: 0, leads: 0, conversions: 0 };
      }
      trends[date].conversions += 1;
    });

    return Object.entries(trends)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const costOptimizationService = new CostOptimizationService();
