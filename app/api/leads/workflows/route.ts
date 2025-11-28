/**
 * Autopilot Workflows API Endpoint
 */

import { NextResponse } from 'next/server';
import { createPOSTHandler, createGETHandler } from '@/lib/api/route-handler';
import { autopilotWorkflowService } from '@/lib/lead-generation/autopilot-workflows';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const createWorkflowSchema = z.object({
  name: z.string(),
  trigger: z.enum(['lead_captured', 'lead_scored', 'lead_qualified', 'lead_unqualified', 'conversion', 'schedule']),
  conditions: z.record(z.unknown()).optional(),
  actions: z.array(z.object({
    type: z.enum(['send_email', 'assign_to_sales', 'sync_crm', 'start_nurturing', 'update_score', 'notify']),
    config: z.record(z.unknown()),
    delay: z.number().optional(),
  })),
  enabled: z.boolean().default(true),
});

export const POST = createPOSTHandler(
  async (context) => {
    const body = createWorkflowSchema.parse(await context.request.json());
    const tenantId = context.tenantId || undefined;
    
    const workflowId = await autopilotWorkflowService.createWorkflow(body as any, tenantId);
    
    return NextResponse.json({ success: true, workflowId });
  },
  {
    requireAuth: true,
    validateBody: createWorkflowSchema,
  }
);

export const GET = createGETHandler(
  async (context) => {
    const tenantId = context.tenantId || undefined;
    
    // Get workflows for tenant
    const { data: workflows } = await createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
      .from('autopilot_workflows')
      .select('*')
      .eq('tenant_id', tenantId || '')
      .order('created_at', { ascending: false });
    
    return NextResponse.json({ workflows: workflows || [] });
  },
  {
    requireAuth: true,
    cacheable: true,
    cacheTTL: 60, // 1 minute
  }
);
