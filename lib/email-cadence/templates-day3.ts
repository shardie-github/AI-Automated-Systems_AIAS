/**
 * Day 3 Email Template
 * Sent 3 days after signup - First workflow prompt
 */

export const day3EmailTemplate = {
  subject: "Create your first workflow in 5 minutes ⚡",
  content: {
    header: "Hi {{userName}},",
    body: [
      "You're 3 days into your trial! Ready to create your first automation?",
      "**Why create a workflow?**",
      "Workflows automate repetitive tasks, saving you 10+ hours per week. Here are some quick wins:",
      "• **Shopify Order Notification** - Get Slack alerts for new orders",
      "• **Wave Invoice Reminder** - Automatically remind customers about overdue invoices",
      "• **Daily Business Summary** - Get a daily report of orders and revenue",
      "**Get started:**",
      "1. Go to Workflows → Create New",
      "2. Choose a template or start from scratch",
      "3. Configure your workflow (takes 2-3 minutes)",
      "4. Test it and watch it run!",
      "**Pro tip:** Start with a template - they're pre-configured and ready to use.",
      "**Need inspiration?**",
      "Check out our [workflow templates]({{templatesUrl}}) or [case studies]({{caseStudiesUrl}}).",
      "Happy automating!",
      "The AIAS Team",
    ],
  },
  cta: {
    text: "Create Workflow",
    url: "{{workflowsUrl}}",
  },
};
