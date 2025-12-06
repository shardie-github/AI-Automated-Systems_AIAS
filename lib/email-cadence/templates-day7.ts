/**
 * Day 7 Email Template
 * Sent 7 days after signup - Advanced features introduction
 */

export const day7EmailTemplate = {
  subject: "Unlock advanced features and scale your automation 🎯",
  content: {
    header: "Hi {{userName}},",
    body: [
      "You've been using AIAS for a week! Here are some advanced features to help you scale:",
      "**Advanced Features:**",
      "• **Multiple Workflows** - Create up to 20 workflows on Pro plan",
      "• **API Access** - Integrate AIAS with your custom apps",
      "• **Advanced Analytics** - Deep insights into your automation performance",
      "• **Team Collaboration** - Share workflows with your team (coming soon)",
      "**Success Story:**",
      "Sarah from Toronto saves 15 hours per week by automating her Shopify order processing and Wave invoice management. Read her story [here]({{caseStudyUrl}}).",
      "**Upgrade to Pro:**",
      "Get unlimited workflows, priority support, and advanced features for just $149/month.",
      "**Or stay on Starter:**",
      "Perfect for solo operators - $49/month gets you 5 workflows and 10,000 automations/month.",
      "**Questions?**",
      "Reply to this email or book a [free setup call]({{setupCallUrl}}).",
      "Happy automating!",
      "The AIAS Team",
    ],
  },
  cta: {
    text: "View Plans",
    url: "{{pricingUrl}}",
  },
};
