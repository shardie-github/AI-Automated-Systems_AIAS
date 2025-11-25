"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FunnelData {
  signups: number;
  onboardingStarted: number;
  onboardingCompleted: number;
  activations: number;
  upgrades: number;
  referrals: number;
  conversionRates: {
    signupToOnboarding: number;
    onboardingToCompletion: number;
    completionToActivation: number;
    activationToUpgrade: number;
    upgradeToReferral: number;
  };
  dropOffRates: {
    signupToOnboarding: number;
    onboardingToCompletion: number;
    completionToActivation: number;
    activationToUpgrade: number;
  };
}

export default function PLGFunnelDashboard() {
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunnel();
  }, []);

  async function fetchFunnel() {
    try {
      const response = await fetch("/api/admin/plg-funnel");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setFunnel(data);
    } catch (err) {
      console.error("Failed to fetch funnel:", err);
      // Use mock data for now
      setFunnel({
        signups: 100,
        onboardingStarted: 80,
        onboardingCompleted: 64,
        activations: 32,
        upgrades: 8,
        referrals: 4,
        conversionRates: {
          signupToOnboarding: 80,
          onboardingToCompletion: 80,
          completionToActivation: 50,
          activationToUpgrade: 25,
          upgradeToReferral: 50,
        },
        dropOffRates: {
          signupToOnboarding: 20,
          onboardingToCompletion: 20,
          completionToActivation: 50,
          activationToUpgrade: 75,
        },
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading PLG funnel...</div>
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">No funnel data available</div>
      </div>
    );
  }

  const stages = [
    { label: "Signups", value: funnel.signups, color: "bg-blue-500" },
    { label: "Onboarding Started", value: funnel.onboardingStarted, color: "bg-purple-500" },
    { label: "Onboarding Completed", value: funnel.onboardingCompleted, color: "bg-indigo-500" },
    { label: "Activations", value: funnel.activations, color: "bg-green-500" },
    { label: "Upgrades", value: funnel.upgrades, color: "bg-yellow-500" },
    { label: "Referrals", value: funnel.referrals, color: "bg-orange-500" },
  ];

  const maxValue = Math.max(...stages.map((s) => s.value));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">PLG Funnel Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visual funnel showing conversion rates and drop-off points
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funnel Visualization</CardTitle>
          <CardDescription>Signup → Activation → Upgrade → Viral</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const width = (stage.value / maxValue) * 100;
              const prevStage = index > 0 ? stages[index - 1] : null;
              const conversionRate = prevStage
                ? (stage.value / prevStage.value) * 100
                : 100;

              return (
                <div key={stage.label} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{stage.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {stage.value} {prevStage && `(${conversionRate.toFixed(1)}%)`}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-8 relative">
                    <div
                      className={`${stage.color} h-8 rounded-full flex items-center justify-end pr-2 text-white text-sm font-medium`}
                      style={{ width: `${width}%` }}
                    >
                      {stage.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Signup → Onboarding</span>
              <span className="font-medium">{funnel.conversionRates.signupToOnboarding.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Onboarding → Completion</span>
              <span className="font-medium">{funnel.conversionRates.onboardingToCompletion.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Completion → Activation</span>
              <span className="font-medium">{funnel.conversionRates.completionToActivation.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Activation → Upgrade</span>
              <span className="font-medium">{funnel.conversionRates.activationToUpgrade.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Upgrade → Referral</span>
              <span className="font-medium">{funnel.conversionRates.upgradeToReferral.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Drop-Off Rates</CardTitle>
          <CardDescription>Where users exit the funnel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Signup → Onboarding</span>
              <span className="font-medium text-red-600">{funnel.dropOffRates.signupToOnboarding.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Onboarding → Completion</span>
              <span className="font-medium text-red-600">{funnel.dropOffRates.onboardingToCompletion.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Completion → Activation</span>
              <span className="font-medium text-red-600">{funnel.dropOffRates.completionToActivation.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Activation → Upgrade</span>
              <span className="font-medium text-red-600">{funnel.dropOffRates.activationToUpgrade.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
