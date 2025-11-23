/**
 * A/B Testing Framework
 * Test variations of landing pages, emails, and campaigns
 */

import { logger } from '@/lib/logging/structured-logger';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export interface ABTest {
  id: string;
  name: string;
  type: 'landing_page' | 'email' | 'campaign' | 'form';
  variations: ABVariation[];
  trafficSplit: number[]; // Percentage for each variation
  startDate: string;
  endDate?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
}

export interface ABVariation {
  id: string;
  name: string;
  content: Record<string, unknown>;
  weight: number; // Traffic percentage
}

export interface ABTestResult {
  testId: string;
  variations: Array<{
    variationId: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue?: number;
  }>;
  winner?: string;
  confidence: number;
  significance: 'high' | 'medium' | 'low';
}

class ABTestingService {
  private supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  /**
   * Assign visitor to test variation
   */
  async assignVariation(
    testId: string,
    visitorId: string,
    tenantId?: string
  ): Promise<string | null> {
    try {
      // Check if already assigned
      const existing = await this.getAssignment(testId, visitorId, tenantId);
      if (existing) {
        return existing.variation_id;
      }

      // Get test
      const test = await this.getTest(testId, tenantId);
      if (!test || test.status !== 'running') {
        return null;
      }

      // Check date range
      const now = new Date();
      if (new Date(test.startDate) > now) {
        return null;
      }
      if (test.endDate && new Date(test.endDate) < now) {
        return null;
      }

      // Assign variation based on traffic split
      const variation = this.selectVariation(test.variations, test.trafficSplit, visitorId);

      // Record assignment
      await this.supabase.from('ab_test_assignments').insert({
        test_id: testId,
        visitor_id: visitorId,
        variation_id: variation.id,
        assigned_at: new Date().toISOString(),
        tenant_id: tenantId,
      });

      // Track event
      await this.trackEvent('ab_test_assigned', {
        testId,
        visitorId,
        variationId: variation.id,
        tenantId,
      });

      return variation.id;
    } catch (error) {
      logger.error('AB test assignment failed', error instanceof Error ? error : new Error(String(error)), {
        testId,
        visitorId,
        tenantId,
      });
      return null;
    }
  }

  /**
   * Track conversion for AB test
   */
  async trackConversion(
    testId: string,
    visitorId: string,
    conversionType: string,
    value?: number,
    tenantId?: string
  ): Promise<void> {
    try {
      // Get assignment
      const assignment = await this.getAssignment(testId, visitorId, tenantId);
      if (!assignment) {
        return;
      }

      // Record conversion
      await this.supabase.from('ab_test_conversions').insert({
        test_id: testId,
        visitor_id: visitorId,
        variation_id: assignment.variation_id,
        conversion_type: conversionType,
        value: value || 0,
        converted_at: new Date().toISOString(),
        tenant_id: tenantId,
      });

      // Track event
      await this.trackEvent('ab_test_conversion', {
        testId,
        visitorId,
        variationId: assignment.variation_id,
        conversionType,
        value,
        tenantId,
      });
    } catch (error) {
      logger.error('AB test conversion tracking failed', error instanceof Error ? error : new Error(String(error)), {
        testId,
        visitorId,
        tenantId,
      });
    }
  }

