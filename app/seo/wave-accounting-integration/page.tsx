import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Wave Accounting Integration | AIAS Platform | Automate Your Accounting",
  description: "Integrate Wave Accounting with Shopify, Stripe, and more. Automate invoicing, expense tracking, and financial reporting. Canadian-first automation. Starting at $49/month.",
  keywords: "Wave Accounting integration, Wave automation, Wave Accounting Canada, accounting automation Canada",
};

export default function WaveAccountingIntegrationPage() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Wave Accounting Integration & Automation
          </h1>
          <p className="text-xl text-muted-foreground">
            Automate your Wave Accounting workflows. Sync invoices, expenses, and reports automatically. 
            Canadian-first automation for Canadian businesses.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Automate Wave Accounting Workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Wave Accounting is popular among Canadian small businesses, but manual data entry and 
              reconciliation takes hours every week. AIAS Platform integrates Wave Accounting with 
              Shopify, Stripe, PayPal, and more to automate your accounting workflows.
            </p>
            <p className="text-muted-foreground">
              With AIAS Platform, you can automatically sync invoices, expenses, and financial reports 
              between Wave Accounting and your other business tools. No more manual data entry, no more 
              errors, no more wasted time.
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
                  <h4 className="font-semibold">Invoice Sync</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync invoices from Shopify, Stripe, PayPal to Wave Accounting
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Expense Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically track expenses from bank accounts, credit cards, receipts
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Financial Reports</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate and send financial reports to your team
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Reconciliation</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically reconcile transactions between Wave and other platforms
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
                <h4 className="font-semibold">Native Wave Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Built specifically for Wave Accounting with full API access
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Canadian-First</h4>
                <p className="text-sm text-muted-foreground">
                  PIPEDA compliance built-in, Canadian data residency, CAD pricing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">Affordable</h4>
                <p className="text-sm text-muted-foreground">
                  $49/month for unlimited automations (vs. $150-500/month enterprise tools)
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
            Connect Wave Accounting in 30 minutes. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}
