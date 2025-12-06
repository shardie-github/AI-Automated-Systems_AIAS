/**
 * Trial Expiration Email Templates
 * Sent at 3 days, 1 day, and day of expiration
 */

export const trialExpiration3DaysTemplate = {
  subject: "Your trial ends in 3 days - Upgrade to keep your automations running ⏰",
  content: {
    header: "Hi {{userName}},",
    body: [
      "Your free trial ends in 3 days ({{trialEndDate}}).",
      "**Don't lose your automations!**",
      "Upgrade now to keep all your workflows running without interruption.",
      "**What you'll keep:**",
      "• All your workflows",
      "• All your integrations",
      "• All your automation history",
      "• Plus unlock more features!",
      "**Choose your plan:**",
      "• **Starter ($49/month)** - Perfect for solo operators",
      "• **Pro ($149/month)** - For growing teams",
      "**Special offer:** Save 20% with annual billing!",
      "**Upgrade now** to avoid any interruption to your automations.",
      "Questions? Reply to this email - we're here to help!",
      "The AIAS Team",
    ],
  },
  cta: {
    text: "Upgrade Now",
    url: "{{pricingUrl}}",
  },
};

export const trialExpiration1DayTemplate = {
  subject: "⏰ Last chance: Your trial ends tomorrow!",
  content: {
    header: "Hi {{userName}},",
    body: [
      "**Your trial ends tomorrow ({{trialEndDate}}).**",
      "This is your last chance to upgrade and keep your automations running.",
      "**What happens if you don't upgrade?**",
      "Your workflows will be paused, and you'll lose access to your automations. Don't let your hard work go to waste!",
      "**Upgrade in 2 minutes:**",
      "1. Click 'Upgrade Now' below",
      "2. Choose your plan",
      "3. Keep all your automations running",
      "**Need help deciding?**",
      "Book a [free setup call]({{setupCallUrl}}) and we'll help you choose the right plan.",
      "**Upgrade now** - Your automations are worth it!",
      "The AIAS Team",
    ],
  },
  cta: {
    text: "Upgrade Now - Last Chance",
    url: "{{pricingUrl}}",
  },
  urgent: true,
};

export const trialExpiredTemplate = {
  subject: "Your trial has ended - Come back and upgrade anytime 🔄",
  content: {
    header: "Hi {{userName}},",
    body: [
      "Your free trial has ended, but your account and workflows are still here!",
      "**What's next?**",
      "Upgrade to any plan to reactivate your automations and pick up right where you left off.",
      "**Special offer for returning users:**",
      "Upgrade in the next 7 days and get your first month at 50% off!",
      "**Why upgrade?**",
      "• Keep all your workflows",
      "• Unlock more automations",
      "• Get priority support",
      "• Scale your business",
      "**Ready to come back?**",
      "Click below to upgrade and reactivate your account.",
      "We'd love to have you back!",
      "The AIAS Team",
    ],
  },
  cta: {
    text: "Upgrade & Reactivate",
    url: "{{pricingUrl}}",
  },
};
