"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface KPIData {
  signups: number;
  activations: number;
  mrr: number;
  retention: number;
  trends: {
    signups: { current: number; previous: number; change: number };
    activations: { current: number; previous: number; change: number };
    mrr: { current: number; previous: number; change: number };
    retention: { current: number; previous: number; change: number };
  };
  lastUpdated: string;
}

export default function KPIDashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKPIs();
    // Refresh every 60 seconds
    const interval = setInterval(fetchKPIs, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchKPIs() {
    try {
      const response = await fetch("/api/admin/metrics/kpis");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setKpis(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch KPIs";
      setError(errorMessage);
      console.error("Failed to fetch KPIs:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading KPIs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle>Error Loading KPIs</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">No KPI data available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Weekly KPI Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Key performance indicators for mentor updates
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date(kpis.lastUpdated).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Signups"
          value={kpis.signups}
          trend={kpis.trends.signups}
          format="number"
        />
        <KPICard
          label="Activations"
          value={kpis.activations}
          trend={kpis.trends.activations}
          format="number"
        />
        <KPICard
          label="MRR"
          value={kpis.mrr}
          trend={kpis.trends.mrr}
          format="currency"
        />
        <KPICard
          label="Retention (30-day)"
          value={kpis.retention}
          trend={kpis.trends.retention}
          format="percentage"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Week-over-Week Trends</CardTitle>
          <CardDescription>Comparison with previous week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TrendRow
              label="Signups"
              current={kpis.trends.signups.current}
              previous={kpis.trends.signups.previous}
              change={kpis.trends.signups.change}
            />
            <TrendRow
              label="Activations"
              current={kpis.trends.activations.current}
              previous={kpis.trends.activations.previous}
              change={kpis.trends.activations.change}
            />
            <TrendRow
              label="MRR"
              current={kpis.trends.mrr.current}
              previous={kpis.trends.mrr.previous}
              change={kpis.trends.mrr.change}
              format="currency"
            />
            <TrendRow
              label="Retention"
              current={kpis.trends.retention.current}
              previous={kpis.trends.retention.previous}
              change={kpis.trends.retention.change}
              format="percentage"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({
  label,
  value,
  trend,
  format = "number",
}: {
  label: string;
  value: number;
  trend: { current: number; previous: number; change: number };
  format?: "number" | "currency" | "percentage";
}) {
  const formattedValue =
    format === "currency"
      ? `$${value.toLocaleString()}`
      : format === "percentage"
      ? `${value.toFixed(1)}%`
      : value.toLocaleString();

  const changeColor = trend.change >= 0 ? "text-green-600" : "text-red-600";
  const changeIcon = trend.change >= 0 ? "↑" : "↓";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        <div className={`text-sm mt-2 ${changeColor}`}>
          {changeIcon} {Math.abs(trend.change).toFixed(1)}% vs. last week
        </div>
      </CardContent>
    </Card>
  );
}

function TrendRow({
  label,
  current,
  previous,
  change,
  format = "number",
}: {
  label: string;
  current: number;
  previous: number;
  change: number;
  format?: "number" | "currency" | "percentage";
}) {
  const formatValue = (val: number) =>
    format === "currency"
      ? `$${val.toLocaleString()}`
      : format === "percentage"
      ? `${val.toFixed(1)}%`
      : val.toLocaleString();

  const changeColor = change >= 0 ? "text-green-600" : "text-red-600";
  const changeIcon = change >= 0 ? "↑" : "↓";

  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0">
      <div className="font-medium">{label}</div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Last week: {formatValue(previous)}
        </div>
        <div className="text-sm font-medium">
          This week: {formatValue(current)}
        </div>
        <div className={`text-sm font-semibold ${changeColor}`}>
          {changeIcon} {Math.abs(change).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
