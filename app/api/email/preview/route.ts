/**
 * Email Preview API
 * Preview email templates with variables
 */

import { createPOSTHandler } from '@/lib/api/route-handler';
import { getTemplateById, replaceTemplateVariables } from '@/lib/email-templates';
import { z } from 'zod';

const previewSchema = z.object({
  templateId: z.string(),
  variables: z.record(z.string()).optional().default({}),
});

export const POST = createPOSTHandler(async (context) => {
  const body = previewSchema.parse(await context.request.json());
  const { templateId, variables } = body;

  const template = getTemplateById(templateId);
  if (!template) {
    return Response.json({ error: 'Template not found' }, { status: 404 });
  }

  const subject = replaceTemplateVariables(template.subject, variables);
  const html = replaceTemplateVariables(template.body, variables);
  const text = template.textBody ? replaceTemplateVariables(template.textBody, variables) : undefined;

  return Response.json({
    template: {
      id: template.id,
      name: template.name,
      stage: template.stage,
      category: template.category,
    },
    preview: {
      subject,
      html,
      text,
    },
  });
});
