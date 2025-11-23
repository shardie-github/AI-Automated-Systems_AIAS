/**
 * CRM Integration System
 * Sync leads and deals with external CRM systems
 */

import { logger } from '@/lib/logging/structured-logger';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { withCircuitBreaker } from '@/lib/resilience/circuit-breaker';

export interface CRMConfig {
  provider: 'salesforce' | 'hubspot' | 'pipedrive' | 'custom';
  apiKey: string;
  apiUrl?: string;
  tenantId?: string;
}

export interface CRMLead {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  source?: string;
  score?: number;
  status?: string;
}

class CRMIntegrationService {
  private supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

  /**
   * Sync lead to CRM
   */
  async syncLeadToCRM(
    leadId: string,
    crmConfig: CRMConfig,
    tenantId?: string
  ): Promise<{ success: boolean; crmId?: string; error?: string }> {
    try {
      // Get lead data
      const lead = await this.getLead(leadId, tenantId);
      if (!lead) {
        throw new Error('Lead not found');
      }

      // Convert to CRM format
      const crmLead = this.convertToCRMFormat(lead);

      // Sync based on provider
      let result;
      switch (crmConfig.provider) {
        case 'salesforce':
          result = await this.syncToSalesforce(crmLead, crmConfig);
          break;
        case 'hubspot':
          result = await this.syncToHubspot(crmLead, crmConfig);
          break;
        case 'pipedrive':
          result = await this.syncToPipedrive(crmLead, crmConfig);
          break;
        default:
          result = await this.syncToCustom(crmLead, crmConfig);
      }

      // Update lead with CRM ID
      if (result.success && result.crmId) {
        await this.updateLeadCRMId(leadId, result.crmId, crmConfig.provider, tenantId);
      }

      // Track sync
      await this.trackSync(leadId, crmConfig.provider, result.success, tenantId);

      return result;
    } catch (error) {
      logger.error('CRM sync failed', error instanceof Error ? error : new Error(String(error)), {
        leadId,
        provider: crmConfig.provider,
        tenantId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Sync to Salesforce
   */
  private async syncToSalesforce(
    lead: CRMLead,
    config: CRMConfig
  ): Promise<{ success: boolean; crmId?: string; error?: string }> {
    return withCircuitBreaker(
      'salesforce',
      async () => {
        const response = await fetch(`${config.apiUrl || 'https://api.salesforce.com'}/services/data/v57.0/sobjects/Lead`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Email: lead.email,
            FirstName: lead.firstName,
            LastName: lead.lastName,
            Company: lead.company,
            Phone: lead.phone,
            LeadSource: lead.source,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(`Salesforce API error: ${response.status} - ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        return {
          success: true,
          crmId: data.id,
        };
      },
      async () => ({
        success: false,
        error: 'Salesforce service unavailable',
      })
    );
  }

  /**
   * Sync to HubSpot
   */
  private async syncToHubspot(
    lead: CRMLead,
    config: CRMConfig
  ): Promise<{ success: boolean; crmId?: string; error?: string }> {
    return withCircuitBreaker(
      'hubspot',
      async () => {
        const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              email: lead.email,
              firstname: lead.firstName,
              lastname: lead.lastName,
              company: lead.company,
              phone: lead.phone,
              hs_lead_status: lead.status || 'NEW',
            },
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(`HubSpot API error: ${response.status} - ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        return {
          success: true,
          crmId: data.id,
        };
      },
      async () => ({
        success: false,
        error: 'HubSpot service unavailable',
      })
    );
  }

  /**
   * Sync to Pipedrive
   */
  private async syncToPipedrive(
    lead: CRMLead,
    config: CRMConfig
  ): Promise<{ success: boolean; crmId?: string; error?: string }> {
    return withCircuitBreaker(
      'pipedrive',
      async () => {
        const response = await fetch(`https://api.pipedrive.com/v1/persons?api_token=${config.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: [{ value: lead.email, primary: true }],
            name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
            org_name: lead.company,
            phone: [{ value: lead.phone || '', primary: true }],
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(`Pipedrive API error: ${response.status} - ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        return {
          success: true,
          crmId: data.data?.id?.toString(),
        };
      },
      async () => ({
        success: false,
        error: 'Pipedrive service unavailable',
      })
    );
  }

  /**
   * Sync to custom CRM
   */
  private async syncToCustom(
    lead: CRMLead,
    config: CRMConfig
  ): Promise<{ success: boolean; crmId?: string; error?: string }> {
    if (!config.apiUrl) {
      return {
        success: false,
        error: 'Custom CRM API URL required',
      };
    }

    return withCircuitBreaker(
      'custom-crm',
      async () => {
        const response = await fetch(config.apiUrl!, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lead),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(`Custom CRM API error: ${response.status} - ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        return {
          success: true,
          crmId: data.id || data.crmId,
        };
      },
      async () => ({
        success: false,
        error: 'Custom CRM service unavailable',
      })
    );
  }

  /**
   * Convert lead to CRM format
   */
  private convertToCRMFormat(lead: any): CRMLead {
    return {
      email: lead.email,
      firstName: lead.first_name,
      lastName: lead.last_name,
      company: lead.company,
      phone: lead.phone,
      source: lead.source,
      score: lead.score,
      status: lead.status,
    };
  }

  /**
   * Get lead
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
   * Update lead CRM ID
   */
  private async updateLeadCRMId(
    leadId: string,
    crmId: string,
    provider: string,
    tenantId?: string
  ): Promise<void> {
    await this.supabase
      .from('leads')
      .update({
        crm_id: crmId,
        crm_provider: provider,
        crm_synced_at: new Date().toISOString(),
      })
      .eq('id', leadId);
  }

  /**
   * Track sync
   */
  private async trackSync(
    leadId: string,
    provider: string,
    success: boolean,
    tenantId?: string
  ): Promise<void> {
    await this.supabase.from('crm_sync_log').insert({
      lead_id: leadId,
      provider,
      success,
      synced_at: new Date().toISOString(),
      tenant_id: tenantId,
    });
  }

  /**
   * Batch sync leads
   */
  async batchSyncLeads(
    leadIds: string[],
    crmConfig: CRMConfig,
    tenantId?: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const leadId of leadIds) {
      try {
        const result = await this.syncLeadToCRM(leadId, crmConfig, tenantId);
        if (result.success) {
          success++;
        } else {
          failed++;
          errors.push(`${leadId}: ${result.error}`);
        }
      } catch (error) {
        failed++;
        errors.push(`${leadId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return { success, failed, errors };
  }
}

export const crmIntegrationService = new CRMIntegrationService();
