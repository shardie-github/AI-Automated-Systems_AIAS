/**
 * CRM Sync API Endpoint
 */

import { NextResponse } from 'next/server';
import { createPOSTHandler } from '@/lib/api/route-handler';
import { crmIntegrationService } from '@/lib/lead-generation/crm-integration';
import { z } from 'zod';

const crmSyncSchema = z.object({
  leadId: z.string().uuid(),
  provider: z.enum(['salesforce', 'hubspot', 'pipedrive', 'custom']),
  apiKey: z.string(),
  apiUrl: z.string().optional(),
});

export const POST = createPOSTHandler(
  async (context) => {
    const body = crmSyncSchema.parse(await context.request.json());
    const tenantId = context.tenantId || undefined;
    
    const result = await crmIntegrationService.syncLeadToCRM(
      body.leadId,
      {
        provider: body.provider,
        apiKey: body.apiKey,
        apiUrl: body.apiUrl,
      },
      tenantId
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'CRM sync failed' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(result);
  },
  {
    requireAuth: true,
    validateBody: crmSyncSchema,
  }
);
