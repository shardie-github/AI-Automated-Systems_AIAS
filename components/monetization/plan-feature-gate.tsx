"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import type { PlanTier } from "@/config/plans";

interface PlanFeatureGateProps {
  children: ReactNode;
  requiredPlan: "starter" | "pro";
  currentPlan: PlanTier;
  featureName: string;
  featureDescription: string;
  upgradeCTA?: string;
  showPreview?: boolean;
}

export function PlanFeatureGate({
  children,
  requiredPlan,
  currentPlan,
  featureName,
  featureDescription,
  upgradeCTA = "Upgrade to Unlock",
  showPreview = true,
}: PlanFeatureGateProps) {
  const isPaid = currentPlan === "starter" || currentPlan === "pro";
  const hasAccess = isPaid || (requiredPlan === "starter" && currentPlan === "starter");

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showPreview) {
    return (
      <div className="relative">
        {/* Blurred preview */}
        <div className="blur-sm pointer-events-none select-none opacity-50">
          {children}
        </div>
        
        {/* Overlay with upgrade prompt */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg border-2 border-primary/30">
          <Card className="max-w-md mx-4 border-2 border-primary shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">{featureName}</CardTitle>
              <CardDescription className="text-base mt-2">
                {featureDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Unlock with {requiredPlan === "starter" ? "Starter" : "Pro"} plan:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {requiredPlan === "starter" && (
                    <>
                      <li>• Unlimited workflows & automations</li>
                      <li>• Personalized news feed</li>
                      <li>• Advanced email analysis</li>
                      <li>• 30-min onboarding session</li>
                    </>
                  )}
                  {requiredPlan === "pro" && (
                    <>
                      <li>• Everything in Starter</li>
                      <li>• 50 AI agents</li>
                      <li>• Priority support</li>
                      <li>• 60-min onboarding session</li>
                    </>
                  )}
                </ul>
              </div>
              <Button size="lg" className="w-full" asChild>
                <Link href="/pricing">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {upgradeCTA}
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Start your 30-day free trial • No credit card required
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No preview - just show upgrade prompt
  return (
    <Card className="border-2 border-primary/30">
      <CardHeader className="text-center">
        <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
        <CardTitle>{featureName}</CardTitle>
        <CardDescription>{featureDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="lg" className="w-full" asChild>
          <Link href="/pricing">{upgradeCTA}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
