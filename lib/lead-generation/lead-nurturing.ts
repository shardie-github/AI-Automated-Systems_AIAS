/**
 * Lead Nurturing System
 * Automated email sequences and workflow automation
 */

import { logger } from '@/lib/logging/structured-logger';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { emailService } from '@/lib/email/email-service';
import { getTemplateById, replaceTemplateVariables } from '@/lib/email-templates';

export interface NurturingSequence {
  id: string;
  name: string;
  steps: NurturingStep[];
  trigger: 'immediate' | 'delayed' | 'scored';
  triggerScore?: number;
}

export interface NurturingStep {
  order: number;
  delay: number; // Days
  emailTemplate: string;
  conditions?: Record<string, unknown>;
}

class LeadNurturingService {
  private supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  /**
   * Start nurturing sequence for lead
   */
  async startNurturingSequence(
    leadId: string,
    sequenceId: string,
    tenantId?: string
  ): Promise<void> {
    const sequence = await this.getSequence(sequenceId);
    if (!sequence) {
      throw new Error(`Sequence ${sequenceId} not found`);
    }

    // Check if already in sequence
    const existing = await this.checkExistingSequence(leadId, sequenceId);
    if (existing) {
      logger.warn('Lead already in sequence', { leadId, sequenceId });
      return;
    }

    // Enroll lead in sequence
    await this.enrollLead(leadId, sequenceId, tenantId);

    // Schedule first step
    await this.scheduleNextStep(leadId, sequenceId, 0, tenantId);

    logger.info('Nurturing sequence started', { leadId, sequenceId, tenantId });
  }

  /**
   * Process nurturing steps (called by cron job)
   */
  async processNurturingSteps(): Promise<void> {
    // Get all scheduled steps that are due
    const { data: scheduledSteps } = await this.supabase
      .from('nurturing_schedule')
      .select('*')
      .lte('scheduled_at', new Date().toISOString())
      .eq('status', 'scheduled')
      .limit(100);

    if (!scheduledSteps || scheduledSteps.length === 0) {
      return;
    }

    for (const step of scheduledSteps) {
      try {
        await this.executeStep(step);
      } catch (error) {
        logger.error('Failed to execute nurturing step', error instanceof Error ? error : new Error(String(error)), {
          stepId: step.id,
          leadId: step.lead_id,
        });
      }
    }
  }

  /**
   * Execute nurturing step
   */
  private async executeStep(step: any): Promise<void> {
    // Get lead
    const { data: lead } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', step.lead_id)
      .single();

    if (!lead) {
      await this.updateStepStatus(step.id, 'failed', 'Lead not found');
      return;
    }

    // Check if lead is still qualified for sequence
    if (lead.qualified || lead.status === 'converted') {
      await this.updateStepStatus(step.id, 'skipped', 'Lead already qualified/converted');
      return;
    }

    // Get sequence and step details
    const sequence = await this.getSequence(step.sequence_id);
    const stepConfig = sequence?.steps[step.step_order];

    if (!stepConfig) {
      await this.updateStepStatus(step.id, 'failed', 'Step config not found');
      return;
    }

    // Check conditions
    if (stepConfig.conditions && !this.checkConditions(lead, stepConfig.conditions)) {
      await this.updateStepStatus(step.id, 'skipped', 'Conditions not met');
      return;
    }

    // Send email
    await this.sendNurturingEmail(lead, stepConfig.emailTemplate, step.tenant_id);

    // Update step status
    await this.updateStepStatus(step.id, 'completed');

    // Schedule next step
    if (step.step_order + 1 < (sequence?.steps.length || 0)) {
      await this.scheduleNextStep(
        step.lead_id,
        step.sequence_id,
        step.step_order + 1,
        step.tenant_id
      );
    } else {
      // Sequence complete
      await this.completeSequence(step.lead_id, step.sequence_id);
    }
  }

