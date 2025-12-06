/**
 * Email Cadence Scheduler
 * Handles scheduling and sending lifecycle emails based on user events and dates
 */

import { emailService } from '@/lib/email/email-service';
import { logger } from '@/lib/logging/structured-logger';
import { renderTemplate } from '@/lib/email-templates/template-engine';
import { readFileSync } from 'fs';
import { join } from 'path';

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  planName?: string;
  trialStartDate?: Date;
  trialEndDate?: Date;
  workflowCount?: number;
  integrationCount?: number;
  automationCount?: number;
  timeSavedHours?: number;
  industry?: string;
  userGoals?: string[];
  interests?: string[];
}

interface EmailTemplate {
  id: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Load email template from file system
 */
function loadEmailTemplate(templatePath: string): string {
  try {
    const fullPath = join(process.cwd(), 'emails', templatePath);
    return readFileSync(fullPath, 'utf-8');
  } catch (error) {
    logger.error('Failed to load email template', error instanceof Error ? error : new Error(String(error)), {
      templatePath,
    });
    throw error;
  }
}

/**
 * Load shared email components
 */
function loadEmailComponents(): Record<string, string> {
  const components: Record<string, string> = {};
  
  try {
    components.header = loadEmailTemplate('shared/components/header.html');
    components.footer = loadEmailTemplate('shared/components/footer.html');
    components.button = loadEmailTemplate('shared/components/button.html');
    components.layout = loadEmailTemplate('shared/components/layout.html');
  } catch (error) {
    logger.warn('Failed to load some email components', error instanceof Error ? error : new Error(String(error)));
  }
  
  return components;
}

/**
 * Calculate days since trial start
 */
function getTrialDays(user: UserData): number {
  if (!user.trialStartDate) return 0;
  const now = new Date();
  const start = new Date(user.trialStartDate);
  const diffTime = now.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days until trial end
 */
function getTrialDaysRemaining(user: UserData): number {
  if (!user.trialEndDate) return 0;
  const now = new Date();
  const end = new Date(user.trialEndDate);
  const diffTime = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Send welcome email (Day 0) - Enhanced with new template
 */
export async function sendTrialWelcomeEmail(user: UserData): Promise<boolean> {
  try {
    // Use new welcome email function from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseServiceKey && supabaseUrl) {
      const response = await fetch(`${supabaseUrl}/functions/v1/welcome-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
        }),
      });
      
      if (response.ok) {
        logger.info('Welcome email sent via function', { userId: user.id });
        return true;
      }
    }
    
    // Fallback to original implementation
  try {
    const template = loadEmailTemplate('lifecycle/trial_welcome.html');
    const components = loadEmailComponents();
    
    const variables = {
      user: {
        first_name: user.firstName || 'there',
        last_name: user.lastName || '',
        email: user.email,
        plan_name: user.planName || 'Trial',
        trial_days_left: getTrialDaysRemaining(user),
        workflow_count: user.workflowCount || 0,
        integration_count: user.integrationCount || 0,
        automation_count: user.automationCount || 0,
        time_saved_hours: user.timeSavedHours || 0,
      },
      product: {
        product_name: 'AIAS Platform',
        site_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca',
      },
      urls: {
        dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/dashboard`,
        upgrade_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/pricing?utm_source=email&utm_campaign=trial_welcome`,
        help_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/help`,
      },
    };

    const html = renderTemplate(template, variables, components);
    const subject = `Welcome to AIAS Platform! Here's how to get value in 10 minutes`;

    const result = await emailService.send({
      to: user.email,
      subject,
      html,
      tags: ['trial', 'welcome', 'onboarding'],
      metadata: {
        user_id: user.id,
        email_type: 'trial_welcome',
        trial_day: '0',
      },
    });

    if (result.success) {
      logger.info('Trial welcome email sent', { userId: user.id, email: user.email });
    } else {
      logger.error('Failed to send trial welcome email', new Error(result.error || 'Unknown error'), {
        userId: user.id,
        email: user.email,
      });
    }

    return result.success;
  } catch (error) {
    logger.error('Error sending trial welcome email', error instanceof Error ? error : new Error(String(error)), {
      userId: user.id,
      email: user.email,
    });
    return false;
  }
}

/**
 * Send trial day 7 email
 */
export async function sendTrialDay7Email(user: UserData): Promise<boolean> {
  try {
    const template = loadEmailTemplate('lifecycle/trial_day7.html');
    const components = loadEmailComponents();
    
    const variables = {
      user: {
        first_name: user.firstName || 'there',
        workflow_count: user.workflowCount || 0,
        trial_days_left: getTrialDaysRemaining(user),
      },
      urls: {
        upgrade_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/pricing?utm_source=email&utm_campaign=trial_day7`,
      },
    };

    const html = renderTemplate(template, variables, components);
    const subject = `You're doing great! Here's what you're missing`;

    const result = await emailService.send({
      to: user.email,
      subject,
      html,
      tags: ['trial', 'nurture', 'day7'],
      metadata: {
        user_id: user.id,
        email_type: 'trial_day7',
        trial_day: '7',
      },
    });

    return result.success;
  } catch (error) {
    logger.error('Error sending trial day 7 email', error instanceof Error ? error : new Error(String(error)), {
      userId: user.id,
    });
    return false;
  }
}

/**
 * Send trial ending email
 */
export async function sendTrialEndingEmail(user: UserData): Promise<boolean> {
  try {
    const template = loadEmailTemplate('lifecycle/trial_ending.html');
    const components = loadEmailComponents();
    
    const trialDaysLeft = getTrialDaysRemaining(user);
    const trialEndDate = user.trialEndDate 
      ? new Date(user.trialEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'soon';

    const variables = {
      user: {
        first_name: user.firstName || 'there',
        workflow_count: user.workflowCount || 0,
        integration_count: user.integrationCount || 0,
        trial_days_left: trialDaysLeft,
        trial_end_date: trialEndDate,
      },
      urls: {
        upgrade_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/pricing?utm_source=email&utm_campaign=trial_ending`,
      },
    };

    const html = renderTemplate(template, variables, components);
    const subject = `Your trial ends in ${trialDaysLeft} days. Lock in your personalized system`;

    const result = await emailService.send({
      to: user.email,
      subject,
      html,
      tags: ['trial', 'urgency', 'conversion'],
      metadata: {
        user_id: user.id,
        email_type: 'trial_ending',
        trial_days_left: String(trialDaysLeft),
      },
    });

    return result.success;
  } catch (error) {
    logger.error('Error sending trial ending email', error instanceof Error ? error : new Error(String(error)), {
      userId: user.id,
    });
    return false;
  }
}

/**
 * Send monthly summary email for paid users
 */
export async function sendMonthlySummaryEmail(user: UserData, reportPeriod: string): Promise<boolean> {
  try {
    const template = loadEmailTemplate('lifecycle/paid_monthly_summary.html');
    const components = loadEmailComponents();
    
    const variables = {
      user: {
        first_name: user.firstName || 'there',
        workflow_count: user.workflowCount || 0,
        integration_count: user.integrationCount || 0,
        automation_count: user.automationCount || 0,
        time_saved_hours: user.timeSavedHours || 0,
      },
      analysis: {
        report_period: reportPeriod,
        analysis_summary: `You've executed ${user.automationCount || 0} automations this month, saving approximately ${user.timeSavedHours || 0} hours.`,
      },
      workflow: {
        next_recommendation: user.workflowCount && user.workflowCount < 3
          ? 'Create 2-3 more workflows to unlock the full power of automation. Most users see value after 3-5 workflows.'
          : 'Explore advanced features like conditional logic and multi-step workflows to further optimize your automations.',
      },
      urls: {
        dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aiautomatedsystems.ca'}/dashboard`,
      },
    };

    const html = renderTemplate(template, variables, components);
    const subject = `Your ${reportPeriod} Summary - ${user.automationCount || 0} automations executed`;

    const result = await emailService.send({
      to: user.email,
      subject,
      html,
      tags: ['paid', 'monthly', 'summary'],
      metadata: {
        user_id: user.id,
        email_type: 'monthly_summary',
        report_period: reportPeriod,
      },
    });

    return result.success;
  } catch (error) {
    logger.error('Error sending monthly summary email', error instanceof Error ? error : new Error(String(error)), {
      userId: user.id,
    });
    return false;
  }
}

/**
 * Get emails to send for a user based on their trial status
 */
export async function getEmailsToSend(user: UserData): Promise<Array<{ type: string; send: () => Promise<boolean> }>> {
  const emails: Array<{ type: string; send: () => Promise<boolean> }> = [];
  
  if (!user.trialStartDate) {
    return emails; // Not a trial user
  }

  const trialDays = getTrialDays(user);
  const trialDaysLeft = getTrialDaysRemaining(user);

  // Day 0: Welcome email
  if (trialDays === 0) {
    emails.push({
      type: 'trial_welcome',
      send: () => sendTrialWelcomeEmail(user),
    });
  }

  // Day 7: Mid-week check-in
  if (trialDays === 7) {
    emails.push({
      type: 'trial_day7',
      send: () => sendTrialDay7Email(user),
    });
  }

  // Day 25, 27, 29: Trial ending urgency
  if (trialDaysLeft === 5 || trialDaysLeft === 3 || trialDaysLeft === 1) {
    emails.push({
      type: 'trial_ending',
      send: () => sendTrialEndingEmail(user),
    });
  }

  return emails;
}

/**
 * Process and send scheduled emails for a user
 * This would be called by a cron job or scheduled function
 */
export async function processScheduledEmails(user: UserData): Promise<void> {
  const emailsToSend = await getEmailsToSend(user);
  
  for (const email of emailsToSend) {
    try {
      await email.send();
      logger.info('Scheduled email sent', {
        userId: user.id,
        emailType: email.type,
      });
    } catch (error) {
      logger.error('Failed to send scheduled email', error instanceof Error ? error : new Error(String(error)), {
        userId: user.id,
        emailType: email.type,
      });
    }
  }
}
