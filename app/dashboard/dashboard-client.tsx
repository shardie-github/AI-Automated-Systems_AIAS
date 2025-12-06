"use client";

import { useEffect, useState } from "react";
import { UsageProgressBanner } from "@/components/monetization/usage-progress-banner";
import { TrialCountdownBanner } from "@/components/monetization/trial-countdown-banner";
import { WhatsNextChecklist } from "@/components/onboarding/whats-next-checklist";

export function DashboardClient() {
  const [usage, setUsage] = useState<{ used: number; limit: number; plan: string } | null>(null);
  const [trialInfo, setTrialInfo] = useState<{ daysRemaining: number; trialEndDate: string } | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Fetch usage data
    fetch("/api/analytics/usage")
      .then((res) => res.json())
      .then((data) => {
        if (data.plan && data.used !== undefined && data.limit !== undefined) {
          setUsage({ used: data.used, limit: data.limit, plan: data.plan });
        }
      })
      .catch(console.error);

    // Fetch trial info
    fetch("/api/trial/user-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.plan === "trial" && data.trialEndDate && data.trialDaysRemaining !== null) {
          setTrialInfo({
            daysRemaining: data.trialDaysRemaining,
            trialEndDate: data.trialEndDate,
          });
        }
        setIsFirstVisit(data.isFirstVisit || false);
      })
      .catch(console.error);
  }, []);

  return (
    <>
      {/* Upgrade Nudges */}
      {usage && (
        <UsageProgressBanner
          used={usage.used}
          limit={usage.limit}
          plan={usage.plan}
        />
      )}
      {trialInfo && trialInfo.daysRemaining <= 3 && (
        <TrialCountdownBanner
          daysRemaining={trialInfo.daysRemaining}
          trialEndDate={trialInfo.trialEndDate}
        />
      )}

      {/* What's Next Checklist for new users */}
      {isFirstVisit && (
        <div className="mb-8">
          <WhatsNextChecklist />
        </div>
      )}
    </>
  );
}
