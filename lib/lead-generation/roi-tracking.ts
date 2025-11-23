/**
 * ROI and Revenue Tracking System
 * Comprehensive ROI analysis and revenue attribution
 */

import { logger } from '@/lib/logging/structured-logger';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export interface ROIMetrics {
  totalRevenue: number;
  totalCost: number;
  roi: number;
  roas: number;
  paybackPeriod: number; // Days
  ltv: number; // Lifetime value
  cac: number; // Customer acquisition cost
  ltvCacRatio: number;
}

export interface RevenueAttribution {
  source: string;
  campaign?: string;
  revenue: number;
  customers: number;
  averageOrderValue: number;
  roi: number;
  roas: number;
}

class ROITrackingService {
  private supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  /**
   * Calculate comprehensive ROI metrics
   */
  async calculateROI(
    startDate: Date,
    endDate: Date,
    tenantId?: string
  ): Promise<ROIMetrics> {
    // Get revenue
    const { data: conversions } = await this.supabase
      .from('conversions')
      .select('value, converted_at')
      .gte('converted_at', startDate.toISOString())
      .lte('converted_at', endDate.toISOString())
      .eq('tenant_id', tenantId || '');

    const totalRevenue = conversions?.reduce((sum, c) => sum + (c.value || 0), 0) || 0;

    // Get costs
    const { data: costs } = await this.supabase
      .from('marketing_costs')
      .select('amount')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .eq('tenant_id', tenantId || '');

    const totalCost = costs?.reduce((sum, c) => sum + c.amount, 0) || 0;

    // Calculate ROI and ROAS
    const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
    const roas = totalCost > 0 ? totalRevenue / totalCost : 0;

    // Calculate CAC (Customer Acquisition Cost)
    const { data: leads } = await this.supabase
      .from('leads')
      .select('id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('tenant_id', tenantId || '');

    const totalLeads = leads?.length || 0;
    const cac = totalLeads > 0 ? totalCost / totalLeads : 0;

    // Calculate LTV (simplified - would need historical data)
    const customers = conversions?.length || 0;
    const averageOrderValue = customers > 0 ? totalRevenue / customers : 0;
    const ltv = averageOrderValue * 2.5; // Simplified multiplier

    const ltvCacRatio = cac > 0 ? ltv / cac : 0;

    // Calculate payback period (simplified)
    const paybackPeriod = cac > 0 && averageOrderValue > 0 
      ? Math.ceil(cac / averageOrderValue) 
      : 0;

    return {
      totalRevenue,
      totalCost,
      roi,
      roas,
      paybackPeriod,
      ltv,
      cac,
      ltvCacRatio,
    };
  }

  /**
   * Get revenue attribution by source
   */
  async getRevenueAttribution(
    startDate: Date,
    endDate: Date,
    tenantId?: string
  ): Promise<RevenueAttribution[]> {
    // Get conversions with attribution
    const { data: conversions } = await this.supabase
      .from('conversions')
      .select('value, attribution')
      .gte('converted_at', startDate.toISOString())
      .lte('converted_at', endDate.toISOString())
      .eq('tenant_id', tenantId || '');

    // Get costs by source
    const { data: costs } = await this.supabase
      .from('marketing_costs')
      .select('source, campaign, amount')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .eq('tenant_id', tenantId || '');

    // Group by source
    const attributionMap: Record<string, RevenueAttribution> = {};

    // Initialize sources from costs
    costs?.forEach(cost => {
      if (!attributionMap[cost.source]) {
        attributionMap[cost.source] = {
          source: cost.source,
          revenue: 0,
          customers: 0,
          averageOrderValue: 0,
          roi: 0,
          roas: 0,
        };
      }
    });

    // Add revenue from conversions
    conversions?.forEach(conversion => {
      const source = conversion.attribution?.source || 'unknown';
      if (!attributionMap[source]) {
        attributionMap[source] = {
          source,
          revenue: 0,
          customers: 0,
          averageOrderValue: 0,
          roi: 0,
          roas: 0,
        };
      }

      attributionMap[source].revenue += conversion.value || 0;
      attributionMap[source].customers += 1;
    });

    // Calculate metrics for each source
    for (const source of Object.keys(attributionMap)) {
      const attribution = attributionMap[source];
      const sourceCosts = costs?.filter(c => c.source === source) || [];
      const sourceCost = sourceCosts.reduce((sum, c) => sum + c.amount, 0);

      attribution.averageOrderValue = attribution.customers > 0 
        ? attribution.revenue / attribution.customers 
        : 0;
      attribution.roi = sourceCost > 0 
        ? ((attribution.revenue - sourceCost) / sourceCost) * 100 
        : 0;
      attribution.roas = sourceCost > 0 
        ? attribution.revenue / sourceCost 
        : 0;
    }

    return Object.values(attributionMap).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Track revenue event
   */
  async trackRevenue(
    leadId: string,
    amount: number,
    currency: string = 'USD',
    metadata?: Record<string, unknown>,
    tenantId?: string
  ): Promise<void> {
    try {
      await this.supabase.from('revenue_events').insert({
        lead_id: leadId,
        amount,
        currency,
        metadata: metadata || {},
        recorded_at: new Date().toISOString(),
        tenant_id: tenantId,
      });

      // Update lead with revenue
      await this.supabase
        .from('leads')
        .update({
          revenue: amount,
          revenue_recorded_at: new Date().toISOString(),
        })
        .eq('id', leadId);

      logger.info('Revenue tracked', {
        leadId,
        amount,
        currency,
        tenantId,
      });
    } catch (error) {
      logger.error('Revenue tracking failed', error instanceof Error ? error : new Error(String(error)), {
        leadId,
        tenantId,
      });
    }
  }

  /**
   * Get ROI trends
   */
  async getROITrends(
    days: number,
    tenantId?: string
  ): Promise<Array<{ date: string; revenue: number; cost: number; roi: number; roas: number }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily revenue
    const { data: conversions } = await this.supabase
      .from('conversions')
      .select('value, converted_at')
      .gte('converted_at', startDate.toISOString())
      .lte('converted_at', endDate.toISOString())
      .eq('tenant_id', tenantId || '');

    // Get daily costs
    const { data: costs } = await this.supabase
      .from('marketing_costs')
      .select('amount, date')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .eq('tenant_id', tenantId || '');

    // Group by date
    const trends: Record<string, { revenue: number; cost: number }> = {};

    conversions?.forEach(conversion => {
      const date = conversion.converted_at.split('T')[0];
      if (!trends[date]) {
        trends[date] = { revenue: 0, cost: 0 };
      }
      trends[date].revenue += conversion.value || 0;
    });

    costs?.forEach(cost => {
      const date = cost.date.split('T')[0];
      if (!trends[date]) {
        trends[date] = { revenue: 0, cost: 0 };
      }
      trends[date].cost += cost.amount;
    });

    return Object.entries(trends)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        cost: data.cost,
        roi: data.cost > 0 ? ((data.revenue - data.cost) / data.cost) * 100 : 0,
        roas: data.cost > 0 ? data.revenue / data.cost : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const roiTrackingService = new ROITrackingService();
