"use client";

import { UpgradePrompt } from "@/components/monetization/upgrade-prompt";
import { WelcomeDashboard } from "@/components/dashboard/welcome-dashboard";
import { useEffect, useState } from "react";

interface DashboardUpgradeSectionProps {
  userPlan?: "free" | "trial" | "starter" | "pro";
  isFirstVisit?: boolean;
}

export function DashboardUpgradeSection({
  userPlan = "trial",
  isFirstVisit = false,
}: DashboardUpgradeSectionProps) {
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | undefined>();
  const [hasCompletedPretest, setHasCompletedPretest] = useState(false);
  const [hasConnectedEmail, setHasConnectedEmail] = useState(false);
  const [hasCreatedWorkflow, setHasCreatedWorkflow] = useState(false);

  useEffect(() => {
    // Check localStorage for pretest completion
    const pretestCompleted = localStorage.getItem("pretest_completed") === "true";
    setHasCompletedPretest(pretestCompleted);

    // Calculate trial days remaining (if trial)
    if (userPlan === "trial") {
      // In production, get from database
      // For now, calculate from signup date if available
      const signupDate = localStorage.getItem("signup_date");
      if (signupDate) {
        const daysSinceSignup = Math.floor(
          (Date.now() - new Date(signupDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        setTrialDaysRemaining(Math.max(0, 30 - daysSinceSignup));
      } else {
        setTrialDaysRemaining(30); // Default
      }
    }

    // Check for email connection and workflows (would come from API in production)
    // For now, check localStorage
    const emailConnected = localStorage.getItem("email_connected") === "true";
    const workflowCreated = localStorage.getItem("workflow_created") === "true";
    setHasConnectedEmail(emailConnected);
    setHasCreatedWorkflow(workflowCreated);
  }, [userPlan]);

  // Show welcome dashboard on first visit
  if (isFirstVisit && (userPlan === "trial" || userPlan === "free")) {
    return (
      <WelcomeDashboard
        userPlan={userPlan}
        trialDaysRemaining={trialDaysRemaining}
        hasCompletedPretest={hasCompletedPretest}
        hasConnectedEmail={hasConnectedEmail}
        hasCreatedWorkflow={hasCreatedWorkflow}
      />
    );
  }

  // Show upgrade prompt for trial/free users
  if (userPlan === "trial" || userPlan === "free") {
    return (
      <div className="mb-8">
        <UpgradePrompt
          currentPlan={userPlan}
          trialDaysRemaining={trialDaysRemaining}
          variant="banner"
        />
      </div>
    );
  }

  return null;
}
