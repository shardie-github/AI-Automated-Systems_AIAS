/**
 * Day 1 Email Template
 * Sent 1 day after signup - Integration reminder
 */

export const day1EmailTemplate = {
  subject: "Connect your first integration and unlock automation 🚀",
  content: {
    header: "Hi {{userName}},",
    body: [
      "Great to see you've joined AIAS Platform! Now let's connect your first integration to start automating.",
      "**Why connect an integration?**",
      "Integrations are the bridge between your tools and AIAS. Once connected, you can:",
      "• Automate order processing from Shopify",
      "• Sync invoices with Wave Accounting",
      "• Send notifications to Slack",
      "• And much more!",
      "**Get started in 2 minutes:**",
      "1. Go to Settings → Integrations",
      "2. Click 'Connect' on Shopify, Wave, or another tool you use",
      "3. Authorize the connection",
      "4. Start creating workflows!",
      "**Need help?**",
      "Check out our [integration setup guides]({{helpUrl}}) or reply to this email.",
      "Happy automating!",
      "The AIAS Team",
    ],
  },
  cta: {
    text: "Connect Integration",
    url: "{{integrationsUrl}}",
  },
};
