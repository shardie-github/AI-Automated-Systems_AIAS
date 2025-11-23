/**
 * Email Service
 * Handles email sending with multiple provider support
 */

import { logger } from '@/lib/logging/structured-logger';
import { env } from '@/lib/env';
import { getTemplateById, replaceTemplateVariables, EmailTemplate } from '@/lib/email-templates';

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  tags?: string[];
  metadata?: Record<string, string>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private provider: 'resend' | 'sendgrid' | 'smtp' = 'resend';
  private fromEmail: string;
  private fromName: string;

  constructor() {
    // Determine provider from env
    if (env.resend?.apiKey) {
      this.provider = 'resend';
    } else if (env.sendgrid?.apiKey) {
      this.provider = 'sendgrid';
    } else if (env.smtp?.host) {
      this.provider = 'smtp';
    }

    this.fromEmail = env.email?.fromEmail || 'noreply@aias-platform.com';
    this.fromName = env.email?.fromName || 'AIAS Platform';
  }

  /**
   * Send email using template
   */
  async sendTemplate(
    templateId: string,
    to: string,
    variables: Record<string, string>,
    options?: Partial<EmailOptions>
  ): Promise<EmailResult> {
    const template = getTemplateById(templateId);
    if (!template) {
      logger.error('Email template not found', new Error(`Template ${templateId} not found`), { templateId });
      return {
        success: false,
        error: `Template ${templateId} not found`,
      };
    }

    const subject = replaceTemplateVariables(template.subject, variables);
    const html = replaceTemplateVariables(template.body, variables);
    const text = template.textBody ? replaceTemplateVariables(template.textBody, variables) : undefined;

    return this.send({
      to,
      subject,
      html,
      text,
      ...options,
    });
  }

  /**
   * Send email
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      switch (this.provider) {
        case 'resend':
          return await this.sendViaResend(options);
        case 'sendgrid':
          return await this.sendViaSendGrid(options);
        case 'smtp':
          return await this.sendViaSMTP(options);
        default:
          throw new Error('No email provider configured');
      }
    } catch (error) {
      logger.error('Failed to send email', error instanceof Error ? error : new Error(String(error)), {
        to: options.to,
        subject: options.subject,
        provider: this.provider,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Send via Resend
   */
  private async sendViaResend(options: EmailOptions): Promise<EmailResult> {
    if (!env.resend?.apiKey) {
      throw new Error('Resend API key not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.resend.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || `${this.fromName} <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
        tags: options.tags,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await response.json();
    logger.info('Email sent via Resend', { messageId: data.id, to: options.to });

    return {
      success: true,
      messageId: data.id,
    };
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(options: EmailOptions): Promise<EmailResult> {
    if (!env.sendgrid?.apiKey) {
      throw new Error('SendGrid API key not configured');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.sendgrid.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: options.from || this.fromEmail,
          name: this.fromName,
        },
        personalizations: [
          {
            to: [{ email: options.to }],
            cc: options.cc?.map(email => ({ email })),
            bcc: options.bcc?.map(email => ({ email })),
            subject: options.subject,
          },
        ],
        content: [
          {
            type: 'text/html',
            value: options.html || '',
          },
          ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
        ],
        reply_to: options.replyTo ? { email: options.replyTo } : undefined,
        categories: options.tags,
        custom_args: options.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid API error: ${error}`);
    }

    logger.info('Email sent via SendGrid', { to: options.to });

    return {
      success: true,
      messageId: response.headers.get('x-message-id') || undefined,
    };
  }

  /**
   * Send via SMTP
   */
  private async sendViaSMTP(options: EmailOptions): Promise<EmailResult> {
    if (!env.smtp?.host) {
      throw new Error('SMTP not configured');
    }

    // For SMTP, we'd use nodemailer or similar
    // This is a placeholder - implement based on your SMTP provider
    logger.warn('SMTP sending not fully implemented', { to: options.to });

    // In production, use nodemailer:
    // const transporter = nodemailer.createTransport({...});
    // const info = await transporter.sendMail({...});

    return {
      success: false,
      error: 'SMTP sending not implemented',
    };
  }

  /**
   * Send bulk emails
   */
  async sendBulk(
    templateId: string,
    recipients: Array<{ email: string; variables: Record<string, string> }>,
    options?: Partial<EmailOptions>
  ): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    // Send in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(recipient =>
          this.sendTemplate(templateId, recipient.email, recipient.variables, options)
        )
      );
      results.push(...batchResults);

      // Rate limiting delay
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Validate email address
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const emailService = new EmailService();
