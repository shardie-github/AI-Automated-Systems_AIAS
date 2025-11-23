/**
 * Conversion Tracking System
 * Track conversions, attribution, and ROI
 */

import { logger } from '@/lib/logging/structured-logger';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export interface ConversionEvent {
  leadId: string;
  type: 'signup' | 'trial' | 'purchase' | 'demo' | 'download' | 'custom';
  value?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

export interface AttributionData {
  source?: string;
  campaign?: string;
  medium?: string;
  term?: string;
  content?: string;
  firstTouch?: string;
  lastTouch?: string;
  touchpoints?: Array<{
    timestamp: string;
    source: string;
    type: string;
  }>;
}

class ConversionTrackingService {
  private supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  /**
   * Track conversion
   */
  async trackConversion(
    event: ConversionEvent,
    tenantId?: string
  ): Promise<void> {
    try {
      // Get lead attribution
      const attribution = await this.getAttribution(event.leadId, tenantId);

      // Record conversion
      await this.supabase.from('conversions').insert({
        lead_id: event.leadId,
        type: event.type,
        value: event.value || 0,
        currency: event.currency || 'USD',
        metadata: event.metadata || {},
        attribution: attribution,
        converted_at: new Date().toISOString(),
        tenant_id: tenantId,
      });

      // Update lead status
      await this.updateLeadStatus(event.leadId, 'converted', tenantId);

      // Calculate ROI if value provided
      if (event.value) {
        await this.calculateROI(event.leadId, event.value, attribution, tenantId);
      }

      // Track event
      await this.trackEvent('conversion', {
        leadId: event.leadId,
        type: event.type,
        value: event.value,
        attribution,
        tenantId,
      });

      logger.info('Conversion tracked', {
        leadId: event.leadId,
        type: event.type,
        value: event.value,
        tenantId,
      });
    } catch (error) {
      logger.error('Conversion tracking failed', error instanceof Error ? error : new Error(String(error)), {
        leadId: event.leadId,
        tenantId,
      });
    }
  }

  /**
   * Get attribution data for lead
   */
  private async getAttribution(leadId: string, tenantId?: string): Promise<AttributionData> {
    // Get lead
    const { data: lead } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (!lead) {
      return {};
    }

    // Get touchpoints
    const { data: touchpoints } = await this.supabase
      .from('lead_touchpoints')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });

    const attribution: AttributionData = {
      source: lead.source,
      campaign: lead.campaign,
      firstTouch: touchpoints?.[0]?.source || lead.source,
      lastTouch: touchpoints?.[touchpoints.length - 1]?.source || lead.source,
      touchpoints: touchpoints?.map(tp => ({
        timestamp: tp.created_at,
        source: tp.source,
        type: tp.type,
      })),
    };

    return attribution;
  }

  /**
   * Calculate ROI
   */
  private async calculateROI(
    leadId: string,
    revenue: number,
    attribution: AttributionData,
    tenantId?: string
  ): Promise<void> {
    // Get campaign costs
    const campaignCost = await this.getCampaignCost(attribution.campaign, tenantId);

    // Calculate ROI
    const roi = campaignCost > 0 ? ((revenue - campaignCost) / campaignCost) * 100 : 0;
    const roas = campaignCost > 0 ? revenue / campaignCost : 0;

    // Store ROI data
    await this.supabase.from('roi_tracking').insert({
      lead_id: leadId,
      campaign: attribution.campaign,
      source: attribution.source,
      revenue,
      cost: campaignCost,
      roi,
      roas,
      calculated_at: new Date().toISOString(),
      tenant_id: tenantId,
    });

    logger.info('ROI calculated', {
      leadId,
      revenue,
      cost: campaignCost,
      roi,
      roas,
      tenantId,
    });
  }

  /**
   * Get campaign cost
   */
  private async getCampaignCost(campaign?: string, tenantId?: string): Promise<number> {
    if (!campaign) return 0;

    const { data } = await this.supabase
      .from('campaign_costs')
      .select('total_cost')
      .eq('campaign', campaign)
      .eq('tenant_id', tenantId || '')
      .single();

    return data?.total_cost || 0;
  }

  /**
   * Update lead status
   */
  private async updateLeadStatus(
    leadId: string,
    status: string,
    tenantId?: string
  ): Promise<void> {
    await this.supabase
      .from('leads')
      .update({
        status,
        converted_at: new Date().toISOString(),
      })
      .eq('id', leadId);
  }

  /**
   * Track event
   */
  private async trackEvent(event: string, properties: Record<string, unknown>): Promise<void> {
    try {
      await fetch('/api/telemetry/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          properties,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Silent fail
    }
  }

  /**
   * Get conversion statistics
   */
  async getConversionStats(
    startDate: Date,
    endDate: Date,
    tenantId?: string
  ): Promise<{
    totalConversions: number;
    totalRevenue: number;
    averageValue: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
    conversionRate: number;
  }> {
    let query = this.supabase
      .from('conversions')
      .select('*')
      .gte('converted_at', startDate.toISOString())
      .lte('converted_at', endDate.toISOString());

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data: conversions } = await query;

    if (!conversions || conversions.length === 0) {
      return {
        totalConversions: 0,
        totalRevenue: 0,
        averageValue: 0,
        byType: {},
        bySource: {},
        conversionRate: 0,
      };
    }

    const totalRevenue = conversions.reduce((sum, c) => sum + (c.value || 0), 0);
    const averageValue = totalRevenue / conversions.length;

    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    for (const conversion of conversions) {
      byType[conversion.type] = (byType[conversion.type] || 0) + 1;
      const source = conversion.attribution?.source || 'unknown';
      bySource[source] = (bySource[source] || 0) + 1;
    }

    // Get total leads for conversion rate
    let leadQuery = this.supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (tenantId) {
      leadQuery = leadQuery.eq('tenant_id', tenantId);
    }

    const { count: totalLeads } = await leadQuery;
    const conversionRate = totalLeads ? (conversions.length / totalLeads) * 100 : 0;

    return {
      totalConversions: conversions.length,
      totalRevenue,
      averageValue,
      byType,
      bySource,
      conversionRate,
    };
  }
}

export const conversionTrackingService = new ConversionTrackingService();
