/**
 * Lead Capture API Endpoint
 */

import { NextResponse } from 'next/server';
import { createPOSTHandler } from '@/lib/api/route-handler';
import { leadCaptureService } from '@/lib/lead-generation/lead-capture';
import { z } from 'zod';

const leadCaptureSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  source: z.string().optional(),
  campaign: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const POST = createPOSTHandler(
  async (context) => {
    const body = await context.request.json();
    const validated = leadCaptureSchema.parse(body);
    
    const tenantId = context.tenantId || context.request.headers.get('x-tenant-id') || undefined;
    
    const result = await leadCaptureService.captureLead(validated, tenantId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to capture lead' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      leadId: result.leadId,
      score: result.score,
      qualified: result.qualified,
      nextAction: result.nextAction,
    });
  },
  {
    validateBody: leadCaptureSchema,
    maxBodySize: 10240, // 10KB
  }
);
