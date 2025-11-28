import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Shopify Automation Canada | AIAS Platform | Save 10+ Hours/Week",
  description: "Automate your Shopify store operations in Canada. Order processing, inventory sync, customer follow-ups. Save 10+ hours/week with Canadian-first automation. Starting at $49/month.",
  keywords: "Shopify automation Canada, Canadian Shopify automation, order processing automation, Shopify integrations Canada",
};

export default function ShopifyAutomationCanadaPage() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Shopify Automation for Canadian Stores
          </h1>
          <p className="text-xl text-muted-foreground">
            Automate order processing, inventory sync, and customer follow-ups. Save 10+ hours/week with Canadian-first automation.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Why Canadian Shopify Stores Need Automation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Canadian Shopify store owners waste 5-10 hours per week on manual order processing. 
              From order confirmations to shipping labels to inventory updates, these repetitive tasks 
              eat into time that could be spent growing your business.
            </p>
            <p className="text-muted-foreground">
              AIAS Platform is built specifically for Canadian Shopify stores. With native integrations 
              for Shopify, Wave Accounting, RBC, TD, and Interac, plus PIPEDA compliance built-in, 
              we make automation accessible and affordable for Canadian SMBs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What You Can Automate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Order Processing</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically send order confirmations, generate shipping labels, update inventory
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Customer Follow-Ups</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically send thank you emails, review requests, upsell offers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Inventory Sync</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync inventory across Shopify, Wave Accounting, and other platforms
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Sales Reports</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate and send sales reports to your team
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why Choose AIAS Platform?</CardTitle>
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
                  $49/month for unlimited automations (vs. $50/month for just 5 automations with Zapier)
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
            Start automating your Shopify store in 30 minutes. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}
