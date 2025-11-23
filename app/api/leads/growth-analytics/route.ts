/**
 * Growth Analytics Dashboard API Endpoint
 * Comprehensive analytics for lead generation and growth
 */

import { NextResponse } from 'next/server';
import { createGETHandler } from '@/lib/api/route-handler';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { conversionTrackingService } from '@/lib/lead-generation/conversion-tracking';
import { costOptimizationService } from '@/lib/lead-generation/cost-optimization';
import { roiTrackingService } from '@/lib/lead-generation/roi-tracking';

export const GET = createGETHandler(
  async (context) => {
    const searchParams = context.request.nextUrl.searchParams;
    const startDate = new Date(searchParams.get('startDate') || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(searchParams.get('endDate') || Date.now());
    const tenantId = context.tenantId || undefined;

    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

    // Get leads data
    let leadsQuery = supabase
      .from('leads')
      .select('id, created_at, source, campaign, score, qualified, status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (tenantId) {
      leadsQuery = leadsQuery.eq('tenant_id', tenantId);
    }

    const { data: leads } = await leadsQuery;

    // Get conversion stats
    const conversionStats = await conversionTrackingService.getConversionStats(
      startDate,
      endDate,
      tenantId
    );

    // Get cost analysis
    const costAnalysis = await costOptimizationService.analyzeCosts(
      startDate,
      endDate,
      tenantId
    );

    // Get ROI metrics
    const roiMetrics = await roiTrackingService.calculateROI(
      startDate,
      endDate,
      tenantId
    );

    // Get revenue attribution
    const revenueAttribution = await roiTrackingService.getRevenueAttribution(
      startDate,
      endDate,
      tenantId
    );

    // Calculate lead metrics
    const totalLeads = leads?.length || 0;
    const qualifiedLeads = leads?.filter(l => l.qualified).length || 0;
    const averageScore = leads && leads.length > 0
      ? leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length
      : 0;

    // Lead sources breakdown
    const leadsBySource: Record<string, number> = {};
    leads?.forEach(lead => {
      const source = lead.source || 'unknown';
      leadsBySource[source] = (leadsBySource[source] || 0) + 1;
    });

    // Lead status breakdown
    const leadsByStatus: Record<string, number> = {};
    leads?.forEach(lead => {
      const status = lead.status || 'new';
      leadsByStatus[status] = (leadsByStatus[status] || 0) + 1;
    });

    // Growth rate (compared to previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    let previousLeadsQuery = supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    if (tenantId) {
      previousLeadsQuery = previousLeadsQuery.eq('tenant_id', tenantId);
    }

    const { count: previousLeads } = await previousLeadsQuery;
    const growthRate = previousLeads && previousLeads > 0
      ? ((totalLeads - previousLeads) / previousLeads) * 100
      : 0;

    return NextResponse.json({
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      leads: {
        total: totalLeads,
        qualified: qualifiedLeads,
        qualificationRate: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
        averageScore,
        bySource: leadsBySource,
        byStatus: leadsByStatus,
        growthRate,
      },
      conversions: conversionStats,
      costs: {
        total: costAnalysis.totalCost,
        costPerLead: costAnalysis.costPerLead,
        costPerConversion: costAnalysis.costPerConversion,
        bySource: costAnalysis.bySource,
        byCampaign: costAnalysis.byCampaign,
        recommendations: costAnalysis.recommendations,
      },
      roi: {
        ...roiMetrics,
        revenueAttribution,
      },
      summary: {
        totalRevenue: roiMetrics.totalRevenue,
        totalCost: roiMetrics.totalCost,
        netProfit: roiMetrics.totalRevenue - roiMetrics.totalCost,
        roi: roiMetrics.roi,
        roas: roiMetrics.roas,
        conversionRate: conversionStats.conversionRate,
        costPerLead: costAnalysis.costPerLead,
        costPerConversion: costAnalysis.costPerConversion,
      },
    });
  },
  {
    requireAuth: true,
    cacheable: true,
    cacheTTL: 300, // 5 minutes
  }
);
