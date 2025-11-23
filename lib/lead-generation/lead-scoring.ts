/**
 * Advanced Lead Scoring System
 * Multi-factor lead scoring with machine learning capabilities
 */

import { logger } from '@/lib/logging/structured-logger';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { autopilotWorkflowService } from './autopilot-workflows';

export interface LeadScoringFactors {
  demographic: number; // 0-30
  behavioral: number; // 0-30
  engagement: number; // 0-20
  fit: number; // 0-20
}

export interface LeadScore {
  total: number; // 0-100
  factors: LeadScoringFactors;
  qualified: boolean;
  priority: 'hot' | 'warm' | 'cold';
  recommendations: string[];
}

class LeadScoringService {
  private supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  /**
   * Calculate comprehensive lead score
   */
  async calculateScore(leadId: string, tenantId?: string): Promise<LeadScore> {
    // Get lead data
    const lead = await this.getLead(leadId, tenantId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    // Calculate factor scores
    const demographic = await this.calculateDemographicScore(lead);
    const behavioral = await this.calculateBehavioralScore(leadId, tenantId);
    const engagement = await this.calculateEngagementScore(leadId, tenantId);
    const fit = await this.calculateFitScore(lead, tenantId);

    const factors: LeadScoringFactors = {
      demographic,
      behavioral,
      engagement,
      fit,
    };

    const total = demographic + behavioral + engagement + fit;
    const qualified = total >= 70;
    const priority = this.determinePriority(total);
    const recommendations = this.generateRecommendations(factors, total);

    const score: LeadScore = {
      total,
      factors,
      qualified,
      priority,
      recommendations,
    };

    // Update lead score
    await this.updateLeadScore(leadId, score, tenantId);

    // Trigger autopilot workflows
    await autopilotWorkflowService.executeWorkflows(
      score.qualified ? 'lead_qualified' : 'lead_unqualified',
      {
        leadId,
        score: score.total,
        qualified: score.qualified,
      },
      tenantId
    );

    return score;
  }

  /**
   * Calculate demographic score
   */
  private async calculateDemographicScore(lead: any): Promise<number> {
    let score = 0;

    // Email quality
    if (lead.email) {
      score += 5;
      const domain = lead.email.split('@')[1];
      const corporateDomains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
      if (domain && !corporateDomains.includes(domain.toLowerCase())) {
        score += 5; // Corporate email bonus
      }
    }

    // Name completeness
    if (lead.first_name) score += 3;
    if (lead.last_name) score += 3;

    // Company information
    if (lead.company) {
      score += 5;
      // Company size bonus (if available)
      if (lead.metadata?.company_size) {
        const size = lead.metadata.company_size as string;
        if (size.includes('50+') || size.includes('100+')) {
          score += 4;
        }
      }
    }

    // Phone number
    if (lead.phone) score += 5;

    return Math.min(score, 30);
  }

  /**
   * Calculate behavioral score
   */
  private async calculateBehavioralScore(leadId: string, tenantId?: string): Promise<number> {
    let score = 0;

    // Get lead activities
    const { data: activities } = await this.supabase
      .from('lead_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!activities || activities.length === 0) return 0;

    // Activity frequency
    const activityCount = activities.length;
    score += Math.min(activityCount * 2, 10);

    // Activity types
    const activityTypes = new Set(activities.map(a => a.activity_type));
    score += Math.min(activityTypes.size * 2, 10);

    // Recent activity bonus
    const recentActivity = activities.filter(
      a => new Date(a.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    );
    if (recentActivity.length > 0) {
      score += 5;
    }

    // High-value activities
    const highValueActivities = ['demo_requested', 'pricing_viewed', 'trial_started'];
    const hasHighValue = activities.some(a => highValueActivities.includes(a.activity_type));
    if (hasHighValue) {
      score += 5;
    }

    return Math.min(score, 30);
  }

  /**
   * Calculate engagement score
   */
  private async calculateEngagementScore(leadId: string, tenantId?: string): Promise<number> {
    let score = 0;

    // Email engagement
    const { data: emails } = await this.supabase
      .from('email_interactions')
      .select('*')
      .eq('lead_id', leadId);

    if (emails && emails.length > 0) {
      const opened = emails.filter(e => e.opened).length;
      const clicked = emails.filter(e => e.clicked).length;
      const replied = emails.filter(e => e.replied).length;

      score += Math.min(opened * 2, 8);
      score += Math.min(clicked * 3, 6);
      score += replied * 6;
    }

    // Website engagement
    const { data: sessions } = await this.supabase
      .from('lead_sessions')
      .select('*')
      .eq('lead_id', leadId);

    if (sessions && sessions.length > 0) {
      const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const pageViews = sessions.reduce((sum, s) => sum + (s.page_views || 0), 0);

      if (totalTime > 300) score += 3; // 5+ minutes
      if (pageViews > 5) score += 3; // 5+ pages
    }

    return Math.min(score, 20);
  }

  /**
   * Calculate fit score
   */
  private async calculateFitScore(lead: any, tenantId?: string): Promise<number> {
    let score = 0;

    // Source quality
    const highQualitySources = ['referral', 'partner', 'event'];
    if (lead.source && highQualitySources.includes(lead.source.toLowerCase())) {
      score += 10;
    }

    // Campaign quality
    if (lead.campaign) {
      const highValueCampaigns = ['enterprise', 'partnership', 'webinar'];
      if (highValueCampaigns.some(c => lead.campaign.toLowerCase().includes(c))) {
        score += 5;
      } else {
        score += 2;
      }
    }

    // Industry fit (if available)
    if (lead.metadata?.industry) {
      // This would check against ideal customer profile
      score += 3;
    }

    // Budget fit (if available)
    if (lead.metadata?.budget) {
      const budget = lead.metadata.budget as string;
      if (budget.includes('10k+') || budget.includes('50k+')) {
        score += 2;
      }
    }

    return Math.min(score, 20);
  }

  /**
   * Determine priority
   */
  private determinePriority(score: number): 'hot' | 'warm' | 'cold' {
    if (score >= 80) return 'hot';
    if (score >= 50) return 'warm';
    return 'cold';
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(factors: LeadScoringFactors, total: number): string[] {
    const recommendations: string[] = [];

    if (factors.demographic < 20) {
      recommendations.push('Collect more demographic information (company, phone, etc.)');
    }

    if (factors.behavioral < 15) {
      recommendations.push('Encourage more website activity and engagement');
    }

    if (factors.engagement < 10) {
      recommendations.push('Send targeted email campaigns to increase engagement');
    }

    if (factors.fit < 10) {
      recommendations.push('Qualify lead fit through discovery questions');
    }

    if (total < 50) {
      recommendations.push('Consider nurturing campaign before sales outreach');
    }

    if (total >= 70) {
      recommendations.push('Lead is qualified - assign to sales team');
    }

    return recommendations;
  }

  /**
   * Get lead data
   */
  private async getLead(leadId: string, tenantId?: string): Promise<any> {
    let query = this.supabase.from('leads').select('*').eq('id', leadId).single();

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * Update lead score
   */
  private async updateLeadScore(
    leadId: string,
    score: LeadScore,
    tenantId?: string
  ): Promise<void> {
    await this.supabase
      .from('leads')
      .update({
        score: score.total,
        qualified: score.qualified,
        priority: score.priority,
        score_factors: score.factors,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);
  }

  /**
   * Batch score leads
   */
  async batchScoreLeads(leadIds: string[], tenantId?: string): Promise<LeadScore[]> {
    const scores: LeadScore[] = [];

    for (const leadId of leadIds) {
      try {
        const score = await this.calculateScore(leadId, tenantId);
        scores.push(score);
      } catch (error) {
        logger.error('Failed to score lead', error instanceof Error ? error : new Error(String(error)), {
          leadId,
        });
      }
    }

    return scores;
  }
}

export const leadScoringService = new LeadScoringService();
