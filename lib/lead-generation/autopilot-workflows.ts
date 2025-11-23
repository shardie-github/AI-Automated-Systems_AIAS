/**
 * Autopilot Workflows System
 * Automated workflows for lead generation and nurturing
 */

import { logger } from '@/lib/logging/structured-logger';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { leadCaptureService } from './lead-capture';
import { leadScoringService } from './lead-scoring';
import { leadNurturingService } from './lead-nurturing';
import { crmIntegrationService } from './crm-integration';
import { conversionTrackingService } from './conversion-tracking';
import { emailService } from '@/lib/email/email-service';

export interface AutopilotWorkflow {
  id: string;
  name: string;
  trigger: 'lead_captured' | 'lead_scored' | 'lead_qualified' | 'lead_unqualified' | 'conversion' | 'schedule';
  conditions?: Record<string, unknown>;
  actions: WorkflowAction[];
  enabled: boolean;
}

export interface WorkflowAction {
  type: 'send_email' | 'assign_to_sales' | 'sync_crm' | 'start_nurturing' | 'update_score' | 'notify';
  config: Record<string, unknown>;
  delay?: number; // Seconds
}

class AutopilotWorkflowService {
  private supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  /**
   * Execute workflow for event
   */
  async executeWorkflows(
    trigger: string,
    context: Record<string, unknown>,
    tenantId?: string
  ): Promise<void> {
    try {
      // Get enabled workflows for trigger
      let query = this.supabase
        .from('autopilot_workflows')
        .select('*')
        .eq('trigger', trigger)
        .eq('enabled', true);

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data: workflows } = await query;

      if (!workflows || workflows.length === 0) {
        return;
      }

      // Execute each workflow
      for (const workflow of workflows) {
        try {
          // Check conditions
          if (workflow.conditions && !this.checkConditions(context, workflow.conditions)) {
            continue;
          }

          // Execute actions
          await this.executeActions(workflow.actions, context, tenantId);

          // Log execution
          await this.logWorkflowExecution(workflow.id, context, tenantId);
        } catch (error) {
          logger.error('Workflow execution failed', error instanceof Error ? error : new Error(String(error)), {
            workflowId: workflow.id,
            trigger,
            tenantId,
          });
        }
      }
    } catch (error) {
      logger.error('Workflow execution error', error instanceof Error ? error : new Error(String(error)), {
        trigger,
        tenantId,
      });
    }
  }

  /**
   * Execute workflow actions
   */
  private async executeActions(
    actions: WorkflowAction[],
    context: Record<string, unknown>,
    tenantId?: string
  ): Promise<void> {
    for (const action of actions) {
      // Apply delay if specified
      if (action.delay && action.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, action.delay * 1000));
      }

      try {
        switch (action.type) {
          case 'send_email':
            await this.executeSendEmail(action.config, context, tenantId);
            break;
          case 'assign_to_sales':
            await this.executeAssignToSales(action.config, context, tenantId);
            break;
          case 'sync_crm':
            await this.executeSyncCRM(action.config, context, tenantId);
            break;
          case 'start_nurturing':
            await this.executeStartNurturing(action.config, context, tenantId);
            break;
          case 'update_score':
            await this.executeUpdateScore(action.config, context, tenantId);
            break;
          case 'notify':
            await this.executeNotify(action.config, context, tenantId);
            break;
        }
      } catch (error) {
        logger.error('Action execution failed', error instanceof Error ? error : new Error(String(error)), {
          actionType: action.type,
          context,
        });
      }
    }
  }

  /**
   * Execute send email action
   */
  private async executeSendEmail(
    config: Record<string, unknown>,
    context: Record<string, unknown>,
    tenantId?: string
  ): Promise<void> {
    const templateId = config.template as string;
    const leadId = context.leadId as string;
    const email = (context.email as string) || undefined;

    if (!templateId || (!leadId && !email)) {
      throw new Error('Template ID and Lead ID or email required for send_email action');
    }

    // Get lead if leadId provided
    let lead: any = null;
    if (leadId) {
      const { data } = await this.supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (!data) {
        throw new Error('Lead not found');
      }
      lead = data;
    }

    // Prepare variables
    const variables: Record<string, string> = {
      firstName: lead?.first_name || (context.firstName as string) || 'there',
      lastName: lead?.last_name || (context.lastName as string) || '',
      email: lead?.email || email || '',
      company: lead?.company || (context.company as string) || 'your company',
      planName: lead?.plan_name || (context.planName as string) || 'Starter',
      automationName: lead?.automation_name || (context.automationName as string) || '',
      score: String(context.score || lead?.score || 0),
      qualified: String(context.qualified || lead?.qualified || false),
    };

    // Send email via email service
    const recipientEmail = lead?.email || email;
    if (!recipientEmail) {
      throw new Error('No email address available');
    }

    const result = await emailService.sendTemplate(templateId, recipientEmail, variables, {
      tags: ['autopilot', templateId],
      metadata: {
        leadId: leadId || '',
        templateId,
        tenantId: tenantId || '',
        workflowTrigger: (context.trigger as string) || '',
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    logger.info('Autopilot email sent', {
      templateId,
      leadId,
      email: recipientEmail,
      messageId: result.messageId,
      tenantId,
    });
  }

  /**
   * Execute assign to sales action
   */
  private async executeAssignToSales(
    config: Record<string, unknown>,
    context: Record<string, unknown>,
    tenantId?: string
  ): Promise<void> {
    const leadId = context.leadId as string;
    const salesTeamId = config.teamId as string || config.userId as string;

    if (!leadId) {
      throw new Error('Lead ID required for assign_to_sales action');
    }

    // Update lead assignment
    await this.supabase
      .from('leads')
      .update({
        assigned_to: salesTeamId,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      })
      .eq('id', leadId);
  }

  /**
   * Execute sync CRM action
   */
  private async executeSyncCRM(
    config: Record<string, unknown>,
    context: Record<string, unknown>,
    tenantId?: string
  ): Promise<void> {
    const leadId = context.leadId as string;
    const provider = config.provider as string;
    const apiKey = config.apiKey as string;
    const apiUrl = config.apiUrl as string | undefined;

    if (!leadId || !provider || !apiKey) {
      throw new Error('Lead ID, provider, and API key required for sync_crm action');
    }

    await crmIntegrationService.syncLeadToCRM(
      leadId,
      { provider: provider as any, apiKey, apiUrl },
      tenantId
    );
  }

  /**
   * Execute start nurturing action
   */
  private async executeStartNurturing(
    config: Record<string, unknown>,
    context: Record<string, unknown>,
    tenantId?: string
  ): Promise<void> {
    const leadId = context.leadId as string;
    const sequenceId = config.sequenceId as string;

    if (!leadId || !sequenceId) {
      throw new Error('Lead ID and sequence ID required for start_nurturing action');
    }

    await leadNurturingService.startNurturingSequence(leadId, sequenceId, tenantId);
  }

  /**
   * Execute update score action
   */
  private async executeUpdateScore(
    config: Record<string, unknown>,
    context: Record<string, unknown>,
    tenantId?: string
  ): Promise<void> {
    const leadId = context.leadId as string;

    if (!leadId) {
      throw new Error('Lead ID required for update_score action');
    }

    await leadScoringService.calculateScore(leadId, tenantId);
  }

  /**
   * Execute notify action
   */
  private async executeNotify(
    config: Record<string, unknown>,
    context: Record<string, unknown>,
    tenantId?: string
  ): Promise<void> {
    const message = config.message as string;
    const channel = config.channel as string || 'email';
    const recipient = config.recipient as string;

    if (!message || !recipient) {
      throw new Error('Message and recipient required for notify action');
    }

    // Create notification
    await this.supabase.from('notifications').insert({
      recipient_id: recipient,
      message,
      channel,
      tenant_id: tenantId,
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Check conditions
   */
  private checkConditions(context: Record<string, unknown>, conditions: Record<string, unknown>): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      if (context[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Log workflow execution
   */
  private async logWorkflowExecution(
    workflowId: string,
    context: Record<string, unknown>,
    tenantId?: string
  ): Promise<void> {
    await this.supabase.from('workflow_executions').insert({
      workflow_id: workflowId,
      context,
      executed_at: new Date().toISOString(),
      tenant_id: tenantId,
    });
  }

  /**
   * Create workflow
   */
  async createWorkflow(workflow: AutopilotWorkflow, tenantId?: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('autopilot_workflows')
      .insert({
        name: workflow.name,
        trigger: workflow.trigger,
        conditions: workflow.conditions || {},
        actions: workflow.actions,
        enabled: workflow.enabled,
        tenant_id: tenantId,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Update workflow
   */
  async updateWorkflow(
    workflowId: string,
    updates: Partial<AutopilotWorkflow>,
    tenantId?: string
  ): Promise<void> {
    let query = this.supabase
      .from('autopilot_workflows')
      .update(updates)
      .eq('id', workflowId);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { error } = await query;
    if (error) throw error;
  }
}

export const autopilotWorkflowService = new AutopilotWorkflowService();
