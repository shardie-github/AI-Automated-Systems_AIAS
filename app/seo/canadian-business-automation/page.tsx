import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Canadian Business Automation | AIAS Platform | Save 10+ Hours/Week",
  description: "Automate repetitive tasks for Canadian businesses. Order processing, lead qualification, proposal generation. Save 10+ hours/week with Canadian-first automation. Starting at $49/month.",
  keywords: "Canadian business automation, automation Canada, Canadian SMB automation, business automation tools Canada",
};

export default function CanadianBusinessAutomationPage() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Business Automation for Canadian SMBs
          </h1>
          <p className="text-xl text-muted-foreground">
            Automate repetitive tasks and save 10+ hours/week. Built specifically for Canadian businesses with native integrations and PIPEDA compliance.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>The Problem: Canadian SMBs Waste 10-30 Hours/Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Canadian small and medium businesses waste countless hours on repetitive tasks that should be automated. 
              From order processing to lead qualification to proposal writing, these manual tasks eat into time that 
              could be spent growing your business.
            </p>
            <p className="text-muted-foreground">
              Existing automation tools are either too expensive ($150-500/month) or too complex to set up. 
              That's why we built AIAS Platform—an affordable ($49/month), no-code automation platform built 
              specifically for Canadian SMBs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Who We Help</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">E-Commerce Stores</h4>
                <p className="text-sm text-muted-foreground">
                  Automate order processing, inventory sync, customer follow-ups
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Consultants</h4>
                <p className="text-sm text-muted-foreground">
                  Automate proposal generation, client follow-ups, reporting
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Real Estate Agents</h4>
                <p className="text-sm text-muted-foreground">
                  Automate lead qualification, showing scheduling, follow-ups
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why AIAS Platform?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Canadian-First</h4>
                <p className="text-sm text-muted-foreground">
                  Native integrations for Shopify, Wave Accounting, RBC, TD, Interac. PIPEDA compliance built-in.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Affordable</h4>
                <p className="text-sm text-muted-foreground">
                  $49/month starter plan (vs. $150-500/month enterprise tools)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">No-Code</h4>
                <p className="text-sm text-muted-foreground">
                  Visual workflow builder. Drag, drop, connect. No coding required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Start automating your business in 30 minutes. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}
