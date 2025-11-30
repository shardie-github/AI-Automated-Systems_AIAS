import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Check } from "lucide-react";
import { PricingAnalytics } from "@/components/pricing/PricingAnalytics";

export const metadata: Metadata = {
  title: "Pricing — AIAS Platform | Starting at $49/month | Multi-Currency Support",
  description: "Affordable AI automation for businesses worldwide. Free plan available. Starting at $49/month (CAD/USD/EUR). Multi-currency support. Cancel anytime.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "month",
    tagline: "Perfect for trying AIAS Platform",
    description: "Get started with AI automation at no cost. Perfect for testing workflows, learning the platform, and automating small tasks.",
    features: [
      "3 AI agents to automate your workflows",
      "100 automations per month",
      "Basic templates to get started",
      "Community support and resources",
      "No credit card required",
    ],
    cta: "Start Free",
    popular: false,
    annualPrice: null,
  },
  {
    name: "Starter",
    price: "$49",
    period: "month",
    tagline: "For solo operators and small businesses",
    description: "Everything you need to automate your business operations. Save 10+ hours per week with unlimited automations and Canadian-first integrations.",
    features: [
      "10 AI agents for comprehensive automation",
      "Unlimited automations—never worry about limits",
      "50+ pre-built templates for common workflows",
      "20+ Canadian integrations (Shopify, Wave, RBC, TD)",
      "Email support with 24-48h response time",
      "Analytics dashboard",
      "Multi-currency support (CAD/USD/EUR)",
      "Cancel anytime",
    ],
    cta: "Start Free Trial",
    popular: true,
    annualPrice: "$490",
    annualSavings: "$98",
    annualDiscount: "20%",
  },
  {
    name: "Pro",
    price: "$149",
    period: "month",
    tagline: "For small teams (2-10 employees)",
    description: "Advanced features for growing teams. Collaborate, scale, and automate everything with priority support and advanced analytics.",
    features: [
      "50 AI agents for team-wide automation",
      "Unlimited automations",
      "All workflow templates (100+)",
      "Advanced integrations (50+)",
      "Priority support (24h response)",
      "Advanced analytics & reporting",
      "Team collaboration features",
      "API access",
      "White-label options available",
    ],
    cta: "Start Free Trial",
    popular: false,
    annualPrice: "$1,490",
    annualSavings: "$298",
    annualDiscount: "20%",
  },
];

export default function PricingPage() {
  return (
    <div className="container py-12 md:py-16 px-4">
      <PricingAnalytics />
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
          Multi-currency support: CAD, USD, EUR, GBP, and more. Prices shown in your local currency. Transparent pricing. Cancel anytime.
        </p>
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-primary/10 text-primary text-sm md:text-base font-semibold border border-primary/20">
          <span>🇨🇦 Built in Canada</span>
          <span>•</span>
          <span>🌍 Global Pricing</span>
          <span>•</span>
          <span>💳 Multi-Currency Support</span>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm md:text-base text-muted-foreground">
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
            No credit card required
          </span>
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
            14-day free trial
          </span>
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
            Cancel anytime
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-12">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative transition-all hover:shadow-xl ${
              plan.popular 
                ? "border-2 border-primary shadow-2xl scale-105 md:scale-110 bg-gradient-to-br from-primary/5 to-transparent" 
                : "border-2 hover:border-primary/50"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="text-sm font-medium text-primary mt-1">
                {plan.tagline}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
                <p className="text-xs text-muted-foreground mt-1">Multi-currency available</p>
              </div>
              {plan.annualPrice && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground line-through">
                    ${(parseInt(plan.price.replace('$', '')) * 12).toLocaleString()}/year
                  </span>
                  <span className="text-sm font-medium text-primary ml-2">
                    {plan.annualPrice}/year (save {plan.annualSavings}) • Save {plan.annualDiscount}
                  </span>
                </div>
              )}
              <CardDescription className="mt-2 text-sm">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full h-12 md:h-14 text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                variant={plan.popular ? "default" : "outline"}
                size="lg"
                asChild
              >
                <Link href="/signup" aria-label={`${plan.cta} - ${plan.name} plan`}>
                  {plan.cta}
                </Link>
              </Button>
              {plan.popular && (
                <p className="text-center text-xs md:text-sm text-muted-foreground mt-3">
                  ✨ Most popular choice
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What currencies and payment methods do you accept?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We accept all major credit cards (Visa, Mastercard, American Express) and process payments through Stripe. 
              Multi-currency support: CAD, USD, EUR, GBP, AUD, and more. Prices are displayed in your local currency. 
              Taxes (GST/HST, VAT, etc.) are calculated automatically based on your location.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Can I cancel anytime?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Yes! Cancel anytime with no questions asked. You'll continue to have access until the end of your billing period.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Do you offer annual discounts?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Yes! Save 20% when you pay annually. Starter plan: CAD $490/year (save $98). Pro plan: CAD $1,490/year (save $298).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Is there a free trial?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Yes! Start with our free plan (3 agents, 100 automations/month) or get a 14-day free trial of any paid plan. 
              No credit card required.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What Canadian integrations do you support?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We support 20+ Canadian integrations including Shopify, Wave Accounting, Stripe CAD, RBC, TD, Interac, 
              and more. See our <Link href="/integrations" className="text-primary hover:underline">integrations page</Link> for the full list.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground mb-4">
          Need a custom plan for your team?
        </p>
        <Button variant="outline" asChild>
          <Link href="/demo">Contact Sales</Link>
        </Button>
      </div>
    </div>
  );
}
