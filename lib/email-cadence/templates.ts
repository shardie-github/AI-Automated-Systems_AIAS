/**
 * Email Cadence Templates for 30-Day Free Trial
 * 
 * These templates are designed to be used with an email service (Resend, SendGrid, etc.)
 * and triggered based on trial day and user actions.
 */

export interface EmailTemplate {
  day: number;
  subject: string;
  preheader: string;
  content: {
    greeting: string;
    body: string[];
    cta: {
      text: string;
      url: string;
    };
    footer?: string;
  };
  trigger: "automatic" | "on_action";
  action?: string; // If trigger is "on_action"
}

export const trialEmailCadence: EmailTemplate[] = [
  {
    day: 0,
    subject: "Welcome to AIAS Platform! Here's how to get value in 10 minutes",
    preheader: "Get started with your 30-day free trial",
    content: {
      greeting: "Welcome to AIAS Platform!",
      body: [
        "Thanks for starting your 30-day free trial. Here are 3 quick wins you can achieve today:",
        "",
        "1. Connect your email (2 min) → See campaign insights",
        "2. Take pre-test (3 min) → Get personalized news",
        "3. Create first workflow (5 min) → Automate a task",
        "",
        "All of this is free during your trial. No credit card required.",
      ],
      cta: {
        text: "Go to Dashboard",
        url: "/dashboard",
      },
      footer: "Questions? Reply to this email or visit our help center.",
    },
    trigger: "automatic",
  },
  {
    day: 2,
    subject: "Your AI news feed is ready! Plus, here's a quick win",
    preheader: "See your personalized insights",
    content: {
      greeting: "Hi there!",
      body: [
        "Your AI news feed is ready!",
        "",
        "If you completed the pre-test, you're seeing personalized articles based on your goals and industry.",
        "",
        "Plus, if you connected your email, here's a quick insight from your campaign analysis:",
        "",
        "[Dynamic: Show one insight from email analysis]",
        "",
        "Want to see more insights? Upgrade to unlock unlimited email analysis and advanced diagnostics.",
      ],
      cta: {
        text: "View Insights",
        url: "/dashboard",
      },
    },
    trigger: "automatic",
  },
  {
    day: 7,
    subject: "You're doing great! Here's what you're missing",
    preheader: "Unlock personalized insights and advanced features",
    content: {
      greeting: "You're making progress!",
      body: [
        "You've been using AIAS Platform for a week. Here's what you could unlock with a paid plan:",
        "",
        "✓ Personalized news feed (50+ articles/day based on your goals)",
        "✓ Unlimited email campaign analysis with full diagnostics",
        "✓ Unlimited workflows and automations",
        "✓ 30-minute onboarding strategy session",
        "✓ Priority support",
        "",
        "Your trial includes the basics. Upgrade to unlock the full power.",
      ],
      cta: {
        text: "Upgrade to Unlock",
        url: "/pricing",
      },
    },
    trigger: "automatic",
  },
  {
    day: 14,
    subject: "How [Company] saved 15 hours/week with AIAS Platform",
    preheader: "Real results from a similar business",
    content: {
      greeting: "Here's a success story you might find interesting:",
      body: [
        "[Company Name] was in a similar situation to yours. They were spending 15+ hours per week on manual tasks.",
        "",
        "After upgrading to AIAS Platform:",
        "",
        "• Saved 15 hours per week",
        "• Reduced errors by 90%",
        "• Increased revenue by 40%",
        "",
        "The key? They used our personalized workflows and took advantage of the free onboarding session.",
        "",
        "Want to read the full case study? Upgrade to access detailed case studies with step-by-step solutions.",
      ],
      cta: {
        text: "Upgrade to See Full Case Study",
        url: "/pricing",
      },
    },
    trigger: "automatic",
  },
  {
    day: 21,
    subject: "Trial halfway done. Here's what paid users get",
    preheader: "See the full comparison",
    content: {
      greeting: "Your trial is halfway done!",
      body: [
        "Here's a quick comparison of what you have vs. what you could unlock:",
        "",
        "Free Trial:",
        "• Basic news feed (15 articles/day)",
        "• 1 email analysis/month",
        "• 3 workflows, 100 automations/month",
        "",
        "Paid Plan:",
        "• Personalized news feed (50+ articles/day)",
        "• Unlimited email analysis",
        "• Unlimited workflows & automations",
        "• 30-min onboarding session",
        "• Priority support",
        "",
        "Join 2,000+ paid users who save 10+ hours per week.",
      ],
      cta: {
        text: "Upgrade Now",
        url: "/pricing",
      },
    },
    trigger: "automatic",
  },
  {
    day: 25,
    subject: "Your trial ends in 5 days. Lock in your personalized system",
    preheader: "Don't lose your setup",
    content: {
      greeting: "Your trial ends soon!",
      body: [
        "Your 30-day free trial ends in 5 days.",
        "",
        "If you've completed the pre-test and set up workflows, you've created a personalized system. Upgrade now to keep everything:",
        "",
        "• Your personalized news feed",
        "• Your workflows and automations",
        "• Your campaign insights",
        "",
        "Plus, upgrade in the next 48 hours and get your free 30-minute onboarding session to maximize your results.",
      ],
      cta: {
        text: "Upgrade Before Trial Ends",
        url: "/pricing",
      },
    },
    trigger: "automatic",
  },
  {
    day: 27,
    subject: "Last chance: Your trial ends in 3 days",
    preheader: "Upgrade now to keep everything",
    content: {
      greeting: "Final reminder:",
      body: [
        "Your trial ends in 3 days. Your personalized system will be locked unless you upgrade.",
        "",
        "Upgrade now to:",
        "",
        "• Keep all your workflows and automations",
        "• Maintain your personalized news feed",
        "• Get your free onboarding session",
        "• Unlock unlimited everything",
        "",
        "No credit card required to start. Cancel anytime.",
      ],
      cta: {
        text: "Upgrade Now - Trial Ending Soon",
        url: "/pricing",
      },
    },
    trigger: "automatic",
  },
  {
    day: 29,
    subject: "Last chance: Your trial ends tomorrow",
    preheader: "Upgrade today to keep your setup",
    content: {
      greeting: "This is your last chance!",
      body: [
        "Your trial ends tomorrow. After that, you'll have limited access to your workflows and data.",
        "",
        "Upgrade today to:",
        "",
        "• Keep your personalized system",
        "• Maintain full access to all features",
        "• Get your free onboarding session",
        "",
        "Upgrade within the next 24 hours to lock in your current setup.",
      ],
      cta: {
        text: "Upgrade Before Trial Ends",
        url: "/pricing",
      },
    },
    trigger: "automatic",
  },
  {
    day: 30,
    subject: "Your trial has ended. Upgrade to restore full access",
    preheader: "Keep your personalized system",
    content: {
      greeting: "Your trial has ended",
      body: [
        "Thank you for trying AIAS Platform!",
        "",
        "Your trial has ended, but you can still upgrade to restore full access to:",
        "",
        "• All your workflows and automations",
        "• Your personalized news feed",
        "• Unlimited email analysis",
        "• Priority support",
        "",
        "Upgrade within 7 days to restore everything without losing your setup.",
      ],
      cta: {
        text: "Upgrade Now",
        url: "/pricing",
      },
    },
    trigger: "automatic",
  },
];

/**
 * Get email template for a specific day
 */
export function getEmailTemplate(day: number): EmailTemplate | undefined {
  return trialEmailCadence.find((template) => template.day === day);
}

/**
 * Get all email templates that should be sent
 */
export function getEmailsToSend(trialStartDate: Date, currentDate: Date = new Date()): EmailTemplate[] {
  const daysSinceStart = Math.floor(
    (currentDate.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return trialEmailCadence.filter((template) => {
    if (template.trigger === "automatic") {
      return template.day === daysSinceStart;
    }
    // For action-based triggers, would need to check user actions
    return false;
  });
}

/**
 * Render email template as HTML (basic version)
 */
export function renderEmailTemplate(template: EmailTemplate, userName: string = "there"): string {
  const { greeting, body, cta, footer } = template.content;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">${greeting}</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        ${body.map((paragraph) => `<p style="margin: 0 0 15px 0;">${paragraph || "<br>"}</p>`).join("")}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${cta.url}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            ${cta.text}
          </a>
        </div>
        ${footer ? `<p style="color: #6b7280; font-size: 14px; margin-top: 30px;">${footer}</p>` : ""}
      </div>
    </body>
    </html>
  `;
}
