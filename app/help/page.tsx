// [STAKE+TRUST:BEGIN:help_page]
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQSchema } from "@/components/seo/structured-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, BookOpen, Settings, Zap, AlertCircle } from "lucide-react";

const faqs = [
  {
    category: "Getting Started",
    icon: Zap,
    questions: [
      {
        question: "How do I get started with AIAS Platform?",
        answer: "Getting started is easy! Sign up for a free account at aiautomatedsystems.ca. No credit card required. You'll get access to our Starter plan which includes 5 workflows, 1,000 API calls per month, and access to our workflow templates. Complete the onboarding wizard to set up your first automation in minutes.",
      },
      {
        question: "What's the difference between AIAS Consultancy and AIAS Platform?",
        answer: "AIAS Consultancy builds custom AI platforms from scratch (like TokPulse and Hardonia Suite). We architect, develop, and deploy complete solutions tailored to your business. AIAS Platform is our SaaS product for businesses that want ready-made automation tools. Think of it as: Consultancy = custom builds, Platform = ready-to-use software.",
      },
      {
        question: "Do I need coding experience to use AIAS Platform?",
        answer: "No coding experience required! Our visual workflow builder lets you create automations by dragging and dropping components. However, if you're comfortable with code, you can also use our API or write custom functions for advanced use cases.",
      },
      {
        question: "What can I automate with AIAS Platform?",
        answer: "You can automate almost any business process: lead generation and qualification, customer support ticket routing, data processing and reporting, content creation and distribution, inventory management, email marketing campaigns, social media posting, and much more. Check out our workflow templates for inspiration.",
      },
    ],
  },
  {
    category: "Account & Settings",
    icon: Settings,
    questions: [
      {
        question: "How do I manage my account settings?",
        answer: "Navigate to Settings from your account menu. Here you can update your profile, change your password, manage team members, configure integrations, set up billing, and adjust notification preferences. All changes are saved automatically.",
      },
      {
        question: "How do I update my privacy preferences?",
        answer: "Go to Settings > Privacy. You can control data sharing preferences, manage cookie settings, export your data, or request account deletion. We're PIPEDA compliant and all data is stored in Canada.",
      },
      {
        question: "Can I add team members to my account?",
        answer: "Yes! On the Team plan and above, you can add team members with different permission levels (Admin, Editor, Viewer). Go to Settings > Team to invite members via email. They'll receive an invitation link to join your workspace.",
      },
      {
        question: "How do I cancel my subscription?",
        answer: "You can cancel anytime from Settings > Billing. Your subscription will remain active until the end of your current billing period. After cancellation, you'll retain access to your workflows and data, but won't be able to create new workflows or execute existing ones beyond your plan limits.",
      },
    ],
  },
  {
    category: "Features & Usage",
    icon: Zap,
    questions: [
      {
        question: "How do I create a new workflow?",
        answer: "Click 'Create Workflow' from your dashboard. Choose a template or start from scratch. Use the visual builder to add triggers (what starts the workflow) and actions (what happens next). Connect them with conditions and logic. Test your workflow, then activate it. Our templates make it easy to get started quickly.",
      },
      {
        question: "What integrations are available?",
        answer: "We integrate with 100+ popular tools including Shopify, Wave Accounting, Google Workspace, Slack, Microsoft 365, Zapier, Make, HubSpot, Salesforce, Mailchimp, and many more. Check our Integrations page for the full list. Need a custom integration? Contact our consultancy team.",
      },
      {
        question: "Can I use AI in my workflows?",
        answer: "Absolutely! AIAS Platform includes built-in AI capabilities. Use AI agents to generate content, analyze data, make decisions, translate text, summarize documents, and more. Our AI agents use OpenAI, Anthropic Claude, and Google Gemini models.",
      },
      {
        question: "How do I monitor workflow performance?",
        answer: "Every workflow has a dashboard showing execution history, success rates, error logs, and performance metrics. You can set up alerts for failures, view real-time execution status, and export reports. Analytics help you optimize workflows for better performance.",
      },
      {
        question: "What are workflow templates?",
        answer: "Templates are pre-built workflows for common use cases like 'Lead Capture to CRM', 'E-commerce Order Processing', 'Customer Support Automation', and more. You can use them as-is or customize them to fit your needs. Templates save hours of setup time.",
      },
    ],
  },
  {
    category: "Troubleshooting",
    icon: AlertCircle,
    questions: [
      {
        question: "My workflow isn't executing. What should I check?",
        answer: "First, verify the workflow is activated (not in draft mode). Check the execution logs for error messages. Common issues: invalid API credentials, rate limits exceeded, missing required fields, or network timeouts. Review the error details in the workflow dashboard for specific guidance.",
      },
      {
        question: "I'm getting authentication errors with integrations.",
        answer: "Re-authenticate the integration from Settings > Integrations. OAuth tokens can expire or be revoked. If the issue persists, disconnect and reconnect the integration. For API key-based integrations, verify your API keys are correct and have the necessary permissions.",
      },
      {
        question: "Workflows are running slowly. How can I optimize them?",
        answer: "Check for bottlenecks: reduce unnecessary API calls, use webhooks instead of polling where possible, optimize conditions to fail fast, and consider splitting large workflows into smaller ones. Review the performance metrics in your workflow dashboard to identify slow steps.",
      },
      {
        question: "I can't find a specific feature. Where is it?",
        answer: "Use the search bar in the top navigation to find features quickly. Check our Features page for an overview of all capabilities. If you're looking for something specific, contact support - we may have it in development or can suggest a workaround.",
      },
      {
        question: "How do I export my workflows and data?",
        answer: "Go to Settings > Data Management > Export. You can export workflows as JSON files, download execution logs as CSV, and request a full data export. Exports are processed and emailed to you within 24 hours. This is useful for backups or migrating to a different plan.",
      },
    ],
  },
  {
    category: "Billing & Pricing",
    icon: Settings,
    questions: [
      {
        question: "What's included in the free plan?",
        answer: "The free plan includes 3 workflows, 500 API calls per month, access to basic templates, email support, and community access. Perfect for trying out the platform and small personal projects.",
      },
      {
        question: "How does billing work?",
        answer: "We offer monthly and annual billing. Annual plans save 20%. Billing is automatic on your renewal date. You can upgrade, downgrade, or cancel anytime. Changes take effect immediately, with prorated charges for upgrades.",
      },
      {
        question: "What happens if I exceed my plan limits?",
        answer: "You'll receive email notifications when approaching limits. Workflows will pause when limits are exceeded. You can upgrade your plan immediately to resume service, or wait until your next billing cycle when limits reset.",
      },
      {
        question: "Do you offer refunds?",
        answer: "We offer a 14-day money-back guarantee for new subscriptions. If you're not satisfied, contact support within 14 days for a full refund. After that, we don't offer refunds but you can cancel anytime to avoid future charges.",
      },
    ],
  },
  {
    category: "Security & Compliance",
    icon: AlertCircle,
    questions: [
      {
        question: "Is my data secure?",
        answer: "Absolutely. We use enterprise-grade security: end-to-end encryption, SOC 2 compliance (in progress), PIPEDA compliance, regular security audits, and Canadian data residency. All data is encrypted at rest and in transit. We never share your data with third parties.",
      },
      {
        question: "Where is my data stored?",
        answer: "All data is stored in Canada to comply with PIPEDA and ensure Canadian data residency. Our infrastructure uses Canadian data centers with redundant backups and 99.9% uptime SLA.",
      },
      {
        question: "Can I use AIAS Platform for sensitive data?",
        answer: "Yes, but review our security documentation first. We're PIPEDA compliant and suitable for most business use cases. For highly sensitive data (healthcare, financial services), contact us to discuss additional security measures and compliance requirements.",
      },
      {
        question: "How do you handle API security?",
        answer: "All API calls require authentication via API keys. Keys can be scoped to specific permissions. We use rate limiting, IP whitelisting (Enterprise plans), and monitor for suspicious activity. Rotate your API keys regularly for best security practices.",
      },
    ],
  },
];

export default function Help() {
  // Flatten FAQs for schema
  const allFAQs = faqs.flatMap((category) =>
    category.questions.map((q) => ({
      question: q.question,
      answer: q.answer,
    }))
  );

  return (
    <div className="container py-8 md:py-12 space-y-8">
      <FAQSchema faqs={allFAQs} />
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">Help Center</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions, learn how to use our platform, and get the support you need.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <BookOpen className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Documentation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive guides and tutorials
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/docs">View Docs</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <MessageCircle className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Contact Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get help from our team
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:support@aiautomatedsystems.ca">Email Us</a>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <Zap className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Book a Demo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              See the platform in action
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/demo">Schedule Demo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-6">
        {faqs.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${category.category}-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact Support */}
      <Card className="bg-muted">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Still Need Help?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our support team is here to help. We typically respond within 24 hours during business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button asChild size="lg">
                <a href="mailto:support@aiautomatedsystems.ca">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/demo">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Schedule a Demo
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>Response Time:</strong> Within 24 hours during business days (Monday-Friday, 9 AM - 5 PM EST)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
// [STAKE+TRUST:END:help_page]
