"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, X, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface TrialCountdownBannerProps {
  daysRemaining: number;
  trialEndDate: string;
}

export function TrialCountdownBanner({ daysRemaining, trialEndDate }: TrialCountdownBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const shouldShow = daysRemaining <= 3 && daysRemaining > 0 && !dismissed;

  useEffect(() => {
    // Check if dismissed today
    const dismissedKey = `trial-banner-dismissed-${new Date().toISOString().split("T")[0]}`;
    const isDismissed = localStorage.getItem(dismissedKey) === "true";
    setDismissed(isDismissed);
  }, []);

  if (!shouldShow) {
    return null;
  }

  const handleDismiss = () => {
    const dismissedKey = `trial-banner-dismissed-${new Date().toISOString().split("T")[0]}`;
    localStorage.setItem(dismissedKey, "true");
    setDismissed(true);
  };

  const isUrgent = daysRemaining === 1;
  const endDate = new Date(trialEndDate).toLocaleDateString();

  return (
    <Card className={`mb-4 ${isUrgent ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "border-amber-500 bg-amber-50 dark:bg-amber-950/20"}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isUrgent ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <Clock className="h-5 w-5 text-amber-600" />
              )}
              <h3 className="font-semibold">
                {isUrgent
                  ? "Your trial ends tomorrow!"
                  : `Your trial ends in ${daysRemaining} day${daysRemaining > 1 ? "s" : ""}`}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {isUrgent
                ? `Your free trial ends on ${endDate}. Upgrade now to keep your automations running without interruption.`
                : `Your free trial ends on ${endDate}. Upgrade to keep your automations running and unlock more features.`}
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/pricing">Upgrade Now</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDismiss}>
                Dismiss
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
