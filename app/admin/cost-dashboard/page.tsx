/**
 * Executive Cost Dashboard
 * 
 * Comprehensive dashboard for monitoring and managing infrastructure costs.
 * Admin access required.
 */

"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  PieChart,
  Calendar,
  Settings,
} from "lucide-react";
import { CostMetrics } from "@/lib/cost-tracking/service-costs";
import { CostAlert } from "@/lib/cost-tracking/cost-monitor";
import { OptimizationRecommendation } from "@/lib/cost-tracking/cost-optimizer";

export default function CostDashboard() {
  const [metrics, setMetrics] = useState<CostMetrics | null>(null);
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCostData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchCostData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchCostData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cost/metrics");
      if (!response.ok) throw new Error("Failed to fetch cost data");

      const data = await response.json();
      setMetrics(data.metrics);
      setAlerts(data.alerts || []);
      setRecommendations(data.recommendations || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cost data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading cost metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Cost Data</CardTitle>
            <CardDescription>
              Cost tracking has not been set up yet. Configure service integrations to start tracking costs.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const totalSavings = recommendations.reduce(
    (sum, rec) => sum + rec.estimatedSavings,
    0
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Cost Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and optimize infrastructure costs across all services
          </p>
        </div>
        <Button onClick={fetchCostData} variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalMonthly.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${metrics.totalDaily.toFixed(2)} per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecast (Next Month)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.forecast.nextMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.forecast.nextMonth > metrics.totalMonthly ? (
                <span className="text-destructive">
                  +${(metrics.forecast.nextMonth - metrics.totalMonthly).toFixed(2)}
                </span>
              ) : (
                <span className="text-green-600">
                  -${(metrics.totalMonthly - metrics.forecast.nextMonth).toFixed(2)}
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter((a) => a.severity === "critical").length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSavings.toFixed(2)}/mo</div>
            <p className="text-xs text-muted-foreground">
              {recommendations.length} recommendations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <Alert
                  key={alert.id}
                  variant={alert.severity === "critical" ? "destructive" : "default"}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{alert.service}</AlertTitle>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="services">
            <PieChart className="h-4 w-4 mr-2" />
            By Service
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Lightbulb className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Trends</CardTitle>
              <CardDescription>Last 7 periods (5 days each)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{trend.period}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(trend.total / Math.max(...metrics.trends.map((t) => t.total))) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-20 text-right">
                        ${trend.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forecast</CardTitle>
              <CardDescription>Projected costs based on current trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Next Month</p>
                  <p className="text-2xl font-bold">${metrics.forecast.nextMonth.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Quarter</p>
                  <p className="text-2xl font-bold">${metrics.forecast.nextQuarter.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Year</p>
                  <p className="text-2xl font-bold">${metrics.forecast.nextYear.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          {metrics.byService.map((service) => (
            <Card key={service.service}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{service.service}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={service.trend === "up" ? "destructive" : service.trend === "down" ? "default" : "secondary"}>
                      {service.trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                      {service.trend === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
                      {service.trend}
                    </Badge>
                    <span className="text-2xl font-bold">${service.total.toFixed(2)}</span>
                  </div>
                </div>
                <CardDescription>
                  {((service.total / metrics.totalMonthly) * 100).toFixed(1)}% of total costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {service.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-20 text-right">
                          ${item.amount.toFixed(2)} ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No optimization recommendations at this time.
              </CardContent>
            </Card>
          ) : (
            recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {rec.title}
                        <Badge
                          variant={
                            rec.priority === "critical"
                              ? "destructive"
                              : rec.priority === "high"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {rec.priority}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">{rec.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ${rec.estimatedSavings.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">potential savings</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Action Items:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {rec.actionItems.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Cost Thresholds</CardTitle>
              <CardDescription>Configure alerts when costs exceed thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Threshold management coming soon. Use the API to configure thresholds.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}
