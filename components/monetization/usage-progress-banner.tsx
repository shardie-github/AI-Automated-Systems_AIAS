"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, X, TrendingUp } from "lucide-react";
import Link from "next/link";

interface UsageProgressBannerProps {
  used: number;
  limit: number;
  plan: string;
}

export function UsageProgressBanner({ used, limit, plan }: UsageProgressBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const percentage = (used / limit) * 100;
  const shouldShow = percentage >= 80 && !dismissed;

  useEffect(() => {
    // Check if dismissed in localStorage
    const dismissedKey = `usage-banner-dismissed-${plan}-${new Date().toISOString().slice(0, 7)}`;
    const isDismissed = localStorage.getItem(dismissedKey) === "true";
    setDismissed(isDismissed);
  }, [plan]);

  if (!shouldShow) {
    return null;
  }

  const handleDismiss = () => {
    const dismissedKey = `usage-banner-dismissed-${plan}-${new Date().toISOString().slice(0, 7)}`;
    localStorage.setItem(dismissedKey, "true");
    setDismissed(true);
  };

  const remaining = limit - used;
  const isCritical = percentage >= 95;

  return (
    <Card className={`mb-4 ${isCritical ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "border-amber-500 bg-amber-50 dark:bg-amber-950/20"}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={`h-5 w-5 ${isCritical ? "text-red-600" : "text-amber-600"}`} />
              <h3 className="font-semibold">
                {isCritical ? "You're almost out of automations!" : "You're using AIAS a lot!"}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {isCritical
                ? `You've used ${used.toLocaleString()} of ${limit.toLocaleString()} automations this month. Upgrade to keep your workflows running.`
                : `You've used ${used.toLocaleString()} of ${limit.toLocaleString()} automations this month (${remaining.toLocaleString()} remaining). Upgrade for more capacity.`}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{used.toLocaleString()} used</span>
                <span>{limit.toLocaleString()} limit</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
            <div className="mt-3 flex gap-2">
              <Button asChild size="sm">
                <Link href="/pricing">Upgrade Plan</Link>
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
