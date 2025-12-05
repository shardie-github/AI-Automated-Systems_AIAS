"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Sparkles, Zap, Mail, ArrowRight, Check, Clock, TrendingUp, Lock } from "lucide-react";
import { PreTestQuestionnaire } from "@/components/onboarding/pre-test-questionnaire";
import type { PreTestAnswers } from "@/components/onboarding/pre-test-questionnaire";

interface WelcomeDashboardProps {
  userPlan?: "free" | "trial" | "starter" | "pro";
  trialDaysRemaining?: number;
  hasCompletedPretest?: boolean;
  hasConnectedEmail?: boolean;
  hasCreatedWorkflow?: boolean;
}

export function WelcomeDashboard({
  userPlan = "trial",
  trialDaysRemaining = 30,
  hasCompletedPretest = false,
  hasConnectedEmail = false,
  hasCreatedWorkflow = false,
}: WelcomeDashboardProps) {
  const [showPretest, setShowPretest] = useState(!hasCompletedPretest);
  const [pretestCompleted, setPretestCompleted] = useState(hasCompletedPretest);

  useEffect(() => {
    // Check if pretest was completed
    const completed = localStorage.getItem("pretest_completed") === "true";
    setPretestCompleted(completed);
    setShowPretest(!completed);
  }, []);

  const handlePretestComplete = async (answers: PreTestAnswers) => {
    setPretestCompleted(true);
    setShowPretest(false);
    // Already saved via API in pre-test component
  };

  const handlePretestSkip = () => {
    setShowPretest(false);
    // Show persistent banner instead
  };

  const isTrial = userPlan === "trial";
  const isPaid = userPlan === "starter" || userPlan === "pro";

  if (showPretest) {
    return (
      <div className="container py-8">
        <PreTestQuestionnaire
          onComplete={handlePretestComplete}
          onSkip={handlePretestSkip}
          canDismiss={false}
        />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
          <Sparkles className="h-4 w-4" />
          Welcome to AIAS Platform!
        </div>
        <h1 className="text-4xl font-bold">Let's get you set up in 10 minutes</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Save 10+ hours per week with AI automation. Connect your tools, automate workflows, and focus on what matters.
        </p>
        {isTrial && (
          <Badge variant="outline" className="text-base px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            {trialDaysRemaining} days left in your free trial
          </Badge>
        )}
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pre-Test Card */}
        <Card className={pretestCompleted ? "border-green-500/50" : "border-primary/30"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Personalize Your Feed</CardTitle>
              {pretestCompleted ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Badge variant="outline">3 min</Badge>
              )}
            </div>
            <CardDescription>
              Complete pre-test to get personalized news and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pretestCompleted ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ Personalized feed active</p>
                {!isPaid && (
                  <p className="text-xs text-muted-foreground">
                    Upgrade to unlock advanced personalization
                  </p>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowPretest(true)}
              >
                Take Pre-Test
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Email Connection Card */}
        <Card className={hasConnectedEmail ? "border-green-500/50" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Connect Your Email</CardTitle>
              {hasConnectedEmail ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Badge variant="outline">2 min</Badge>
              )}
            </div>
            <CardDescription>
              Analyze your email campaigns and get insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasConnectedEmail ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ Email connected</p>
                {!isPaid && (
                  <p className="text-xs text-muted-foreground">
                    Free: 1 campaign/month. Upgrade for unlimited analysis
                  </p>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  // Mark as connected in database
                  try {
                    await fetch("/api/trial/mark-email-connected", {
                      method: "POST",
                    });
                    setHasConnectedEmail(true);
                  } catch (error) {
                    console.error("Failed to mark email connected:", error);
                  }
                  window.location.href = "/integrations";
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Connect Email
              </Button>
            )}
          </CardContent>
        </Card>

        {/* First Workflow Card */}
        <Card className={hasCreatedWorkflow ? "border-green-500/50" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Create First Workflow</CardTitle>
              {hasCreatedWorkflow ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Badge variant="outline">5 min</Badge>
              )}
            </div>
            <CardDescription>
              Automate your first task with a template
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasCreatedWorkflow ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">✓ Workflow created</p>
                {!isPaid && (
                  <p className="text-xs text-muted-foreground">
                    Free: 3 workflows max. Upgrade for unlimited
                  </p>
                )}
              </div>
            ) : (
              <Button variant="outline" className="w-full" asChild>
                <Link href="/onboarding">
                  <Zap className="mr-2 h-4 w-4" />
                  Get Started
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Free vs. Paid Comparison */}
      {isTrial && (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              What You Get vs. What You Unlock
            </CardTitle>
            <CardDescription>
              Your free trial includes basic features. Upgrade to unlock the full power.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Free Trial Includes
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Basic AI news feed (15 articles/day)</li>
                  <li>• 1 email campaign analysis/month</li>
                  <li>• 3 workflows, 100 automations/month</li>
                  <li>• 5 basic templates</li>
                  <li>• Community support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Unlock with Paid Plan
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Personalized news feed</li>
                  <li>• Unlimited email analysis</li>
                  <li>• Unlimited workflows & automations</li>
                  <li>• 100+ templates</li>
                  <li>• 30-min onboarding session</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button asChild className="flex-1">
                <Link href="/pricing">
                  Upgrade Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Continue with Trial</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* News Feed Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Your AI News Feed</CardTitle>
          <CardDescription>
            {pretestCompleted
              ? "Personalized news based on your goals and industry"
              : "Complete pre-test to get personalized news"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pretestCompleted ? (
            <div className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Top Story for You</h4>
                <p className="text-sm text-muted-foreground">
                  Based on your industry and goals, here's what's relevant today...
                </p>
              </div>
              {!isPaid && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Upgrade to unlock full personalized feed with 50+ articles/day
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Complete the pre-test to see personalized news
              </p>
              <Button variant="outline" onClick={() => setShowPretest(true)}>
                Take Pre-Test Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
