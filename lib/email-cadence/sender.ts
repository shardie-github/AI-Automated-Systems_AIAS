/**
 * Email Cadence Sender
 * Sends trial emails based on day and user actions
 */

import { emailService } from "@/lib/email/email-service";
import { getEmailTemplate, renderEmailTemplate } from "./templates";
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

    // Check if email for this day was already sent
    const { data: sentEmails } = await supabase
      .from("trial_emails_sent")
      .select("day")
      .eq("user_id", userId)
      .eq("day", daysSinceStart);

    if (sentEmails && sentEmails.length > 0) {
      return; // Already sent
    }

    // Send email for current day
    const template = getEmailTemplate(daysSinceStart);
    if (template) {
      const result = await sendTrialEmail(
        userId,
        profile.email,
        profile.full_name || "there",
        daysSinceStart
      );

      if (result.success) {
        // Mark as sent
        await supabase.from("trial_emails_sent").insert({
          user_id: userId,
          day: daysSinceStart,
          sent_at: new Date().toISOString(),
          template_id: `trial-day-${daysSinceStart}`,
        });
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
