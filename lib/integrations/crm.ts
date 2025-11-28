/**
 * CRM Integration
 * Provides integration with various CRM systems (HubSpot, Salesforce, etc.)
 */

import { logger } from '@/lib/logging/structured-logger';

export interface CRMContact {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  source?: string;
}

export interface CRMLead extends CRMContact {
  leadScore?: number;
  status?: string;
  assignedTo?: string;
}

/**
 * HubSpot CRM Integration
 */
export class HubSpotCRM {
  constructor(private apiKey: string) {}

  async createContact(contact: CRMContact): Promise<string> {
    try {
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            firstname: contact.firstName,
            lastname: contact.lastName,
            email: contact.email,
            phone: contact.phone || '',
            company: contact.company || '',
            notes: contact.notes || '',
            hs_lead_status: contact.source || 'WEB',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HubSpot API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      logger.info('HubSpot contact created', { contactId: data.id, email: contact.email });
      return data.id;
    } catch (error) {
      const errorObj: Error = (error as any) instanceof Error ? (error as Error) : new Error(String(error));
      logger.error('Failed to create HubSpot contact', errorObj, {
        email: contact.email,
      });
      throw error;
    }
  }

  async createLead(lead: CRMLead): Promise<string> {
    try {
      // Create contact first
      const contactId = await this.createContact(lead);

      // Create deal/lead if needed
      if (lead.leadScore || lead.status) {
        const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              dealname: `${lead.firstName} ${lead.lastName} - ${lead.company || 'Lead'}`,
              dealstage: lead.status || 'appointmentscheduled',
              amount: lead.leadScore ? lead.leadScore * 100 : undefined,
              pipeline: 'default',
            },
            associations: [
              {
                to: { id: contactId },
                types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
              },
            ],
          }),
        });

        if (response.ok) {
          const deal = await response.json();
          logger.info('HubSpot deal created', { dealId: deal.id, contactId });
          return deal.id;
        }
      }

      return contactId;
    } catch (error) {
      const errorObj: Error = (error as any) instanceof Error ? (error as Error) : new Error(String(error));
      logger.error('Failed to create HubSpot lead', errorObj, {
        email: lead.email,
      });
      throw error;
    }
  }
}

/**
 * Salesforce CRM Integration
 */
export class SalesforceCRM {
  constructor(
    private clientId: string,
    private clientSecret: string,
    private username: string,
    private password: string,
    private securityToken: string,
    private instanceUrl?: string
  ) {}

  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          username: this.username,
          password: `${this.password}${this.securityToken}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Salesforce auth error: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      const errorObj: Error = (error as any) instanceof Error ? (error as Error) : new Error(String(error));
      logger.error('Failed to get Salesforce access token', errorObj);
      throw error;
    }
  }

  async createContact(contact: CRMContact): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();
      const baseUrl = this.instanceUrl || 'https://yourinstance.salesforce.com';

      const response = await fetch(`${baseUrl}/services/data/v57.0/sobjects/Contact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FirstName: contact.firstName,
          LastName: contact.lastName,
          Email: contact.email,
          Phone: contact.phone || '',
          Company__c: contact.company || '',
          Description: contact.notes || '',
          LeadSource: contact.source || 'Web',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Salesforce API error: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      logger.info('Salesforce contact created', { contactId: data.id, email: contact.email });
      return data.id;
    } catch (error) {
      const errorObj: Error = (error as any) instanceof Error ? (error as Error) : new Error(String(error));
      logger.error('Failed to create Salesforce contact', errorObj, {
        email: contact.email,
      });
      throw error;
    }
  }
}

/**
 * Factory function to create CRM client based on provider
 */
export function createCRMClient(provider: 'hubspot' | 'salesforce', config: Record<string, string>) {
  switch (provider) {
    case 'hubspot':
      return new HubSpotCRM(config.apiKey);
    case 'salesforce':
      return new SalesforceCRM(
        config.clientId,
        config.clientSecret,
        config.username,
        config.password,
        config.securityToken,
        config.instanceUrl
      );
    default:
      throw new Error(`Unsupported CRM provider: ${provider}`);
  }
}
