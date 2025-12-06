"use client";

import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FeatureLockBadgeProps {
  requiredPlan: "starter" | "pro";
  featureName?: string;
  showTooltip?: boolean;
}

export function FeatureLockBadge({
  requiredPlan,
  featureName,
  showTooltip = true,
}: FeatureLockBadgeProps) {
  const planName = requiredPlan === "starter" ? "Starter" : "Pro";
  const planPrice = requiredPlan === "starter" ? "$49" : "$149";

  const badge = (
    <Badge variant="outline" className="gap-1">
      <Lock className="h-3 w-3" />
      <span>Available on {planName}</span>
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">
              {featureName ? `${featureName} requires ${planName}` : `This feature requires ${planName}`}
            </p>
            <p className="text-sm text-muted-foreground">
              Upgrade to {planName} ({planPrice}/month) to unlock this feature and more.
            </p>
            <Link
              href="/pricing"
              className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              View Plans
            </Link>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