  /**
   * Get test results
   */
  async getTestResults(testId: string, tenantId?: string): Promise<ABTestResult | null> {
    try {
      const test = await this.getTest(testId, tenantId);
      if (!test) {
        return null;
      }

      // Get assignments
      let assignmentQuery = this.supabase
        .from('ab_test_assignments')
        .select('variation_id')
        .eq('test_id', testId);

      if (tenantId) {
        assignmentQuery = assignmentQuery.eq('tenant_id', tenantId);
      }

      const { data: assignments } = await assignmentQuery;

      // Get conversions
      let conversionQuery = this.supabase
        .from('ab_test_conversions')
        .select('*')
        .eq('test_id', testId);

      if (tenantId) {
        conversionQuery = conversionQuery.eq('tenant_id', tenantId);
      }

      const { data: conversions } = await conversionQuery;

      // Calculate results per variation
      const variationResults = test.variations.map(variation => {
        const visitors = assignments?.filter(a => a.variation_id === variation.id).length || 0;
        const variationConversions = conversions?.filter(c => c.variation_id === variation.id) || [];
        const conversionCount = variationConversions.length;
        const conversionRate = visitors > 0 ? (conversionCount / visitors) * 100 : 0;
        const revenue = variationConversions.reduce((sum, c) => sum + (c.value || 0), 0);

        return {
          variationId: variation.id,
          visitors,
          conversions: conversionCount,
          conversionRate,
          revenue,
        };
      });

      // Determine winner
      const winner = this.determineWinner(variationResults);

      // Calculate statistical significance
      const significance = this.calculateSignificance(variationResults);
      const confidence = this.calculateConfidence(variationResults);

      return {
        testId,
        variations: variationResults,
        winner,
        confidence,
        significance,
      };
    } catch (error) {
      logger.error('Failed to get test results', error instanceof Error ? error : new Error(String(error)), {
        testId,
        tenantId,
      });
      return null;
    }
  }

  /**
   * Select variation based on traffic split
   */
  private selectVariation(
    variations: ABVariation[],
    trafficSplit: number[],
    visitorId: string
  ): ABVariation {
    // Use visitor ID hash for consistent assignment
    const hash = this.hashString(visitorId);
    const random = hash % 100;

    let cumulative = 0;
    for (let i = 0; i < variations.length; i++) {
      cumulative += trafficSplit[i] || 0;
      if (random < cumulative) {
        return variations[i];
      }
    }

    return variations[0];
  }

  /**
   * Hash string to number
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Determine winner
   */
  private determineWinner(
    results: Array<{ variationId: string; conversionRate: number }>
  ): string | undefined {
    if (results.length < 2) return undefined;

    const sorted = [...results].sort((a, b) => b.conversionRate - a.conversionRate);
    return sorted[0].variationId;
  }

  /**
   * Calculate statistical significance
   */
  private calculateSignificance(
    results: Array<{ visitors: number; conversions: number }>
  ): 'high' | 'medium' | 'low' {
    if (results.length < 2) return 'low';

    // Simple chi-square test approximation
    const totalVisitors = results.reduce((sum, r) => sum + r.visitors, 0);
    const totalConversions = results.reduce((sum, r) => sum + r.conversions, 0);

    if (totalVisitors < 100 || totalConversions < 10) {
      return 'low';
    }

    // More sophisticated calculation would go here
    // For now, use simple heuristics
    if (totalVisitors > 1000 && totalConversions > 100) {
      return 'high';
    }
    if (totalVisitors > 500 && totalConversions > 50) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(
    results: Array<{ visitors: number; conversions: number }>
  ): number {
    // Simplified confidence calculation
    const totalVisitors = results.reduce((sum, r) => sum + r.visitors, 0);
    const totalConversions = results.reduce((sum, r) => sum + r.conversions, 0);

    if (totalVisitors === 0) return 0;

    // Base confidence on sample size
    const baseConfidence = Math.min((totalVisitors / 1000) * 100, 95);
    
    // Adjust based on conversion rate
    const conversionRate = (totalConversions / totalVisitors) * 100;
    const rateAdjustment = Math.min(conversionRate / 10, 5);

    return Math.min(baseConfidence + rateAdjustment, 95);
  }

  /**
   * Get test
   */
  private async getTest(testId: string, tenantId?: string): Promise<ABTest | null> {
    let query = this.supabase.from('ab_tests').select('*').eq('id', testId).single();

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data } = await query;
    return data as ABTest | null;
  }

  /**
   * Get assignment
   */
  private async getAssignment(
    testId: string,
    visitorId: string,
    tenantId?: string
  ): Promise<{ variation_id: string } | null> {
    let query = this.supabase
      .from('ab_test_assignments')
      .select('variation_id')
      .eq('test_id', testId)
      .eq('visitor_id', visitorId)
      .single();

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data } = await query;
    return data;
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
}

export const abTestingService = new ABTestingService();
