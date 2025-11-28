/**
 * Email Templates API
 * List and get email templates
 */

import { NextResponse } from 'next/server';
import { createGETHandler } from '@/lib/api/route-handler';
import { emailTemplates, getTemplateById, getTemplatesByStage, getTemplatesByCategory } from '@/lib/email-templates';
import { z } from 'zod';

const querySchema = z.object({
  stage: z.enum(['awareness', 'consideration', 'decision', 'onboarding', 'retention', 'reengagement']).optional(),
  category: z.string().optional(),
  id: z.string().optional(),
});

export const GET = createGETHandler(async (context) => {
  const query = querySchema.parse(Object.fromEntries(context.request.url.split('?')[1]?.split('&').map(p => p.split('=')) || []));

  // Get by ID
  if (query.id) {
    const template = getTemplateById(query.id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ template });
  }

  // Get by stage
  if (query.stage) {
    const templates = getTemplatesByStage(query.stage);
    return NextResponse.json({ templates, count: templates.length });
  }

  // Get by category
  if (query.category) {
    const templates = getTemplatesByCategory(query.category);
    return NextResponse.json({ templates, count: templates.length });
  }

  // Get all templates
  return NextResponse.json({
    templates: emailTemplates,
    count: emailTemplates.length,
    stages: ['awareness', 'consideration', 'decision', 'onboarding', 'retention', 'reengagement'],
    categories: Array.from(new Set(emailTemplates.map(t => t.category))),
  });
});
