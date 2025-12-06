import { Metadata } from "next";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Integrations — AIAS Platform | 100+ Global Business Tools & Platforms",
  description: "Connect 100+ business tools worldwide: Shopify, Stripe, PayPal, Google Workspace, Salesforce, HubSpot, QuickBooks, and more. Support for Canadian, US, EU, and APAC markets.",
};

const integrations = [
  {
    category: "E-Commerce",
    description: "Automate your online store operations globally",
    tools: [
      { name: "Shopify", description: "Order processing, inventory, customer support (Global)", status: "available" },
      { name: "WooCommerce", description: "E-commerce automation for WordPress (Global)", status: "coming-soon" },
      { name: "BigCommerce", description: "Store management and order fulfillment (Global)", status: "coming-soon" },
      { name: "Magento", description: "Enterprise e-commerce automation", status: "coming-soon" },
      { name: "Amazon", description: "Marketplace automation and fulfillment", status: "coming-soon" },
    ],
  },
  {
    category: "Accounting & Finance",
    description: "Streamline your financial operations worldwide",
    tools: [
      { name: "QuickBooks", description: "Accounting automation (US, CA, UK, AU)", status: "coming-soon" },
      { name: "Xero", description: "Cloud accounting (Global)", status: "coming-soon" },
      { name: "Wave Accounting", description: "Invoicing, bookkeeping (CA, US)", status: "available" },
      { name: "Sage", description: "Accounting software (Global)", status: "coming-soon" },
      { name: "FreshBooks", description: "Cloud-based accounting (Global)", status: "coming-soon" },
    ],
  },
  {
    category: "Payment Processing",
    description: "Global payment processors and banking",
    tools: [
      { name: "Stripe", description: "Payment processing (Global, multi-currency)", status: "coming-soon" },
      { name: "PayPal", description: "Payment and invoice automation (Global)", status: "coming-soon" },
      { name: "Square", description: "Payment processing (US, CA, UK, AU, JP)", status: "coming-soon" },
      { name: "Adyen", description: "Enterprise payments (Global)", status: "coming-soon" },
      { name: "RBC / TD Bank", description: "Canadian banking automation", status: "coming-soon" },
      { name: "Wise (formerly TransferWise)", description: "International money transfers", status: "coming-soon" },
    ],
  },
  {
    category: "CRM & Sales",
    description: "Manage your customer relationships globally",
    tools: [
      { name: "Salesforce", description: "Sales pipeline and customer data (Global)", status: "coming-soon" },
      { name: "HubSpot", description: "CRM automation and lead management (Global)", status: "coming-soon" },
      { name: "Pipedrive", description: "Sales process automation (Global)", status: "coming-soon" },
      { name: "Zoho CRM", description: "CRM platform (Global)", status: "coming-soon" },
      { name: "Microsoft Dynamics", description: "Enterprise CRM (Global)", status: "coming-soon" },
    ],
  },
  {
    category: "Communication",
    description: "Automate your communication workflows worldwide",
    tools: [
      { name: "Gmail / Google Workspace", description: "Email automation (Global)", status: "coming-soon" },
      { name: "Microsoft Outlook / 365", description: "Email and calendar (Global)", status: "coming-soon" },
      { name: "Slack", description: "Team communication (Global)", status: "coming-soon" },
      { name: "Microsoft Teams", description: "Workplace collaboration (Global)", status: "coming-soon" },
      { name: "Zoom", description: "Video conferencing automation (Global)", status: "coming-soon" },
      { name: "WhatsApp Business", description: "Messaging automation (Global)", status: "coming-soon" },
    ],
  },
  {
    category: "Productivity & Education",
    description: "Boost productivity and support education workflows",
    tools: [
      { name: "Google Workspace", description: "Docs, Sheets, Calendar (Global)", status: "coming-soon" },
      { name: "Microsoft 365", description: "Office productivity suite (Global)", status: "coming-soon" },
      { name: "Notion", description: "Knowledge base and project management (Global)", status: "coming-soon" },
      { name: "Airtable", description: "Database and workflow automation (Global)", status: "coming-soon" },
      { name: "Asana", description: "Project management (Global)", status: "coming-soon" },
      { name: "Trello", description: "Task management (Global)", status: "coming-soon" },
      { name: "Moodle / Canvas", description: "Learning management systems (Global)", status: "coming-soon" },
      { name: "Google Classroom", description: "Education platform automation", status: "coming-soon" },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="container py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Global Integrations for Every Market
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect business tools worldwide. Built in Canada, designed for global markets. 
          Support for North America, Europe, Asia-Pacific, and beyond. No coding required — connect in minutes.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          🇨🇦 Built in Canada • 🌍 More Integrations Coming Soon
        </div>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg max-w-3xl mx-auto">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Current Status:</strong> Shopify and Wave Accounting are available now. More integrations are being added regularly. 
            See below for availability status of each integration.
          </p>
        </div>
        <div className="mt-6 p-6 bg-primary/5 rounded-lg max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-2">🇨🇦 Canadian Integrations — Our Specialty</h2>
          <p className="text-muted-foreground mb-4">
            We specialize in Canadian business tools: Shopify, Wave Accounting, Stripe CAD, RBC, TD, Interac, and more. 
            Built for Canadian businesses with Canadian data residency options.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-sm font-medium border border-green-300 dark:border-green-700">
              Shopify <Badge className="ml-1 bg-green-500 text-xs">Available</Badge>
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-sm font-medium border border-green-300 dark:border-green-700">
              Wave Accounting <Badge className="ml-1 bg-green-500 text-xs">Available</Badge>
            </span>
            <span className="px-3 py-1 bg-background rounded-full text-sm font-medium">Stripe CAD <Badge variant="secondary" className="ml-1 text-xs">Soon</Badge></span>
            <span className="px-3 py-1 bg-background rounded-full text-sm font-medium">RBC <Badge variant="secondary" className="ml-1 text-xs">Soon</Badge></span>
            <span className="px-3 py-1 bg-background rounded-full text-sm font-medium">TD Bank <Badge variant="secondary" className="ml-1 text-xs">Soon</Badge></span>
            <span className="px-3 py-1 bg-background rounded-full text-sm font-medium">Interac <Badge variant="secondary" className="ml-1 text-xs">Soon</Badge></span>
          </div>
        </div>
      </div>

      {integrations.map((category) => (
        <section key={category.category} className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{category.category}</h2>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {category.tools.map((tool) => (
              <Card key={tool.name}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    {tool.status === "available" ? (
                      <Badge className="bg-green-500">Available</Badge>
                    ) : (
                      <Badge variant="secondary">Coming Soon</Badge>
                    )}
                  </div>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-12 text-center space-y-4">
        <h2 className="text-2xl font-bold">Don't See Your Tool?</h2>
        <p className="text-muted-foreground">
          We're constantly adding new integrations. Request one or build your own with our API.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/help">Request Integration</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/api">View API Docs</Link>
          </Button>
        </div>
      </div>

      <div className="mt-12 text-center space-y-4 bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold">Ready to Connect Your Tools?</h2>
        <p className="text-muted-foreground">
          Start automating your workflows today. Connect your first integration in minutes.
        </p>
        <Button size="lg" asChild>
          <Link href="/pricing">Start Free Trial</Link>
        </Button>
      </div>
    </div>
  );
}
