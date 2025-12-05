import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, ArrowRight, Clock, TrendingUp, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "10 Automation Workflows That Save 10+ Hours Per Week | AIAS Platform",
  description: "Discover 10 powerful automation workflows that save 10+ hours per week. From e-commerce to customer support, learn how to automate repetitive tasks.",
  keywords: [
    "automation workflows",
    "time saving automation",
    "business automation",
    "workflow automation",
    "automation examples",
    "productivity automation",
  ],
};

const workflows = [
  {
    title: "E-Commerce Order Processing",
    timeSaved: "3-5 hours/week",
    description: "Automatically process orders, update inventory, send confirmations, and notify your team.",
    steps: [
      "New order in Shopify triggers workflow",
      "Update inventory in real-time",
      "Send confirmation email to customer",
      "Notify team in Slack",
      "Generate shipping label",
    ],
  },
  {
    title: "Lead Capture to CRM",
    timeSaved: "2-3 hours/week",
    description: "Automatically capture leads from multiple sources, qualify them, and add to your CRM.",
    steps: [
      "Capture lead from form, email, or social",
      "Qualify lead with AI",
      "Add to CRM (HubSpot, Salesforce)",
      "Send welcome email",
      "Assign to sales rep",
    ],
  },
  {
    title: "Customer Support Ticket Routing",
    timeSaved: "2-4 hours/week",
    description: "Intelligently route support tickets to the right team member based on content and priority.",
    steps: [
      "New ticket arrives",
      "AI analyzes content and urgency",
      "Route to appropriate team member",
      "Send acknowledgment to customer",
      "Track response time",
    ],
  },
  {
    title: "Daily Email Summary",
    timeSaved: "1-2 hours/week",
    description: "Get a daily summary of important events, metrics, and tasks automatically.",
    steps: [
      "Collect data from multiple sources",
      "Generate summary report",
      "Send email at scheduled time",
      "Include key metrics and insights",
    ],
  },
  {
    title: "Content Creation & Distribution",
    timeSaved: "3-5 hours/week",
    description: "Automate content creation, scheduling, and distribution across platforms.",
    steps: [
      "Generate content with AI",
      "Review and approve",
      "Schedule across platforms",
      "Track performance",
      "Optimize based on results",
    ],
  },
  {
    title: "Invoice Processing",
    timeSaved: "2-3 hours/week",
    description: "Automatically process invoices, match with purchase orders, and update accounting.",
    steps: [
      "Receive invoice via email",
      "Extract data with AI",
      "Match with purchase order",
      "Approve or flag for review",
      "Update accounting system",
    ],
  },
  {
    title: "Social Media Management",
    timeSaved: "2-4 hours/week",
    description: "Schedule posts, respond to comments, and track engagement automatically.",
    steps: [
      "Create content calendar",
      "Schedule posts across platforms",
      "Monitor comments and mentions",
      "Respond with AI assistance",
      "Track engagement metrics",
    ],
  },
  {
    title: "Data Processing & Reporting",
    timeSaved: "3-6 hours/week",
    description: "Automatically process data, generate reports, and share insights with your team.",
    steps: [
      "Collect data from multiple sources",
      "Process and clean data",
      "Generate reports",
      "Share with stakeholders",
      "Schedule recurring reports",
    ],
  },
  {
    title: "Employee Onboarding",
    timeSaved: "2-3 hours/week",
    description: "Automate the onboarding process for new employees, from paperwork to system access.",
    steps: [
      "New employee added to system",
      "Send welcome email with resources",
      "Create accounts in required systems",
      "Schedule training sessions",
      "Track completion",
    ],
  },
  {
    title: "Inventory Management",
    timeSaved: "2-4 hours/week",
    description: "Automatically sync inventory across platforms, reorder when low, and update product listings.",
    steps: [
      "Monitor inventory levels",
      "Sync across all platforms",
      "Alert when stock is low",
      "Generate purchase orders",
      "Update product listings",
    ],
  },
];

export default function AutomationWorkflowsPage() {
  return (
    <div className="container py-12 md:py-16 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
          <Zap className="h-4 w-4" />
          <span>Automation Best Practices</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          10 Automation Workflows That Save 10+ Hours Per Week
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Discover powerful automation workflows that eliminate repetitive tasks and free up your time for strategic work.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            10 min read
          </span>
          <span>•</span>
          <span>Published: January 2025</span>
        </div>
      </div>

      {/* Introduction */}
      <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
        <p className="text-lg">
          Automation isn't just about saving time—it's about scaling your business without hiring. 
          The workflows below are used by thousands of businesses to save 10+ hours per week, 
          reduce errors by 90%, and increase productivity by 40%.
        </p>
        <p>
          Each workflow follows the same pattern: <strong>trigger → action → result</strong>. 
          Start with one workflow, prove the value, then scale to multiple workflows working together.
        </p>
      </div>

      {/* Workflows */}
      <div className="space-y-8 mb-12">
        {workflows.map((workflow, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {index + 1}. {workflow.title}
                  </h2>
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Clock className="h-4 w-4" />
                    <span>Saves {workflow.timeSaved}</span>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">{workflow.description}</p>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">How it works:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  {workflow.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Takeaways */}
      <Card className="mb-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Key Takeaways</h2>
          <ul className="space-y-2">
            {[
              "Start with one workflow to prove value",
              "Use templates to save setup time",
              "Connect all your tools for maximum power",
              "Monitor and optimize regularly",
              "Scale to multiple workflows working together",
            ].map((takeaway, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-primary/5">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Automate Your Business?</h2>
          <p className="text-muted-foreground mb-6">
            Start your free trial and create your first automation in 5 minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Related Content */}
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-xl font-bold mb-4">Related Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/systems-thinking" className="block p-4 border rounded-lg hover:border-primary transition-colors">
            <h4 className="font-semibold mb-2">Systems Thinking: The Critical Skill for the AI Age</h4>
            <p className="text-sm text-muted-foreground">Learn how systems thinking makes your automations better</p>
          </Link>
          <Link href="/automation-guide" className="block p-4 border rounded-lg hover:border-primary transition-colors">
            <h4 className="font-semibold mb-2">Business Automation: Complete Guide</h4>
            <p className="text-sm text-muted-foreground">Everything you need to know about business automation</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
