"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ActivationChart } from "@/components/metrics/ActivationChart";
import { FunnelChart } from "@/components/metrics/FunnelChart";

interface ActivationMetrics {
  metrics: {
    activation_rate: number;
    time_to_activation_ms: number;
    time_to_activation_hours: number;
    day_7_retention: number;
    total_signups: number;
    total_integrations: number;
    total_workflows: number;
    total_activations: number;
    unique_active_users: number;
  };
  funnel: {
    signups: number;
    integrations: number;
    workflows: number;
    activations: number;
  };
  period: {
    days: number;
    start_date: string;
    end_date: string;
  };
}

export default function ActivationMetricsDashboard() {
  const [metrics, setMetrics] = useState<ActivationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchMetrics() {
    try {
      const response = await fetch("/api/admin/metrics?days=30");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch metrics";
      setError(errorMessage);
      console.error("Failed to fetch activation metrics:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading activation metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle>Error Loading Metrics</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">No metrics available</div>
      </div>
    );
  }

  const { metrics: m, funnel } = metrics;

  // Calculate funnel conversion rates
  const signupToIntegration = funnel.signups > 0 ? (funnel.integrations / funnel.signups) * 100 : 0;
  const integrationToWorkflow = funnel.integrations > 0 ? (funnel.workflows / funnel.integrations) * 100 : 0;
  const workflowToActivation = funnel.workflows > 0 ? (funnel.activations / funnel.workflows) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Activation Metrics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track user activation funnel and key metrics
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            Last {metrics.period.days} days
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(metrics.period.start_date).toLocaleDateString()} - {new Date(metrics.period.end_date).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activation Rate</CardTitle>
            <CardDescription>Users who activated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${m.activation_rate >= 60 ? "text-green-600" : m.activation_rate >= 40 ? "text-yellow-600" : "text-red-600"}`}>
              {m.activation_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Target: &gt;60%
            </div>
            <Progress value={m.activation_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Time to Activation</CardTitle>
            <CardDescription>Median time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${m.time_to_activation_hours <= 24 ? "text-green-600" : m.time_to_activation_hours <= 48 ? "text-yellow-600" : "text-red-600"}`}>
              {m.time_to_activation_hours.toFixed(1)}h
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Target: &lt;24 hours
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Day 7 Retention</CardTitle>
            <CardDescription>Users returning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${m.day_7_retention >= 40 ? "text-green-600" : m.day_7_retention >= 25 ? "text-yellow-600" : "text-red-600"}`}>
              {m.day_7_retention.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Target: &gt;40%
            </div>
            <Progress value={m.day_7_retention} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Signups</CardTitle>
            <CardDescription>New users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {m.total_signups}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {m.total_activations} activated
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activation Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Activation Funnel</CardTitle>
          <CardDescription>User journey from signup to activation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Signups */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">Signups</div>
                <div className="text-sm text-muted-foreground">{funnel.signups} users</div>
              </div>
              <Progress value={100} className="h-3" />
            </div>

            {/* Integrations */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">Integration Connected</div>
                <div className="text-sm text-muted-foreground">
                  {funnel.integrations} users ({signupToIntegration.toFixed(1)}%)
                </div>
              </div>
              <Progress value={signupToIntegration} className="h-3" />
            </div>

            {/* Workflows */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">Workflow Created</div>
                <div className="text-sm text-muted-foreground">
                  {funnel.workflows} users ({integrationToWorkflow.toFixed(1)}%)
                </div>
              </div>
              <Progress value={integrationToWorkflow} className="h-3" />
            </div>

            {/* Activations */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">Activated</div>
                <div className="text-sm text-muted-foreground">
                  {funnel.activations} users ({workflowToActivation.toFixed(1)}%)
                </div>
              </div>
              <Progress value={workflowToActivation} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <ActivationChart
          data={[
            // Placeholder data - in production, this would come from time-series queries
            { date: "Week 1", activationRate: m.activation_rate, timeToActivation: m.time_to_activation_hours, day7Retention: m.day_7_retention },
            { date: "Week 2", activationRate: m.activation_rate * 1.1, timeToActivation: m.time_to_activation_hours * 0.9, day7Retention: m.day_7_retention * 1.05 },
            { date: "Week 3", activationRate: m.activation_rate * 1.2, timeToActivation: m.time_to_activation_hours * 0.8, day7Retention: m.day_7_retention * 1.1 },
            { date: "Week 4", activationRate: m.activation_rate, timeToActivation: m.time_to_activation_hours, day7Retention: m.day_7_retention },
          ]}
        />
        <FunnelChart data={funnel} />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Funnel Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Signups</span>
                <span className="font-mono">{funnel.signups}</span>
              </div>
              <div className="flex justify-between">
                <span>Integrations</span>
                <span className="font-mono">{funnel.integrations}</span>
              </div>
              <div className="flex justify-between">
                <span>Workflows</span>
                <span className="font-mono">{funnel.workflows}</span>
              </div>
              <div className="flex justify-between">
                <span>Activations</span>
                <span className="font-mono">{funnel.activations}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Unique Active Users</span>
                <span className="font-mono">{m.unique_active_users}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Integrations</span>
                <span className="font-mono">{m.total_integrations}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Workflows</span>
                <span className="font-mono">{m.total_workflows}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Activations</span>
                <span className="font-mono">{m.total_activations}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
