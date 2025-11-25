import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

export const metadata: Metadata = {
  title: "Compare — AIAS Platform vs Zapier vs Make | Canadian Business Automation",
  description: "Compare AIAS Platform with Zapier and Make. See why Canadian businesses choose AIAS for automation: Canadian integrations, affordable pricing, visual builder.",
};

const competitors = [
  {
    name: "AIAS Platform",
    tagline: "Canadian-First Business Automation",
    pricing: "$49/month",
    features: {
      canadianIntegrations: true,
      visualBuilder: true,
      aiAgents: true,
      affordable: true,
      pipedaCompliance: true,
      canadianSupport: true,
      preBuiltTemplates: true,
      noCodingRequired: true,
    },
    highlights: [
      "20+ Canadian integrations (Shopify, Wave, RBC, TD, Interac)",
      "Visual drag-and-drop builder (no coding)",
      "AI-powered automation (intelligent workflows)",
      "PIPEDA compliance built-in",
      "Canadian support team",
      "50+ pre-built templates",
    ],
  },
  {
    name: "Zapier",
    tagline: "Global Automation Platform",
    pricing: "$50/month (5 automations)",
    features: {
      canadianIntegrations: false,
      visualBuilder: true,
      aiAgents: false,
      affordable: false,
      pipedaCompliance: false,
      canadianSupport: false,
      preBuiltTemplates: true,
      noCodingRequired: false,
    },
    highlights: [
      "5,000+ integrations (global focus)",
      "Technical setup (webhooks, API keys)",
      "Rule-based automation only",
      "GDPR compliance (not PIPEDA)",
      "US support team",
      "Templates available",
    ],
  },
  {
    name: "Make (formerly Integromat)",
    tagline: "Visual Automation Platform",
    pricing: "$9-29/month (limited automations)",
    features: {
      canadianIntegrations: false,
      visualBuilder: true,
      aiAgents: false,
      affordable: false,
      pipedaCompliance: false,
      canadianSupport: false,
      preBuiltTemplates: true,
      noCodingRequired: false,
    },
    highlights: [
      "1,000+ integrations (global focus)",
      "Visual builder (but technical)",
      "Rule-based automation only",
      "GDPR compliance (not PIPEDA)",
      "European support team",
      "Templates available",
    ],
  },
];

const featureComparison = [
  { label: "Canadian Integrations (Shopify, Wave, RBC, TD)", key: "canadianIntegrations" },
  { label: "Visual Builder (No Coding)", key: "visualBuilder" },
  { label: "AI-Powered Automation", key: "aiAgents" },
  { label: "Affordable Pricing", key: "affordable" },
  { label: "PIPEDA Compliance", key: "pipedaCompliance" },
  { label: "Canadian Support", key: "canadianSupport" },
  { label: "Pre-Built Templates", key: "preBuiltTemplates" },
  { label: "No Coding Required", key: "noCodingRequired" },
];

export default function ComparePage() {
  return (
    <div className="container py-16">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Compare AIAS Platform vs Competitors
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See why Canadian businesses choose AIAS Platform for automation: Canadian integrations, affordable pricing, visual builder, and AI-powered workflows.
          </p>
        </div>

        {/* Feature Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
            <CardDescription>Compare AIAS Platform with Zapier and Make</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    {competitors.map((competitor) => (
                      <th key={competitor.name} className="text-center p-4 font-semibold">
                        {competitor.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featureComparison.map((feature) => (
                    <tr key={feature.key} className="border-b">
                      <td className="p-4">{feature.label}</td>
                      {competitors.map((competitor) => (
                        <td key={competitor.name} className="text-center p-4">
                          {competitor.features[feature.key as keyof typeof competitor.features] ? (
                            <Check className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-600 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {competitors.map((competitor) => (
            <Card
              key={competitor.name}
              className={competitor.name === "AIAS Platform" ? "border-primary shadow-lg" : ""}
            >
              {competitor.name === "AIAS Platform" && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                  Recommended for Canadian Businesses
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{competitor.name}</CardTitle>
                <CardDescription>{competitor.tagline}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{competitor.pricing}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {competitor.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      {competitor.name === "AIAS Platform" ? (
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      ) : (
                        <span className="text-muted-foreground">•</span>
                      )}
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why Choose AIAS */}
        <Card className="bg-primary/5 border-primary">
          <CardHeader>
            <CardTitle>Why Canadian Businesses Choose AIAS Platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Canadian-First Integrations</h3>
              <p className="text-muted-foreground text-sm">
                Native integrations with Canadian tools (Shopify, Wave Accounting, RBC, TD, Interac) that competitors don't have. Built for Canadian business workflows.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Affordable Pricing</h3>
              <p className="text-muted-foreground text-sm">
                $49/month for unlimited automations vs. $50/month for just 5 automations (Zapier) or $9-29/month for limited automations (Make). Clear ROI for Canadian SMBs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Visual Builder (No Coding)</h3>
              <p className="text-muted-foreground text-sm">
                Drag-and-drop workflow builder that's easier to use than Zapier's technical setup (webhooks, API keys). No coding required.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">4. AI-Powered Automation</h3>
              <p className="text-muted-foreground text-sm">
                AI agents for intelligent automation (vs. rule-based only). Pre-trained on Canadian business contexts. Customizable to your brand voice.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">5. PIPEDA Compliance</h3>
              <p className="text-muted-foreground text-sm">
                PIPEDA compliance built-in (not just GDPR). Canadian data residency. Transparent privacy policies. Built for Canadian regulations.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <p className="text-lg mb-4">Ready to automate your Canadian business?</p>
          <a
            href="/signup"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </div>
  );
}
