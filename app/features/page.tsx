import { Metadata } from "next";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TextReveal } from "@/components/ui/TextReveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";
import { ParallaxBackground } from "@/components/ui/ParallaxBackground";

export const metadata: Metadata = {
  title: "Features — Systems Thinking + AI | AIAS Platform",
  description: "Systems thinking is THE critical skill for the AI age. Combined with AI automation, it creates unstoppable results. Multi-dimensional analysis, root cause identification, holistic solutions.",
};

const featureCategories = [
  {
    title: "Smart Problem Solving",
    description: "See problems from all angles. Find root causes, not symptoms. Design solutions that actually work.",
    features: [
      {
        name: "Multi-Perspective Analysis",
        description: "Analyze challenges from multiple angles to find the best solutions.",
      },
      {
        name: "Root Cause Identification",
        description: "Find underlying causes, not just symptoms. Fix problems for good.",
      },
      {
        name: "Integrated Solutions",
        description: "Design solutions that work together. Avoid point fixes that create new problems.",
      },
      {
        name: "Better Decision Making",
        description: "Understand how everything connects. Make decisions with confidence.",
      },
    ],
  },
  {
    title: "AI-Powered Automation",
    description: "Let AI handle the repetitive work. You focus on strategy and growth.",
    features: [
      {
        name: "Automated Workflows",
        description: "AI handles tasks, processes data, and scales execution automatically.",
      },
      {
        name: "Smart Insights",
        description: "Get recommendations and insights that help you make better decisions.",
      },
      {
        name: "Time Savings",
        description: "Save 10+ hours per week by automating repetitive tasks.",
      },
      {
        name: "Scalable Growth",
        description: "Automate as you grow. High-volume automation limits scale with your plan.",
      },
    ],
  },
  {
    title: "GenAI Content Engine",
    description: "AI-powered blog and article analysis engine for automated website creation. Systems thinking + GenAI analyzes content from 6 perspectives and generates optimized websites automatically.",
    features: [
      {
        name: "Blog & Article Analysis",
        description: "Analyze existing content from SEO, UX, structure, conversion, technical, and systems perspectives. Systems thinking reveals optimization opportunities.",
      },
      {
        name: "Automated Website Generation",
        description: "GenAI generates optimized website pages, blog posts, and content based on systems thinking analysis. SEO-optimized, user-friendly, conversion-focused.",
      },
      {
        name: "Multi-Perspective Optimization",
        description: "Content optimized from all 6 perspectives, not just keywords. Systems thinking ensures holistic website creation.",
      },
      {
        name: "Continuous Improvement",
        description: "Ongoing analysis and optimization. Systems thinking monitors performance and generates improvements automatically.",
      },
    ],
  },
  {
    title: "Global Integrations",
    description: "100+ integrations worldwide built for your business",
    features: [
      {
        name: "E-Commerce Platforms",
        description: "Shopify (available), WooCommerce (coming soon), BigCommerce (coming soon). Automate order processing, inventory, customer support.",
      },
      {
        name: "Accounting & Finance",
        description: "Wave Accounting (available), QuickBooks (coming soon), Stripe CAD (coming soon). Automate invoicing, payments, bookkeeping.",
      },
      {
        name: "Banking & Payments",
        description: "RBC (coming soon), TD (coming soon), Interac (coming soon), PayPal CAD (coming soon). Automate payments, transfers, reconciliation.",
      },
      {
        name: "CRM & Sales",
        description: "HubSpot (coming soon), Salesforce (coming soon), Pipedrive (coming soon). Automate lead qualification, follow-ups, pipeline management.",
      },
    ],
  },
  {
    title: "Automation & Workflows",
    description: "Automate repetitive tasks and save 10+ hours/week",
    features: [
      {
        name: "Workflow Automation",
        description: "Connect tools with visual workflows. Automate multi-step processes across platforms.",
      },
      {
        name: "Smart Scheduling",
        description: "AI-powered scheduling that understands context. Avoid double-booking, optimize time slots.",
      },
      {
        name: "Data Processing",
        description: "Automatically process invoices, emails, forms. Extract and organize data intelligently.",
      },
      {
        name: "Error Reduction",
        description: "Reduce manual errors by 90%. AI validation and error handling built-in.",
      },
    ],
  },
  {
    title: "Analytics & Insights",
    description: "Real-time analytics on your AI agents and workflows",
    features: [
      {
        name: "Performance Dashboard",
        description: "Track agent performance, automation success rates, time saved, ROI metrics.",
      },
      {
        name: "Usage Analytics",
        description: "Monitor usage patterns, identify optimization opportunities, track costs.",
      },
      {
        name: "Custom Reports",
        description: "Generate reports for stakeholders. Export data for further analysis.",
      },
      {
        name: "ROI Tracking",
        description: "See how much time and money you're saving. Calculate ROI automatically.",
      },
    ],
  },
  {
    title: "Security & Compliance",
    description: "Enterprise-grade security with Canadian compliance",
    features: [
      {
        name: "PIPEDA Compliant",
        description: "Canadian privacy law compliance. PIPEDA-compliant privacy policy and data handling.",
      },
      {
        name: "Data Residency",
        description: "Canadian data centers (primary). US fallback disclosed. Your data stays in Canada where possible.",
      },
      {
        name: "Enterprise Security",
        description: "SOC 2 Type II (in progress). AES-256 encryption. Regular security audits. PIPEDA compliant.",
      },
      {
        name: "Access Controls",
        description: "Role-based access control. Audit logging. Compliance reporting.",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <ParallaxBackground className="container py-16">
      <div className="text-center mb-12">
        <TextReveal
          as="h1"
          className="text-4xl md:text-5xl font-bold mb-4 block"
          delay={0.1}
          staggerDelay={0.03}
        >
          Powerful Features. Simple Setup.
        </TextReveal>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Automate workflows, analyze campaigns, and get personalized insights. Everything you need to save time and grow your business.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          ⚡ Quick Setup • 🔄 High-Volume Automations • 📊 Analytics Dashboard
        </div>
      </div>

      {featureCategories.map((category) => (
        <section key={category.title} className="mb-16">
          <div className="text-center mb-8">
            <TextReveal
              as="h2"
              className="text-3xl font-bold mb-2"
              delay={0.2}
              staggerDelay={0.02}
            >
              {category.title}
            </TextReveal>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
          <BentoGrid columns={2} className="gap-6">
            {category.features.map((feature) => (
              <BentoGridItem key={feature.name} colSpan={1} rowSpan={1}>
                <SpotlightCard>
                  <Card className="border-0 bg-transparent shadow-none h-full">
                    <CardHeader>
                      <CardTitle>{feature.name}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </SpotlightCard>
              </BentoGridItem>
            ))}
          </BentoGrid>
        </section>
      ))}

      <div className="text-center mt-12 space-y-4 bg-primary/5 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-2">Ready to Automate Your Workflows?</h2>
        <p className="text-muted-foreground mb-4">
          Start your 30-day free trial. No credit card required. Connect your tools and automate your first workflow in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/signup">Start 30-Day Free Trial</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">See Pricing</Link>
          </Button>
        </div>
      </div>
    </ParallaxBackground>
  );
}
