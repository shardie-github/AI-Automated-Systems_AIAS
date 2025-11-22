/**
 * Workflow Templates System
 * Pre-built workflow templates for common automation scenarios
 */

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "ecommerce" | "accounting" | "communication" | "productivity" | "marketing";
  icon: string;
  steps: WorkflowStep[];
  requiredIntegrations: string[];
  estimatedTimeMinutes: number;
  difficulty: "easy" | "medium" | "advanced";
}

export interface WorkflowStep {
  id: string;
  type: "trigger" | "action" | "condition";
  name: string;
  description: string;
  config: Record<string, unknown>;
  requiredFields?: string[];
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "shopify-order-notification",
    name: "Shopify Order Notification",
    description: "Send a Slack notification when a new order is placed in Shopify",
    category: "ecommerce",
    icon: "🛍️",
    requiredIntegrations: ["shopify", "slack"],
    estimatedTimeMinutes: 5,
    difficulty: "easy",
    steps: [
      {
        id: "trigger-1",
        type: "trigger",
        name: "New Order in Shopify",
        description: "Triggers when a new order is created",
        config: {
          integration: "shopify",
          event: "order.created",
        },
        requiredFields: ["shop"],
      },
      {
        id: "action-1",
        type: "action",
        name: "Send Slack Notification",
        description: "Sends a message to a Slack channel",
        config: {
          integration: "slack",
          action: "send_message",
          channel: "#orders",
          message: "New order: {{order.total}} from {{order.customer.email}}",
        },
        requiredFields: ["channel", "message"],
      },
    ],
  },
  {
    id: "wave-invoice-reminder",
    name: "Wave Invoice Reminder",
    description: "Send email reminders for overdue invoices",
    category: "accounting",
    icon: "📊",
    requiredIntegrations: ["wave", "gmail"],
    estimatedTimeMinutes: 10,
    difficulty: "medium",
    steps: [
      {
        id: "trigger-1",
        type: "trigger",
        name: "Invoice Overdue",
        description: "Triggers when an invoice is overdue",
        config: {
          integration: "wave",
          event: "invoice.overdue",
          daysOverdue: 7,
        },
        requiredFields: ["daysOverdue"],
      },
      {
        id: "action-1",
        type: "action",
        name: "Send Email Reminder",
        description: "Sends an email reminder to the customer",
        config: {
          integration: "gmail",
          action: "send_email",
          to: "{{invoice.customer.email}}",
          subject: "Invoice Reminder: {{invoice.number}}",
          body: "Your invoice {{invoice.number}} for {{invoice.amount}} is overdue.",
        },
        requiredFields: ["to", "subject", "body"],
      },
    ],
  },
  {
    id: "shopify-order-processing",
    name: "Shopify Order Processing",
    description: "Automatically process orders: create invoice, send confirmation, update inventory",
    category: "ecommerce",
    icon: "⚙️",
    requiredIntegrations: ["shopify", "wave"],
    estimatedTimeMinutes: 15,
    difficulty: "advanced",
    steps: [
      {
        id: "trigger-1",
        type: "trigger",
        name: "New Order",
        description: "Triggers when a new order is placed",
        config: {
          integration: "shopify",
          event: "order.created",
        },
        requiredFields: ["shop"],
      },
      {
        id: "action-1",
        type: "action",
        name: "Create Invoice in Wave",
        description: "Creates an invoice in Wave Accounting",
        config: {
          integration: "wave",
          action: "create_invoice",
          customer: "{{order.customer.email}}",
          amount: "{{order.total}}",
          items: "{{order.line_items}}",
        },
        requiredFields: ["customer", "amount"],
      },
      {
        id: "action-2",
        type: "action",
        name: "Send Order Confirmation",
        description: "Sends order confirmation email",
        config: {
          integration: "shopify",
          action: "send_email",
          template: "order_confirmation",
        },
      },
    ],
  },
  {
    id: "lead-qualification",
    name: "Lead Qualification",
    description: "Qualify leads and add to CRM",
    category: "marketing",
    icon: "🎯",
    requiredIntegrations: ["gmail", "notion"],
    estimatedTimeMinutes: 10,
    difficulty: "medium",
    steps: [
      {
        id: "trigger-1",
        type: "trigger",
        name: "New Email",
        description: "Triggers when a new email is received",
        config: {
          integration: "gmail",
          event: "email.received",
          from: "contact@example.com",
        },
        requiredFields: ["from"],
      },
      {
        id: "condition-1",
        type: "condition",
        name: "Check if Lead",
        description: "Checks if email contains lead keywords",
        config: {
          field: "{{email.body}}",
          contains: ["interested", "quote", "pricing"],
        },
      },
      {
        id: "action-1",
        type: "action",
        name: "Add to CRM",
        description: "Adds lead to Notion CRM",
        config: {
          integration: "notion",
          action: "create_page",
          database: "leads",
          properties: {
            name: "{{email.from}}",
            email: "{{email.from}}",
            message: "{{email.body}}",
          },
        },
        requiredFields: ["database"],
      },
    ],
  },
  {
    id: "daily-summary",
    name: "Daily Business Summary",
    description: "Send daily summary of orders, revenue, and tasks",
    category: "productivity",
    icon: "📈",
    requiredIntegrations: ["shopify", "wave", "slack"],
    estimatedTimeMinutes: 15,
    difficulty: "advanced",
    steps: [
      {
        id: "trigger-1",
        type: "trigger",
        name: "Daily at 9 AM",
        description: "Triggers every day at 9 AM",
        config: {
          type: "schedule",
          schedule: "0 9 * * *",
        },
      },
      {
        id: "action-1",
        type: "action",
        name: "Get Today's Orders",
        description: "Fetches today's orders from Shopify",
        config: {
          integration: "shopify",
          action: "get_orders",
          date: "today",
        },
      },
      {
        id: "action-2",
        type: "action",
        name: "Get Today's Revenue",
        description: "Fetches today's revenue from Wave",
        config: {
          integration: "wave",
          action: "get_revenue",
          date: "today",
        },
      },
      {
        id: "action-3",
        type: "action",
        name: "Send Summary to Slack",
        description: "Sends daily summary to Slack",
        config: {
          integration: "slack",
          action: "send_message",
          channel: "#daily-summary",
          message: "Daily Summary:\nOrders: {{orders.count}}\nRevenue: {{revenue.total}}",
        },
        requiredFields: ["channel"],
      },
    ],
  },
];

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): WorkflowTemplate | undefined {
  return workflowTemplates.find((t) => t.id === templateId);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: WorkflowTemplate["category"]): WorkflowTemplate[] {
  return workflowTemplates.filter((t) => t.category === category);
}

/**
 * Get templates by required integration
 */
export function getTemplatesByIntegration(integration: string): WorkflowTemplate[] {
  return workflowTemplates.filter((t) => t.requiredIntegrations.includes(integration));
}

/**
 * Validate template configuration
 */
export function validateTemplateConfig(
  template: WorkflowTemplate,
  config: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const step of template.steps) {
    if (step.requiredFields) {
      for (const field of step.requiredFields) {
        const stepConfig = config[step.id] as Record<string, unknown> | undefined;
        if (!stepConfig || !stepConfig[field]) {
          errors.push(`Missing required field: ${step.id}.${field}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
