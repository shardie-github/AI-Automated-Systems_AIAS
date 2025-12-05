"use client";

import { UpgradePrompt } from "@/components/monetization/upgrade-prompt";
import { WelcomeDashboard } from "@/components/dashboard/welcome-dashboard";
import { useEffect, useState } from "react";
import type { PlanTier } from "@/config/plans";

interface UserPlanData {
  plan: PlanTier;
  trialDaysRemaining: number | null;
  isFirstVisit: boolean;
  hasCompletedPretest: boolean;
  hasConnectedEmail: boolean;
  hasCreatedWorkflow: boolean;
}

interface DashboardUpgradeSectionProps {
  userPlan?: PlanTier;
  isFirstVisit?: boolean;
}

export function DashboardUpgradeSection({
  userPlan: initialPlan,
  isFirstVisit: initialFirstVisit,
}: DashboardUpgradeSectionProps) {
  const [userData, setUserData] = useState<UserPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/trial/user-data");
        if (response.ok) {
          const data = await response.json();
          setUserData({
            plan: data.plan || "free",
            trialDaysRemaining: data.trialDaysRemaining,
            isFirstVisit: data.isFirstVisit || false,
            hasCompletedPretest: data.hasCompletedPretest || false,
            hasConnectedEmail: data.hasConnectedEmail || false,
            hasCreatedWorkflow: data.hasCreatedWorkflow || false,
          });
        } else {
          // Fallback to localStorage if API fails
          const pretestCompleted = localStorage.getItem("pretest_completed") === "true";
          setUserData({
            plan: initialPlan || "free",
            trialDaysRemaining: null,
            isFirstVisit: initialFirstVisit || false,
            hasCompletedPretest: pretestCompleted,
            hasConnectedEmail: false,
            hasCreatedWorkflow: false,
          });
        }
      } catch (error) {
        // Fallback to localStorage
        const pretestCompleted = localStorage.getItem("pretest_completed") === "true";
        setUserData({
          plan: initialPlan || "free",
          trialDaysRemaining: null,
          isFirstVisit: initialFirstVisit || false,
          hasCompletedPretest: pretestCompleted,
          hasConnectedEmail: false,
          hasCreatedWorkflow: false,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [initialPlan, initialFirstVisit]);

  if (loading || !userData) {
    return null; // Or loading spinner
  }

  // Show welcome dashboard on first visit
  if (userData.isFirstVisit && (userData.plan === "trial" || userData.plan === "free")) {
    return (
      <WelcomeDashboard
        userPlan={userData.plan}
        trialDaysRemaining={userData.trialDaysRemaining || undefined}
        hasCompletedPretest={userData.hasCompletedPretest}
        hasConnectedEmail={userData.hasConnectedEmail}
        hasCreatedWorkflow={userData.hasCreatedWorkflow}
      />
    );
  }

  // Show upgrade prompt for trial/free users
  if (userData.plan === "trial" || userData.plan === "free") {
    return (
      <div className="mb-8">
        <UpgradePrompt
          currentPlan={userData.plan}
          trialDaysRemaining={userData.trialDaysRemaining || undefined}
          variant="banner"
        />
      </div>
    );
  }

  return null;
}
