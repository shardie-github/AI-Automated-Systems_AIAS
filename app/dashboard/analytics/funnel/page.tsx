"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Users, CheckCircle, XCircle } from "lucide-react";

interface FunnelData {
  period: string;
  stages: {
    signup: number;
    onboarding_start: number;
    integration_connect: number;
    workflow_create: number;
    workflow_execute: number;
    activated: number;
  };
  conversionRates: {
    signupToOnboarding: number;
    onboardingToIntegration: number;
    integrationToWorkflow: number;
    workflowToExecute: number;
    overallActivation: number;
  };
  dropOffPoints: {
    signupToOnboarding: number;
    onboardingToIntegration: number;
    integrationToWorkflow: number;
    workflowToExecute: number;
  };
}

export default function FunnelPage() {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunnelData();
  }, []);

  async function fetchFunnelData() {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics/funnel");
      if (response.ok) {
        const data = await response.json();
        setFunnelData(data);
      }
    } catch (error) {
      console.error("Failed to fetch funnel data", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-16">
        <div className="text-center">Loading funnel data...</div>
      </div>
    );
  }

  if (!funnelData) {
    return (
      <div className="container py-16">
        <div className="text-center">No funnel data available</div>
      </div>
    );
  }

  // Prepare data for charts
  const funnelChartData = [
    { stage: "Signup", count: funnelData.stages.signup, conversion: 100 },
    { stage: "Onboarding Start", count: funnelData.stages.onboarding_start, conversion: funnelData.conversionRates.signupToOnboarding },
    { stage: "Integration Connect", count: funnelData.stages.integration_connect, conversion: funnelData.conversionRates.onboardingToIntegration },
    { stage: "Workflow Create", count: funnelData.stages.workflow_create, conversion: funnelData.conversionRates.integrationToWorkflow },
    { stage: "Workflow Execute", count: funnelData.stages.workflow_execute, conversion: funnelData.conversionRates.workflowToExecute },
    { stage: "Activated", count: funnelData.stages.activated, conversion: funnelData.conversionRates.overallActivation },
  ];

  return (
    <div className="container py-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Activation Funnel</h1>
        <p className="text-muted-foreground">
          Track user progression from signup to activation
        </p>
      </div>

      {/* Overall Activation Rate */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Activation Rate</CardTitle>
          <CardDescription>Percentage of users who complete all activation steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-2">
            {funnelData.conversionRates.overallActivation.toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground">
            {funnelData.stages.activated} of {funnelData.stages.signup} users activated
          </p>
        </CardContent>
      </Card>

      {/* Funnel Visualization */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Funnel Stages</CardTitle>
          <CardDescription>User progression through activation stages</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={funnelChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion Rates */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Conversion Rates</CardTitle>
          <CardDescription>Conversion rate between each stage</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={funnelChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Line type="monotone" dataKey="conversion" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stage Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Signup → Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {funnelData.conversionRates.signupToOnboarding.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              {funnelData.dropOffPoints.signupToOnboarding} users dropped off
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Onboarding → Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {funnelData.conversionRates.onboardingToIntegration.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              {funnelData.dropOffPoints.onboardingToIntegration} users dropped off
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Integration → Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {funnelData.conversionRates.integrationToWorkflow.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              {funnelData.dropOffPoints.integrationToWorkflow} users dropped off
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workflow → Execute</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {funnelData.conversionRates.workflowToExecute.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              {funnelData.dropOffPoints.workflowToExecute} users dropped off
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
