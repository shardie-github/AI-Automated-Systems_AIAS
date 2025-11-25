"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BusinessMetrics {
  northStar: {
    value: number;
    growth: number;
    period: string;
  };
  growth: {
    signups: { value: number; growth: number; period: string };
    activations: { value: number; growth: number; period: string };
    paying: { value: number; growth: number; period: string };
    mrr: { value: number; growth: number; period: string };
  };
  funnel: {
    visitors: number;
    signups: number;
    activated: number;
    paying: number;
  };
  retention: {
    day7: number;
    day30: number;
    churnRate: number;
    ltv: number;
  };
  engagement: {
    dau: number;
    wau: number;
    mau: number;
    workflowsPerUser: number;
  };
  unitEconomics: {
    arpu: number;
    cac: number;
    ltvCac: number;
    grossMargin: number;
  };
  channels: Record<string, number>;
  pmf: {
    nps: number;
    timeToActivation: number;
    activationRate: number;
    powerUsers: number;
  };
}

export default function BusinessMetricsPage() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function fetchMetrics() {
    try {
      const response = await fetch("/api/admin/metrics/business", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || "admin"}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch metrics";
      setError(errorMessage);
      console.error("Failed to fetch business metrics:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading business metrics...</div>
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Metrics Dashboard</h1>
          <p className="text-muted-foreground mt-2">YC Readiness Metrics</p>
        </div>
      </div>

      {/* North Star Metric */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>North Star: Monthly Active Users (MAU)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-2">{metrics.northStar.value.toLocaleString()}</div>
          <div className={`text-lg ${metrics.northStar.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
            {metrics.northStar.growth >= 0 ? "↑" : "↓"} {Math.abs(metrics.northStar.growth).toFixed(1)}% {metrics.northStar.period}
          </div>
        </CardContent>
      </Card>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.growth.signups.value}</div>
            <div className="text-sm text-muted-foreground">
              {metrics.growth.signups.growth >= 0 ? "↑" : "↓"} {Math.abs(metrics.growth.signups.growth).toFixed(1)}% {metrics.growth.signups.period}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.growth.activations.value}</div>
            <div className="text-sm text-muted-foreground">
              {metrics.growth.activations.growth >= 0 ? "↑" : "↓"} {Math.abs(metrics.growth.activations.growth).toFixed(1)}% {metrics.growth.activations.period}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paying</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.growth.paying.value}</div>
            <div className="text-sm text-muted-foreground">
              {metrics.growth.paying.growth >= 0 ? "↑" : "↓"} {Math.abs(metrics.growth.paying.growth).toFixed(1)}% {metrics.growth.paying.period}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.growth.mrr.value.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              {metrics.growth.mrr.growth >= 0 ? "↑" : "↓"} {Math.abs(metrics.growth.mrr.growth).toFixed(1)}% {metrics.growth.mrr.period}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Activation Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Visitors</span>
              <span className="font-bold">{metrics.funnel.visitors.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Signups ({metrics.funnel.visitors > 0 ? ((metrics.funnel.signups / metrics.funnel.visitors) * 100).toFixed(1) : 0}%)</span>
              <span className="font-bold">{metrics.funnel.signups.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Activated ({metrics.funnel.signups > 0 ? ((metrics.funnel.activated / metrics.funnel.signups) * 100).toFixed(1) : 0}%)</span>
              <span className="font-bold">{metrics.funnel.activated.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Paying ({metrics.funnel.activated > 0 ? ((metrics.funnel.paying / metrics.funnel.activated) * 100).toFixed(1) : 0}%)</span>
              <span className="font-bold">{metrics.funnel.paying.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retention & Unit Economics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Day 7:</span>
              <span className="font-bold">{metrics.retention.day7.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Day 30:</span>
              <span className="font-bold">{metrics.retention.day30.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Churn Rate:</span>
              <span className="font-bold">{metrics.retention.churnRate.toFixed(1)}%/month</span>
            </div>
            <div className="flex justify-between">
              <span>LTV:</span>
              <span className="font-bold">${metrics.retention.ltv.toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unit Economics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>ARPU:</span>
              <span className="font-bold">${metrics.unitEconomics.arpu.toFixed(2)}/month</span>
            </div>
            <div className="flex justify-between">
              <span>CAC:</span>
              <span className="font-bold">${metrics.unitEconomics.cac.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>LTV:CAC:</span>
              <span className="font-bold">{metrics.unitEconomics.ltvCac.toFixed(1)}:1</span>
            </div>
            <div className="flex justify-between">
              <span>Gross Margin:</span>
              <span className="font-bold">{metrics.unitEconomics.grossMargin.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channels */}
      {Object.keys(metrics.channels).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Acquisition Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metrics.channels).map(([channel, count]) => (
                <div key={channel} className="flex justify-between">
                  <span className="capitalize">{channel}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PMF Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Product-Market Fit Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">NPS</div>
              <div className="text-2xl font-bold">{metrics.pmf.nps.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Time to Activation</div>
              <div className="text-2xl font-bold">{metrics.pmf.timeToActivation.toFixed(1)}h</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Activation Rate</div>
              <div className="text-2xl font-bold">{metrics.pmf.activationRate.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Power Users</div>
              <div className="text-2xl font-bold">{metrics.pmf.powerUsers.toFixed(1)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
