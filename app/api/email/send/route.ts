/**
 * Email Sending API
 * Send emails using templates
 */

import { createPOSTHandler } from '@/lib/api/route-handler';
import { emailService } from '@/lib/email/email-service';
import { z } from 'zod';

const sendEmailSchema = z.object({
  templateId: z.string(),
  to: z.string().email(),
  variables: z.record(z.string()).optional().default({}),
  options: z
    .object({
      from: z.string().email().optional(),
      replyTo: z.string().email().optional(),
      cc: z.array(z.string().email()).optional(),
      bcc: z.array(z.string().email()).optional(),
      tags: z.array(z.string()).optional(),
      metadata: z.record(z.string()).optional(),
    })
    .optional(),
});

export const POST = createPOSTHandler(async (context) => {
  const body = sendEmailSchema.parse(await context.request.json());
  const { templateId, to, variables, options } = body;

  const result = await emailService.sendTemplate(templateId, to, variables || {}, options);

  if (!result.success) {
    return Response.json(
      {
        success: false,
        error: result.error || 'Failed to send email',
      },
      { status: 500 }
    );
  }

  return Response.json({
    success: true,
    messageId: result.messageId,
  });
});
