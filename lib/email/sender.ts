/**
 * Email Sender Service
 * Handles sending emails via various providers (Resend, SendGrid, Mailgun)
 */

import { logger } from '@/lib/logging/structured-logger';
import { EmailTemplate } from './templates';

export interface EmailOptions {
  to: string;
  from?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Send email via Resend
 */
export async function sendEmailViaResend(
  options: EmailOptions,
  apiKey: string
): Promise<{ id: string; message: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || 'AIAS Platform <noreply@aias-platform.com>',
        to: options.to,
        reply_to: options.replyTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: typeof att.content === 'string' 
            ? att.content 
            : Buffer.from(att.content).toString('base64'),
          content_type: att.contentType,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Resend API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    logger.info('Email sent via Resend', { emailId: data.id, to: options.to });
    return { id: data.id, message: 'Email sent successfully' };
  } catch (error) {
    logger.error('Failed to send email via Resend', {
      error: error instanceof Error ? error.message : String(error),
      to: options.to,
    });
    throw error;
  }
}

/**
 * Send email via SendGrid
 */
export async function sendEmailViaSendGrid(
  options: EmailOptions,
  apiKey: string
): Promise<{ id: string; message: string }> {
  try {
    const formData = new FormData();
    formData.append('from', options.from || 'noreply@aias-platform.com');
    formData.append('to', options.to);
    if (options.replyTo) formData.append('reply_to', options.replyTo);
    formData.append('subject', options.subject);
    formData.append('html', options.html);
    formData.append('text', options.text);

    // Add attachments if any
    if (options.attachments) {
      for (const att of options.attachments) {
        const blob = typeof att.content === 'string'
          ? new Blob([att.content], { type: att.contentType || 'application/octet-stream' })
          : new Blob([att.content], { type: att.contentType || 'application/octet-stream' });
        formData.append('attachments', blob, att.filename);
      }
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`SendGrid API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const messageId = response.headers.get('x-message-id') || 'unknown';
    logger.info('Email sent via SendGrid', { messageId, to: options.to });
    return { id: messageId, message: 'Email sent successfully' };
  } catch (error) {
    logger.error('Failed to send email via SendGrid', {
      error: error instanceof Error ? error.message : String(error),
      to: options.to,
    });
    throw error;
  }
}

/**
 * Send email via Mailgun
 */
export async function sendEmailViaMailgun(
  options: EmailOptions,
  apiKey: string,
  domain: string
): Promise<{ id: string; message: string }> {
  try {
    const formData = new FormData();
    formData.append('from', options.from || `AIAS Platform <noreply@${domain}>`);
    formData.append('to', options.to);
    if (options.replyTo) formData.append('h:Reply-To', options.replyTo);
    formData.append('subject', options.subject);
    formData.append('html', options.html);
    formData.append('text', options.text);

    // Add attachments if any
    if (options.attachments) {
      for (const att of options.attachments) {
        const blob = typeof att.content === 'string'
          ? new Blob([att.content], { type: att.contentType || 'application/octet-stream' })
          : new Blob([att.content], { type: att.contentType || 'application/octet-stream' });
        formData.append('attachment', blob, att.filename);
      }
    }

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Mailgun API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    logger.info('Email sent via Mailgun', { messageId: data.id, to: options.to });
    return { id: data.id, message: 'Email sent successfully' };
  } catch (error) {
    logger.error('Failed to send email via Mailgun', {
      error: error instanceof Error ? error.message : String(error),
      to: options.to,
    });
    throw error;
  }
}

/**
 * Send email using configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<{ id: string; message: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const mailgunKey = process.env.MAILGUN_API_KEY;
  const mailgunDomain = process.env.MAILGUN_DOMAIN;

  // Try providers in order of preference
  if (resendKey) {
    return sendEmailViaResend(options, resendKey);
  }
  
  if (sendgridKey) {
    return sendEmailViaSendGrid(options, sendgridKey);
  }
  
  if (mailgunKey && mailgunDomain) {
    return sendEmailViaMailgun(options, mailgunKey, mailgunDomain);
  }

  throw new Error(
    'No email provider configured. Please set one of: RESEND_API_KEY, SENDGRID_API_KEY, or MAILGUN_API_KEY'
  );
}

/**
 * Send email from template
 */
export async function sendEmailFromTemplate(
  template: EmailTemplate,
  to: string,
  options?: {
    from?: string;
    replyTo?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>;
  }
): Promise<{ id: string; message: string }> {
  return sendEmail({
    to,
    from: options?.from,
    replyTo: options?.replyTo,
    subject: template.subject,
    html: template.html,
    text: template.text,
    attachments: options?.attachments,
  });
}
