/**
 * Conversion Tracking API Endpoint
 */

import { NextResponse } from 'next/server';
import { createPOSTHandler } from '@/lib/api/route-handler';
import { conversionTrackingService } from '@/lib/lead-generation/conversion-tracking';
import { z } from 'zod';

const conversionSchema = z.object({
  leadId: z.string().uuid(),
  type: z.enum(['signup', 'trial', 'purchase', 'demo', 'download', 'custom']),
  value: z.number().optional(),
  currency: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const POST = createPOSTHandler(
  async (context) => {
    const body = conversionSchema.parse(await context.request.json());
    const tenantId = context.tenantId || undefined;
    
    await conversionTrackingService.trackConversion(body, tenantId);
    
    return NextResponse.json({ success: true });
  },
  {
    requireAuth: true,
    validateBody: conversionSchema,
  }
);
