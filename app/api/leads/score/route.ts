/**
 * Lead Scoring API Endpoint
 */

import { NextResponse } from 'next/server';
import { createPOSTHandler } from '@/lib/api/route-handler';
import { leadScoringService } from '@/lib/lead-generation/lead-scoring';
import { z } from 'zod';

const scoreLeadSchema = z.object({
  leadId: z.string().uuid(),
});

export const POST = createPOSTHandler(
  async (context) => {
    const body = scoreLeadSchema.parse(await context.request.json());
    const tenantId = context.tenantId || undefined;
    
    const score = await leadScoringService.calculateScore(body.leadId, tenantId);
    
    return NextResponse.json(score);
  },
  {
    requireAuth: true,
    validateBody: scoreLeadSchema,
  }
);
