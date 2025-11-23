/**
 * Lead Capture System
 * Automated lead capture, validation, and enrichment
 */

import { z } from 'zod';
import { logger } from '@/lib/logging/structured-logger';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { cacheService } from '@/lib/performance/cache';
import { autopilotWorkflowService } from './autopilot-workflows';

export interface LeadData {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  source?: string;
  campaign?: string;
  metadata?: Record<string, unknown>;
}

export interface LeadCaptureResult {
  success: boolean;
  leadId: string | null;
  score?: number;
  qualified?: boolean;
  nextAction?: string;
  error?: string;
}

const leadSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  campaign: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

class LeadCaptureService {
  private supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  /**
   * Capture lead with validation and enrichment
   */
  async captureLead(data: LeadData, tenantId?: string): Promise<LeadCaptureResult> {
    try {
      // Validate input
      const validated = leadSchema.parse(data);

      // Check for duplicate leads
      const duplicate = await this.checkDuplicate(validated.email, tenantId);
      if (duplicate) {
        logger.warn('Duplicate lead detected', { email: validated.email, tenantId });
        return {
          success: false,
          leadId: duplicate.id,
          error: 'Lead already exists',
        };
      }

      // Enrich lead data
      const enriched = await this.enrichLead(validated);

      // Score lead
      const score = await this.scoreLead(enriched);

      // Save lead
      const { data: lead, error } = await this.supabase
        .from('leads')
        .insert({
          email: enriched.email,
          first_name: enriched.firstName,
          last_name: enriched.lastName,
          company: enriched.company,
          phone: enriched.phone,
          source: enriched.source || 'website',
          campaign: enriched.campaign,
          metadata: enriched.metadata || {},
          score: score,
          qualified: score >= 70, // Qualified if score >= 70
          tenant_id: tenantId,
          status: 'new',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Trigger automation workflows
      await this.triggerAutomation(lead.id, enriched, tenantId);

      // Trigger autopilot workflows
      await this.triggerAutopilotWorkflows(lead.id, enriched, tenantId);

      // Track event
      await this.trackEvent('lead_captured', {
        leadId: lead.id,
        email: enriched.email,
        source: enriched.source,
        score,
        tenantId,
      });

      logger.info('Lead captured successfully', {
        leadId: lead.id,
        email: enriched.email,
        score,
        qualified: score >= 70,
      });

      return {
        success: true,
        leadId: lead.id,
        score,
        qualified: score >= 70,
        nextAction: score >= 70 ? 'assign_to_sales' : 'nurture',
      };
    } catch (error) {
      logger.error('Lead capture failed', error instanceof Error ? error : new Error(String(error)), {
        email: data.email,
        tenantId,
      });

      return {
        success: false,
        leadId: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check for duplicate leads
   */
  private async checkDuplicate(email: string, tenantId?: string): Promise<{ id: string } | null> {
    const cacheKey = `lead:duplicate:${email}:${tenantId || 'global'}`;
    const cached = await cacheService.get<{ id: string }>(cacheKey);
    if (cached) return cached;

    let query = this.supabase
      .from('leads')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data } = await query.single();

    if (data) {
      await cacheService.set(cacheKey, data, { ttl: 3600 });
      return data;
    }

    return null;
  }

  /**
   * Enrich lead data from external sources
   */
  private async enrichLead(data: LeadData): Promise<LeadData> {
    // Check cache first
    const cacheKey = `lead:enrichment:${data.email}`;
    const cached = await cacheService.get<LeadData>(cacheKey);
    if (cached) return { ...data, ...cached };

    const enriched: LeadData = { ...data };

    // Email domain enrichment
    if (data.email && !data.company) {
      const domain = data.email.split('@')[1];
      enriched.company = domain?.split('.')[0];
    }

    // TODO: Integrate with enrichment APIs (Clearbit, FullContact, etc.)
    // For now, return basic enrichment

    // Cache enrichment
    await cacheService.set(cacheKey, enriched, { ttl: 86400 }); // 24 hours

    return enriched;
  }

  /**
   * Score lead based on data quality and signals
   */
  private async scoreLead(data: LeadData): Promise<number> {
    let score = 0;

    // Email quality (20 points)
    if (data.email) {
      score += 20;
      // Corporate email bonus
      const domain = data.email.split('@')[1];
      const corporateDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      if (domain && !corporateDomains.includes(domain.toLowerCase())) {
        score += 10;
      }
    }

    // Name completeness (15 points)
    if (data.firstName) score += 7;
    if (data.lastName) score += 8;

    // Company information (20 points)
    if (data.company) score += 20;

    // Phone number (15 points)
    if (data.phone) score += 15;

    // Source quality (20 points)
    if (data.source) {
      const highQualitySources = ['referral', 'partner', 'event', 'webinar'];
      if (highQualitySources.includes(data.source.toLowerCase())) {
        score += 20;
      } else {
        score += 10;
      }
    }

    // Campaign tracking (10 points)
    if (data.campaign) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Trigger automation workflows
   */
  private async triggerAutomation(
    leadId: string,
    data: LeadData,
    tenantId?: string
  ): Promise<void> {
    // Trigger welcome email
    await this.triggerWelcomeEmail(leadId, data, tenantId);

    // Trigger scoring workflow
    await this.triggerScoringWorkflow(leadId, data, tenantId);

    // Trigger CRM sync if qualified
    const score = await this.scoreLead(data);
    if (score >= 70) {
      await this.triggerCRMSync(leadId, data, tenantId);
    }
  }

  /**
   * Trigger welcome email
   */
  private async triggerWelcomeEmail(
    leadId: string,
    data: LeadData,
    tenantId?: string
  ): Promise<void> {
    // Queue email in background
    try {
      await this.supabase.from('email_queue').insert({
        lead_id: leadId,
        template: 'welcome',
        recipient_email: data.email,
        recipient_name: data.firstName || 'there',
        tenant_id: tenantId,
        scheduled_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn('Failed to queue welcome email', {
        leadId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Trigger scoring workflow
   */
  private async triggerScoringWorkflow(
    leadId: string,
    data: LeadData,
    tenantId?: string
  ): Promise<void> {
    // This would trigger a workflow automation
    logger.info('Scoring workflow triggered', { leadId, tenantId });
  }

  /**
   * Trigger CRM sync
   */
  private async triggerCRMSync(
    leadId: string,
    data: LeadData,
    tenantId?: string
  ): Promise<void> {
    // This would sync to CRM system
    logger.info('CRM sync triggered', { leadId, tenantId });
  }

  /**
   * Trigger autopilot workflows
   */
  private async triggerAutopilotWorkflows(
    leadId: string,
    data: LeadData,
    tenantId?: string
  ): Promise<void> {
    try {
      await autopilotWorkflowService.executeWorkflows(
        'lead_captured',
        {
          leadId,
          email: data.email,
          score: await this.scoreLead(data),
          qualified: (await this.scoreLead(data)) >= 70,
        },
        tenantId
      );
    } catch (error) {
      logger.warn('Failed to trigger autopilot workflows', {
        leadId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
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

export const leadCaptureService = new LeadCaptureService();
