"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Target } from "lucide-react";
import Link from "next/link";
import { track } from "@/lib/telemetry/track";
import { ShareInvite } from "@/components/plg/share-invite";
import { useState } from "react";

export default function CompletePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>();
  const [referralCode, setReferralCode] = useState<string | undefined>();

  useEffect(() => {
    // Track onboarding completion
    const storedUserId = localStorage.getItem("user_id") || "anonymous";
    setUserId(storedUserId);
    
    // TODO: Fetch referral code from API
    // For now, generate a simple referral code
    setReferralCode(storedUserId !== "anonymous" ? `REF-${storedUserId.slice(0, 8)}` : undefined);

    track(storedUserId, {
      type: "onboarding_completed",
      path: "/onboarding/complete",
      meta: {
        timestamp: new Date().toISOString(),
      },
      app: "web",
    });
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-4xl font-bold">Congratulations!</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          You've successfully completed onboarding and created your first workflow. You're now ready to automate and save time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Integration connected</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Workflow created</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Workflow tested</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Create more workflows</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Explore templates</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Connect more integrations</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/help" className="block text-sm text-primary hover:underline">
                Help Center
              </Link>
              <Link href="/case-studies" className="block text-sm text-primary hover:underline">
                Case Studies
              </Link>
              <Link href="/blog" className="block text-sm text-primary hover:underline">
                Blog & Tutorials
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
        <Button size="lg" asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/templates">Browse More Templates</Link>
        </Button>
      </div>

      {/* Viral Invite Flow */}
      <div className="max-w-2xl mx-auto mt-8">
        <ShareInvite userId={userId} referralCode={referralCode} />
      </div>
    </div>
  );
}
