"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Clock, Zap, CheckCircle, XCircle } from "lucide-react";
import { UsageProgressBanner } from "@/components/monetization/usage-progress-banner";
import { TrialCountdownBanner } from "@/components/monetization/trial-countdown-banner";

interface UsageData {
  plan: string;
  month: string;
  limit: number;
  used: number;
  remaining: number;
}

interface WorkflowStats {
  total: number;
  active: number;
  completed: number;
  failed: number;
  successRate: number;
}

interface TimeSaved {
  hours: number;
  value: number;
  hourlyRate: number;
}

export default function AnalyticsPage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [workflowStats, setWorkflowStats] = useState<WorkflowStats | null>(null);
  const [timeSaved, setTimeSaved] = useState<TimeSaved | null>(null);
  const [loading, setLoading] = useState(true);
  const [executionHistory, setExecutionHistory] = useState<Array<{ date: string; completed: number; failed: number }>>([]);
  const [trialInfo, setTrialInfo] = useState<{ daysRemaining: number; trialEndDate: string } | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);

      // Fetch usage data
      const usageResponse = await fetch("/api/analytics/usage");
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsage(usageData);
      }

      // Fetch workflow stats
      const statsResponse = await fetch("/api/analytics/workflows");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setWorkflowStats(statsData);
      }

      // Fetch time saved
      const timeResponse = await fetch("/api/analytics/time-saved");
      if (timeResponse.ok) {
        const timeData = await timeResponse.json();
        setTimeSaved(timeData);
      }

      // Fetch execution history
      const historyResponse = await fetch("/api/analytics/execution-history");
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setExecutionHistory(historyData);
      }

      // Fetch trial info (if on trial)
      const trialResponse = await fetch("/api/trial/user-data");
      if (trialResponse.ok) {
        const trialData = await trialResponse.json();
        if (trialData.plan === "trial" && trialData.trialEndDate) {
          const endDate = new Date(trialData.trialEndDate);
          const now = new Date();
          const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setTrialInfo({ daysRemaining, trialEndDate: trialData.trialEndDate });
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-16">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  const usagePercentage = usage ? (usage.used / usage.limit) * 100 : 0;

  return (
    <div className="container py-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track your automation usage, workflow performance, and time savings
        </p>
      </div>

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

      {/* Usage Overview */}
      {usage && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Automation Usage</CardTitle>
            <CardDescription>
              Current month: {usage.month} • Plan: {usage.plan}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    {usage.used.toLocaleString()} / {usage.limit.toLocaleString()} automations
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {usage.remaining.toLocaleString()} remaining
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>
              {usagePercentage > 80 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    <strong>Warning:</strong> You've used {usagePercentage.toFixed(0)}% of your monthly limit. 
                    {usagePercentage >= 100 ? " Upgrade your plan to continue automating." : " Consider upgrading if you need more."}
                  </p>
                  <Button size="sm" variant="outline" className="mt-2" asChild>
                    <a href="/pricing">Upgrade Plan</a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {workflowStats && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{workflowStats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {workflowStats.active} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Success Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{workflowStats.successRate.toFixed(1)}%</div>
                <div className="flex items-center gap-1 mt-1">
                  {workflowStats.successRate >= 90 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {workflowStats.completed} completed, {workflowStats.failed} failed
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {timeSaved && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Time Saved This Month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{timeSaved.hours.toFixed(1)}h</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ${timeSaved.value.toFixed(2)} value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Estimated ROI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {timeSaved.value > 0 ? `${((timeSaved.value / 49) * 100).toFixed(0)}%` : "0%"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on ${timeSaved.hourlyRate}/hour rate
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Execution History Chart */}
      {executionHistory.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Execution History (Last 30 Days)</CardTitle>
            <CardDescription>Workflow executions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={executionHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#22c55e" name="Completed" />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <a href="/workflows">View All Workflows</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/workflows?create=true">Create New Workflow</a>
            </Button>
            {usage && usagePercentage > 80 && (
              <Button asChild>
                <a href="/pricing">Upgrade Plan</a>
              </Button>
            )}
            <Button variant="outline" asChild>
              <a href="/help">View Documentation</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
