import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, ArrowRight, Shield, Globe, Building2, FileText, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Canadian Business Automation | PIPEDA Compliant | AIAS Platform",
  description: "Automation platform built in Canada for Canadian businesses. PIPEDA compliant, Canadian data residency, and native support for Canadian tools like Shopify, Wave, RBC, TD.",
  keywords: [
    "Canadian automation",
    "PIPEDA compliant automation",
    "Canadian data residency",
    "Canadian business automation",
    "Shopify automation Canada",
    "Wave Accounting automation",
    "Canadian integrations",
    "GST HST automation",
  ],
};

export default function CanadianAutomationPage() {
  return (
    <div className="container py-12 md:py-16 px-4">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
          <Globe className="h-4 w-4" />
          <span>🇨🇦 Built in Canada, Serving the World</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Canadian Business Automation
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Automation platform built in Canada for Canadian businesses. PIPEDA compliant, 
          Canadian data residency, and native support for Canadian tools.
        </p>
      </div>

      {/* Why Canadian */}
      <div className="max-w-4xl mx-auto mb-12">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Why Choose Canadian-Built Automation?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">PIPEDA Compliant</h3>
                <p className="text-sm text-muted-foreground">
                  Built to comply with Canada's Personal Information Protection and Electronic Documents Act. 
                  Your data is handled according to Canadian privacy laws.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Canadian Data Residency</h3>
                <p className="text-sm text-muted-foreground">
                  Primary data centers in Canada. Your data stays in Canada where possible, 
                  with transparent disclosure of any US fallback options.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Canadian Integrations</h3>
                <p className="text-sm text-muted-foreground">
                  Native support for Canadian tools: Shopify, Wave Accounting, RBC, TD, 
                  Interac, Stripe CAD, and more.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Multi-Currency Support</h3>
                <p className="text-sm text-muted-foreground">
                  Prices shown in CAD, USD, EUR, and more. Transparent pricing with 
                  automatic GST/HST calculation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Canadian Integrations */}
      <div className="max-w-6xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Canadian Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              category: "Payments & Banking",
              icon: CreditCard,
              integrations: [
                "Stripe CAD",
                "RBC (Royal Bank of Canada)",
                "TD Bank",
                "Interac e-Transfer",
                "PayPal CAD",
              ],
            },
            {
              category: "Accounting & Finance",
              icon: FileText,
              integrations: [
                "Wave Accounting",
                "QuickBooks Canada",
                "GST/HST Tracking",
                "Canadian Tax Forms",
              ],
            },
            {
              category: "E-Commerce",
              icon: Building2,
              integrations: [
                "Shopify",
                "WooCommerce",
                "BigCommerce",
                "Canadian Shipping",
              ],
            },
          ].map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.integrations.map((integration, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{integration}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* PIPEDA Compliance */}
      <div className="max-w-4xl mx-auto mb-12">
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="text-2xl">PIPEDA Compliance: What You Need to Know</CardTitle>
            <CardDescription>
              Understanding Canada's privacy laws and how AIAS Platform complies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What is PIPEDA?</h3>
              <p className="text-sm text-muted-foreground">
                The Personal Information Protection and Electronic Documents Act (PIPEDA) is Canada's 
                federal privacy law for private-sector organizations. It governs how businesses collect, 
                use, and disclose personal information.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How AIAS Platform Complies</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Explicit consent for data collection and use</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Purpose limitation (data used only for stated purposes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Data minimization (collect only what's necessary)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Security safeguards (encryption, access controls)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Right to access and correct personal information</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Transparent data practices (clear privacy policy)</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto text-center">
        <Card className="bg-primary/5">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Ready for Canadian-Built Automation?</h2>
            <p className="text-muted-foreground mb-6">
              Start your free trial today. Built in Canada, PIPEDA compliant, with native support for Canadian tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/integrations">See All Integrations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
