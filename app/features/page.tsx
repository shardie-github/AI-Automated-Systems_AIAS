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
    title: "Systems Thinking Framework",
    description: "THE critical skill for the AI age. Analyze problems from multiple perspectives.",
    features: [
      {
        name: "6-Perspective Analysis",
        description: "Every challenge analyzed through process, technology, people, data, systems, AND automation. Systems thinking reveals optimal solutions.",
      },
      {
        name: "Root Cause Identification",
        description: "Find underlying causes, not symptoms. Systems thinking identifies leverage points for sustainable change.",
      },
      {
        name: "Holistic Solution Design",
        description: "Design integrated solutions that work together. Systems thinking creates synergies that point solutions cannot.",
      },
      {
        name: "Multi-Dimensional Problem Solving",
        description: "Understand system interconnections, feedback loops, and unintended consequences. Systems thinking prevents costly mistakes.",
      },
    ],
  },
  {
    title: "AI + Systems Thinking",
    description: "AI amplifies systems thinking — it doesn't replace it",
    features: [
      {
        name: "AI Handles Execution",
        description: "AI automates tasks, processes data, and scales execution. Systems thinking directs AI effectively.",
      },
      {
        name: "Systems Thinking Creates Strategy",
        description: "Systems thinking defines problems, designs solutions, and creates strategy. AI amplifies systems thinking.",
      },
      {
        name: "Unstoppable Combination",
        description: "Together, AI and systems thinking create optimal outcomes. AI scales execution, systems thinking ensures optimal direction.",
      },
      {
        name: "Job Market Advantage",
        description: "Systems thinking is uniquely human, irreplaceable. Combined with AI, it's the competitive advantage in the AI age.",
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
        description: "Shopify, WooCommerce, BigCommerce. Automate order processing, inventory, customer support.",
      },
      {
        name: "Accounting & Finance",
        description: "Wave Accounting, QuickBooks, Stripe CAD. Automate invoicing, payments, bookkeeping.",
      },
      {
        name: "Banking & Payments",
        description: "RBC, TD, Interac, PayPal CAD. Automate payments, transfers, reconciliation.",
      },
      {
        name: "CRM & Sales",
        description: "HubSpot, Salesforce, Pipedrive. Automate lead qualification, follow-ups, pipeline management.",
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
        description: "SOC 2 Type II (planned Q2 2024). AES-256 encryption. Regular security audits.",
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
          Systems Thinking + AI: The Complete Solution
        </TextReveal>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Systems thinking is THE critical skill for the AI age. It's what makes you stand out in the job market, 
          succeed in business, and achieve optimal outcomes. Combined with AI automation, it's unstoppable.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          🧠 Systems Thinking • 🤖 AI-Powered • 🎯 Optimal Outcomes
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
        <h2 className="text-2xl font-bold mb-2">Systems Thinking: The Critical Skill for the AI Age</h2>
        <p className="text-muted-foreground mb-4">
          Systems thinking is THE skill needed more than ever. It's what makes you stand out in the job market, 
          succeed in business, and achieve optimal outcomes. AI amplifies systems thinking — it doesn't replace it.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/systems-thinking">Learn About Systems Thinking</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/demo">Book Consultation</Link>
          </Button>
        </div>
      </div>
    </ParallaxBackground>
  );
}
