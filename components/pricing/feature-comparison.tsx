"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

const features = [
  {
    category: "Workflows & Automations",
    items: [
      { name: "Automation Workflows", free: "3", starter: "5", pro: "20" },
      { name: "Automations per Month", free: "100", starter: "10,000", pro: "50,000" },
      { name: "Workflow Templates", free: "Basic", starter: "10+", pro: "25+" },
    ],
  },
  {
    category: "Integrations",
    items: [
      { name: "Available Integrations", free: "2", starter: "5+", pro: "15+" },
      { name: "Shopify", free: true, starter: true, pro: true },
      { name: "Wave Accounting", free: true, starter: true, pro: true },
      { name: "Gmail / Google Workspace", free: false, starter: "Coming Soon", pro: "Coming Soon" },
      { name: "Slack", free: false, starter: "Coming Soon", pro: "Coming Soon" },
      { name: "More Integrations", free: false, starter: "Coming Soon", pro: "Coming Soon" },
    ],
  },
  {
    category: "Support & Setup",
    items: [
      { name: "Community Support", free: true, starter: true, pro: true },
      { name: "Email Support", free: false, starter: true, pro: true },
      { name: "Priority Support (24h)", free: false, starter: false, pro: true },
      { name: "Optional Setup Call", free: false, starter: "$99 one-time", pro: "$99 one-time" },
    ],
  },
  {
    category: "Analytics & Reporting",
    items: [
      { name: "Analytics Dashboard", free: false, starter: true, pro: true },
      { name: "Workflow Performance", free: false, starter: true, pro: true },
      { name: "Time Savings Tracking", free: false, starter: true, pro: true },
      { name: "Advanced Analytics", free: false, starter: false, pro: "Coming Soon" },
      { name: "Custom Reports", free: false, starter: false, pro: "Coming Soon" },
    ],
  },
  {
    category: "Advanced Features",
    items: [
      { name: "API Access", free: false, starter: false, pro: true },
      { name: "Team Collaboration", free: false, starter: false, pro: "Coming Soon" },
      { name: "White-label Options", free: false, starter: false, pro: false },
      { name: "Multi-currency Support", free: false, starter: true, pro: true },
    ],
  },
];

function FeatureValue({ value }: { value: string | boolean | undefined }) {
  if (value === true) {
    return <Check className="h-5 w-5 text-green-500" />;
  }
  if (value === false || value === undefined) {
    return <X className="h-5 w-5 text-muted-foreground" />;
  }
  if (typeof value === "string" && value.includes("Coming Soon")) {
    return <Badge variant="secondary" className="text-xs">Coming Soon</Badge>;
  }
  return <span className="text-sm font-medium">{value}</span>;
}

export function FeatureComparison() {
  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle className="text-2xl">Feature Comparison</CardTitle>
        <CardDescription>
          Compare plans to find the right fit for your business. All plans include a 30-day free trial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-semibold">Feature</th>
                <th className="text-center p-4 font-semibold">Free</th>
                <th className="text-center p-4 font-semibold">Starter</th>
                <th className="text-center p-4 font-semibold">Pro</th>
              </tr>
            </thead>
            <tbody>
              {features.map((category, categoryIdx) => (
                <React.Fragment key={categoryIdx}>
                  <tr className="bg-muted/50">
                    <td colSpan={4} className="p-3 font-semibold text-sm">
                      {category.category}
                    </td>
                  </tr>
                  {category.items.map((item, itemIdx) => (
                    <tr key={itemIdx} className="border-b hover:bg-muted/30">
                      <td className="p-4">{item.name}</td>
                      <td className="p-4 text-center">
                        <FeatureValue value={item.free} />
                      </td>
                      <td className="p-4 text-center">
                        <FeatureValue value={item.starter} />
                      </td>
                      <td className="p-4 text-center">
                        <FeatureValue value={item.pro} />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>Note:</strong> Starter and Pro plans are in Beta. Some features are in active development. 
            Features marked "Coming Soon" will be available in upcoming releases.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
