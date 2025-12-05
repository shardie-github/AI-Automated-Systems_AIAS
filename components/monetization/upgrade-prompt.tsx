"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Lock, ArrowRight, TrendingUp, Clock } from "lucide-react";
import type { PlanTier } from "@/config/plans";

interface UpgradePromptProps {
  currentPlan: PlanTier;
  trialDaysRemaining?: number;
  feature?: string;
  variant?: "banner" | "card" | "inline";
  className?: string;
}

export function UpgradePrompt({
  currentPlan,
  trialDaysRemaining,
  feature,
  variant = "card",
  className = "",
}: UpgradePromptProps) {
  const isTrial = currentPlan === "trial";
  const isFree = currentPlan === "free";

  if (!isTrial && !isFree) {
    return null; // Already paid
  }

  const content = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="h-4 w-4 text-primary" />
          <h4 className="font-semibold">
            {isTrial && trialDaysRemaining
              ? `Trial ends in ${trialDaysRemaining} days`
              : "Unlock Full Features"}
          </h4>
        </div>
        <p className="text-sm text-muted-foreground">
          {feature
            ? `Upgrade to unlock ${feature} and more`
            : "Get unlimited workflows, personalized insights, and priority support"}
        </p>
        {isTrial && trialDaysRemaining && trialDaysRemaining <= 7 && (
          <p className="text-xs text-primary font-medium mt-1">
            <Clock className="h-3 w-3 inline mr-1" />
            Don't lose your personalized setup
          </p>
        )}
      </div>
      <Button size="sm" asChild>
        <Link href="/pricing">
          Upgrade Now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );

  if (variant === "banner") {
    return (
      <div className={`bg-primary/10 border-2 border-primary/30 rounded-lg p-4 ${className}`}>
        {content}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Lock className="h-4 w-4 text-primary" />
        <span className="text-muted-foreground">
          {feature ? `Upgrade to unlock ${feature}` : "Upgrade to unlock this feature"}
        </span>
        <Button variant="link" size="sm" className="h-auto p-0" asChild>
          <Link href="/pricing">
            Upgrade
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    );
  }

  // Default: card variant
  return (
    <Card className={`border-2 border-primary/30 bg-primary/5 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Upgrade to Unlock More</CardTitle>
        </div>
        <CardDescription>
          {isTrial && trialDaysRemaining
            ? `Your trial ends in ${trialDaysRemaining} days. Upgrade to keep everything.`
            : "Get unlimited access to all features"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">Unlimited Everything</div>
              <div className="text-muted-foreground text-xs">
                Workflows, automations, email analysis
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">Personalized Insights</div>
              <div className="text-muted-foreground text-xs">
                News feed, campaign recommendations
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">Onboarding Session</div>
              <div className="text-muted-foreground text-xs">
                30-60 min strategy call included
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">Priority Support</div>
              <div className="text-muted-foreground text-xs">
                24-48h response time
              </div>
            </div>
          </div>
        </div>
        <Button className="w-full" size="lg" asChild>
          <Link href="/pricing">
            Upgrade Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Start your 30-day free trial • No credit card required
        </p>
      </CardContent>
    </Card>
  );
}
