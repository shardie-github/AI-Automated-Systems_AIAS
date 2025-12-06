"use client";

import { ReactNode, useEffect, useState } from "react";
import { FeatureLockBadge } from "./feature-lock-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "lucide-react";

interface FeatureGateProps {
  feature: string;
  requiredPlan: "starter" | "pro";
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, requiredPlan, children, fallback }: FeatureGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    try {
      const response = await fetch(`/api/entitlements/check?feature=${feature}`);
      if (response.ok) {
        const data = await response.json();
        setHasAccess(data.allowed);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error("Failed to check feature access", error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="opacity-50">{children}</div>;
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6 space-y-4">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold mb-2">This feature requires {requiredPlan === "starter" ? "Starter" : "Pro"}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upgrade to unlock this feature and more.
              </p>
              <Button asChild>
                <Link href="/pricing">Upgrade Plan</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
