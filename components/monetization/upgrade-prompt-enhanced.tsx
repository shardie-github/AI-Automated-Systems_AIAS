"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, Users, ArrowRight, Check } from "lucide-react";
import type { PlanTier } from "@/config/plans";

interface UpgradePromptEnhancedProps {
  currentPlan: PlanTier;
  trialDaysRemaining?: number;
  workflowCount?: number;
  integrationCount?: number;
  variant?: "banner" | "card";
}

export function UpgradePromptEnhanced({
  currentPlan,
  trialDaysRemaining,
  workflowCount = 0,
  integrationCount = 0,
  variant = "card",
}: UpgradePromptEnhancedProps) {
  if (currentPlan === "starter" || currentPlan === "pro" || currentPlan === "enterprise") {
    return null; // Don't show upgrade prompt for paid users
  }

  const isTrial = currentPlan === "trial";
  const daysText = trialDaysRemaining !== undefined 
    ? `${trialDaysRemaining} ${trialDaysRemaining === 1 ? "day" : "days"}`
    : "soon";

  if (variant === "banner") {
    return (
      <Card className="mb-8 border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Unlock the Full Power of Automation
          </CardTitle>
          <CardDescription>
            {workflowCount > 0 
              ? `You've created ${workflowCount} ${workflowCount === 1 ? "workflow" : "workflows"}. Upgrade to unlock unlimited workflows and save 10+ hours per week.`
              : "Upgrade to unlock unlimited workflows and save 10+ hours per week."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="font-semibold mb-2">What you'll unlock:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Unlimited workflows & automations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Personalized news feed (50+ articles/day)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Advanced analytics & insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>30-minute onboarding session (free)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
            <div>
              {isTrial && trialDaysRemaining !== undefined && (
                <>
                  <h4 className="font-semibold mb-2">Your trial ends in {daysText}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upgrade now to keep all your workflows, integrations, and personalized system. 
                    No credit card required to start.
                  </p>
                </>
              )}
              <div className="flex items-center gap-2 text-sm mb-4">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Join 2,000+ paid users saving 10+ hours/week</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg">
              <Link href="/pricing">
                Upgrade Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/case-studies">See Success Stories</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card variant (smaller, for sidebars or smaller spaces)
  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="text-lg">Upgrade to Unlock More</CardTitle>
        <CardDescription>
          {isTrial && trialDaysRemaining !== undefined 
            ? `Your trial ends in ${daysText}. Upgrade to keep everything.`
            : "Unlock unlimited workflows and advanced features."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm mb-4">
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Unlimited workflows</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Advanced analytics</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>Priority support</span>
          </li>
        </ul>
        <Button asChild className="w-full">
          <Link href="/pricing">Upgrade Now</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