  /**
   * Send nurturing email
   */
  private async sendNurturingEmail(
    lead: any,
    templateId: string,
    tenantId?: string
  ): Promise<void> {
    // Try to get template from our template library first
    let template = getTemplateById(templateId);
    
    // If not found, try database (for custom templates)
    if (!template) {
      const dbTemplate = await this.getEmailTemplate(templateId, tenantId);
      if (!dbTemplate) {
        throw new Error(`Template ${templateId} not found`);
      }
      
      // Use database template
      const personalized = this.personalizeEmail(dbTemplate, lead);
      
      // Send via email service
      const result = await emailService.send({
        to: lead.email,
        subject: personalized.subject,
        html: personalized.body,
        tags: ['nurturing', templateId],
        metadata: {
          leadId: lead.id,
          templateId,
          tenantId: tenantId || '',
        },
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      // Track event
      await this.trackEvent('nurturing_email_sent', {
        leadId: lead.id,
        templateId,
        tenantId,
        messageId: result.messageId,
      });

      return;
    }

    // Use template library template
    const variables = {
      firstName: lead.first_name || 'there',
      lastName: lead.last_name || '',
      email: lead.email || '',
      company: lead.company || 'your company',
      planName: lead.plan_name || 'Starter',
      automationName: lead.automation_name || '',
    };

    // Send via email service
    const result = await emailService.sendTemplate(templateId, lead.email, variables, {
      tags: ['nurturing', templateId],
      metadata: {
        leadId: lead.id,
        templateId,
        tenantId: tenantId || '',
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    // Track event
    await this.trackEvent('nurturing_email_sent', {
      leadId: lead.id,
      templateId,
      tenantId,
      messageId: result.messageId,
    });
  }

  /**
   * Personalize email (for database templates)
   */
  private personalizeEmail(template: any, lead: any): { subject: string; body: string } {
    let subject = template.subject || '';
    let body = template.body || '';

    // Replace placeholders
    const replacements: Record<string, string> = {
      '{{firstName}}': lead.first_name || 'there',
      '{{lastName}}': lead.last_name || '',
      '{{company}}': lead.company || 'your company',
      '{{email}}': lead.email || '',
    };

    for (const [key, value] of Object.entries(replacements)) {
      subject = subject.replace(new RegExp(key, 'g'), value);
      body = body.replace(new RegExp(key, 'g'), value);
    }

    return { subject, body };
  }

  /**
   * Schedule next step
   */
  private async scheduleNextStep(
    leadId: string,
    sequenceId: string,
    stepOrder: number,
    tenantId?: string
  ): Promise<void> {
    const sequence = await this.getSequence(sequenceId);
    const step = sequence?.steps[stepOrder];

    if (!step) return;

    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + step.delay);

    await this.supabase.from('nurturing_schedule').insert({
      lead_id: leadId,
      sequence_id: sequenceId,
      step_order: stepOrder,
      scheduled_at: scheduledAt.toISOString(),
      status: 'scheduled',
      tenant_id: tenantId,
    });
  }

  /**
   * Check conditions
   */
  private checkConditions(lead: any, conditions: Record<string, unknown>): boolean {
    // Simple condition checking - can be enhanced
    for (const [key, value] of Object.entries(conditions)) {
      if (lead[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get sequence
   */
  private async getSequence(sequenceId: string): Promise<NurturingSequence | null> {
    const { data } = await this.supabase
      .from('nurturing_sequences')
      .select('*')
      .eq('id', sequenceId)
      .single();

    return data as NurturingSequence | null;
  }

  /**
   * Get email template
   */
  private async getEmailTemplate(templateId: string, tenantId?: string): Promise<any> {
    let query = this.supabase.from('email_templates').select('*').eq('id', templateId).single();

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data } = await query;
    return data;
  }

  /**
   * Check existing sequence
   */
  private async checkExistingSequence(leadId: string, sequenceId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('nurturing_schedule')
      .select('id')
      .eq('lead_id', leadId)
      .eq('sequence_id', sequenceId)
      .in('status', ['scheduled', 'completed'])
      .limit(1);

    return (data?.length || 0) > 0;
  }

  /**
   * Enroll lead
   */
  private async enrollLead(leadId: string, sequenceId: string, tenantId?: string): Promise<void> {
    await this.supabase.from('nurturing_enrollments').insert({
      lead_id: leadId,
      sequence_id: sequenceId,
      enrolled_at: new Date().toISOString(),
      tenant_id: tenantId,
    });
  }

  /**
   * Update step status
   */
  private async updateStepStatus(
    stepId: string,
    status: string,
    reason?: string
  ): Promise<void> {
    await this.supabase
      .from('nurturing_schedule')
      .update({
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        failure_reason: reason || null,
      })
      .eq('id', stepId);
  }

  /**
   * Complete sequence
   */
  private async completeSequence(leadId: string, sequenceId: string): Promise<void> {
    await this.supabase
      .from('nurturing_enrollments')
      .update({
        completed_at: new Date().toISOString(),
      })
      .eq('lead_id', leadId)
      .eq('sequence_id', sequenceId);
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

export const leadNurturingService = new LeadNurturingService();
