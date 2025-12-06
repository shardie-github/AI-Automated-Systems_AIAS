/**
 * Email Cadence Sender
 * Sends trial emails based on day and user actions
 */

import { emailService } from "@/lib/email/email-service";
import { getEmailTemplate, renderEmailTemplate } from "./templates";
import { day1EmailTemplate } from "./templates-day1";
import { day3EmailTemplate } from "./templates-day3";
import { day7EmailTemplate } from "./templates-day7";
import { 
  trialExpiration3DaysTemplate, 
  trialExpiration1DayTemplate, 
  trialExpiredTemplate 
} from "./templates-trial-expiration";
import { getUserPlanData } from "@/lib/trial/user-plan";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logging/structured-logger";

/**
 * Send trial email for specific day
 */
export async function sendTrialEmail(
  userId: string,
  userEmail: string,
  userName: string,
  day: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getEmailTemplate(day);
    if (!template) {
      return { success: false, error: `No template found for day ${day}` };
    }

    const html = renderEmailTemplate(template, userName);

    const result = await emailService.send({
      to: userEmail,
      subject: template.subject,
      html,
      text: template.content.body.join("\n\n"),
      tags: ["trial-email", `day-${day}`],
      metadata: {
        userId,
        day: day.toString(),
        templateId: `trial-day-${day}`,
      },
    });

    if (result.success) {
      logger.info("Trial email sent", {
        userId,
        day,
        messageId: result.messageId,
      });
    }

    return result;
  } catch (error) {
    logger.error("Failed to send trial email", error instanceof Error ? error : new Error(String(error)), {
      userId,
      day,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check and send emails for user based on trial day
 */
export async function processTrialEmailsForUser(userId: string): Promise<void> {
  try {
    const userData = await getUserPlanData(userId);
    
    if (userData.plan !== "trial" || !userData.trialStartDate) {
      return; // Not on trial
    }

    // Calculate days since trial started
    const daysSinceStart = Math.floor(
      (Date.now() - userData.trialStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate days remaining
    const daysRemaining = userData.trialDaysRemaining || 0;

    // Get user email from profile
    const supabase = await createServerSupabaseClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    if (!profile?.email) {
      logger.warn("User email not found", { userId });
      return;
    }

    const userName = profile.full_name || "there";
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aiautomatedsystems.ca";

    // Determine which email to send
    let emailTemplate: typeof day1EmailTemplate | null = null;
    let emailDay = daysSinceStart;

    // Day 1: Integration reminder
    if (daysSinceStart === 1) {
      emailTemplate = day1EmailTemplate;
    }
    // Day 3: First workflow prompt
    else if (daysSinceStart === 3) {
      emailTemplate = day3EmailTemplate;
    }
    // Day 7: Advanced features
    else if (daysSinceStart === 7) {
      emailTemplate = day7EmailTemplate;
    }
    // Trial expiration: 3 days before
    else if (daysRemaining === 3) {
      emailTemplate = trialExpiration3DaysTemplate;
    }
    // Trial expiration: 1 day before
    else if (daysRemaining === 1) {
      emailTemplate = trialExpiration1DayTemplate;
    }
    // Trial expired
    else if (daysRemaining === 0 && userData.plan === "trial") {
      emailTemplate = trialExpiredTemplate;
    }
    // Fallback to legacy template system
    else {
      const template = getEmailTemplate(daysSinceStart);
      if (template) {
        const result = await sendTrialEmail(
          userId,
          profile.email,
          userName,
          daysSinceStart
        );

        if (result.success) {
          await supabase.from("trial_emails_sent").insert({
            user_id: userId,
            day: daysSinceStart,
            sent_at: new Date().toISOString(),
            template_id: `trial-day-${daysSinceStart}`,
          });
        }
        return;
      }
    }

    // Send new template-based email
    if (emailTemplate) {
      // Check if already sent
      const { data: sentEmails } = await supabase
        .from("trial_emails_sent")
        .select("day")
        .eq("user_id", userId)
        .eq("day", emailDay);

      if (sentEmails && sentEmails.length > 0) {
        return; // Already sent
      }

      // Render template with variables
      const variables = {
        userName,
        integrationsUrl: `${baseUrl}/integrations`,
        workflowsUrl: `${baseUrl}/workflows?create=true`,
        templatesUrl: `${baseUrl}/templates`,
        caseStudiesUrl: `${baseUrl}/case-studies`,
        pricingUrl: `${baseUrl}/pricing`,
        helpUrl: `${baseUrl}/help`,
        setupCallUrl: `${baseUrl}/demo`,
        trialEndDate: userData.trialEndDate?.toLocaleDateString() || "soon",
      };

      // Build HTML from template
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${emailTemplate.subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">${emailTemplate.content.header.replace("{{userName}}", userName)}</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            ${emailTemplate.content.body
              .map((paragraph) => {
                let rendered = paragraph
                  .replace(/\{\{userName\}\}/g, userName)
                  .replace(/\{\{integrationsUrl\}\}/g, variables.integrationsUrl)
                  .replace(/\{\{workflowsUrl\}\}/g, variables.workflowsUrl)
                  .replace(/\{\{templatesUrl\}\}/g, variables.templatesUrl)
                  .replace(/\{\{caseStudiesUrl\}\}/g, variables.caseStudiesUrl)
                  .replace(/\{\{pricingUrl\}\}/g, variables.pricingUrl)
                  .replace(/\{\{helpUrl\}\}/g, variables.helpUrl)
                  .replace(/\{\{setupCallUrl\}\}/g, variables.setupCallUrl)
                  .replace(/\{\{trialEndDate\}\}/g, variables.trialEndDate);
                
                // Convert markdown-style links to HTML
                rendered = rendered.replace(
                  /\[([^\]]+)\]\(([^)]+)\)/g,
                  '<a href="$2" style="color: #4F46E5; text-decoration: underline;">$1</a>'
                );
                
                // Convert **bold** to <strong>
                rendered = rendered.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
                
                return `<p style="margin: 0 0 15px 0;">${rendered || "<br>"}</p>`;
              })
              .join("")}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${emailTemplate.cta.url.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key as keyof typeof variables] || "")}" 
                 style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                ${emailTemplate.cta.text}
              </a>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await emailService.send({
        to: profile.email,
        subject: emailTemplate.subject,
        html,
        text: emailTemplate.content.body.join("\n\n"),
        tags: ["trial-email", `day-${emailDay}`],
        metadata: {
          userId,
          day: emailDay.toString(),
          templateId: `trial-day-${emailDay}`,
        },
      });

      if (result.success) {
        await supabase.from("trial_emails_sent").insert({
          user_id: userId,
          day: emailDay,
          sent_at: new Date().toISOString(),
          template_id: `trial-day-${emailDay}`,
        });
        logger.info("Trial email sent", { userId, day: emailDay, email: profile.email });
      }
    }
  } catch (error) {
    logger.error(
      "Failed to process trial emails",
      error instanceof Error ? error : new Error(String(error)),
      { userId }
    );
  }
}

/**
 * Process all trial users (for cron job)
 */
export async function processAllTrialEmails(): Promise<void> {
  const supabase = await createServerSupabaseClient();

  // Get all users on trial
  const { data: trialUsers } = await supabase
    .from("profiles")
    .select("id")
    .eq("subscription_tier", "trial")
    .not("trial_started_at", "is", null);

  if (!trialUsers) {
    return;
  }

  // Process each user
  for (const user of trialUsers) {
    await processTrialEmailsForUser(user.id);
    // Small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
