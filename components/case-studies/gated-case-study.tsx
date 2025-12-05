"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { PlanFeatureGate } from "@/components/monetization/plan-feature-gate";
import type { PlanTier } from "@/config/plans";

interface CaseStudy {
  title: string;
  company: string;
  industry: string;
  location: string;
  flag: string;
  challenge: string;
  solution: string;
  results: string[];
  quote: string;
  author: string;
  role: string;
}

interface GatedCaseStudyProps {
  study: CaseStudy;
  userPlan: PlanTier;
  showFull?: boolean;
}

export function GatedCaseStudy({ study, userPlan, showFull = false }: GatedCaseStudyProps) {
  const isPaid = userPlan === "starter" || userPlan === "pro";

  // Summary version (always visible)
  const summary = (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">{study.title}</CardTitle>
            <CardDescription className="text-base flex items-center gap-2">
              {study.company} • {study.industry} • {study.location} {study.flag}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">The Challenge</h3>
            <p className="text-muted-foreground text-sm line-clamp-2">{study.challenge}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Key Results</h3>
            <ul className="space-y-1">
              {study.results.slice(0, 2).map((result, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">✓</span>
                  <span>{result}</span>
                </li>
              ))}
            </ul>
            {study.results.length > 2 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{study.results.length - 2} more results
              </p>
            )}
          </div>
          {!isPaid && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Read full case study with detailed solution and metrics
                  </span>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/pricing">
                    Upgrade to Read
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Full version (gated)
  const fullContent = (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">{study.title}</CardTitle>
            <CardDescription className="text-base flex items-center gap-2">
              {study.company} • {study.industry} • {study.location} {study.flag}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">The Challenge</h3>
            <p className="text-muted-foreground">{study.challenge}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">The Solution</h3>
            <p className="text-muted-foreground">{study.solution}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Results Delivered</h3>
            <ul className="space-y-2">
              {study.results.map((result, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-muted-foreground">{result}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t pt-6">
            <blockquote className="text-lg italic text-muted-foreground mb-4">
              &ldquo;{study.quote}&rdquo;
            </blockquote>
            <div>
              <p className="font-semibold">{study.author}</p>
              <p className="text-sm text-muted-foreground">{study.role}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (showFull || isPaid) {
    return (
      <PlanFeatureGate
        requiredPlan="starter"
        currentPlan={userPlan}
        featureName="Full Case Study"
        featureDescription="Read complete case studies with detailed solutions, metrics, and testimonials"
        showPreview={false}
      >
        {fullContent}
      </PlanFeatureGate>
    );
  }

  return summary;
}
