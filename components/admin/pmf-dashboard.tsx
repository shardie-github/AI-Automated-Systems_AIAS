"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, Clock, Target, Heart } from "lucide-react";
import { pmfTracker, pmfThresholds } from "@/lib/analytics/pmf-metrics";

interface PMFMetrics {
  activationRate: number;
  sevenDayRetention: number;
  thirtyDayRetention: number;
  nps: number;
  timeToActivation: number;
  workflowsPerUser: number;
  monthlyActiveUsers: number;
  weeklyActiveUsers: number;
}

export function PMFDashboard() {
  const [metrics, setMetrics] = useState<PMFMetrics | null>(null);
  const [pmfScore, setPmfScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      const data = await pmfTracker.calculateMetrics();
      const score = pmfTracker.getPMFScore();
      setMetrics(data);
      setPmfScore(score);
      setLoading(false);
    }
    loadMetrics();
  }, []);

  if (loading || !metrics || !pmfScore) {
    return <div className="text-center py-12">Loading PMF metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overall PMF Score */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall PMF Score
          </CardTitle>
          <CardDescription>
            Product-Market Fit score based on activation, retention, and NPS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-6xl font-bold text-primary">{pmfScore.score}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">PMF Score</span>
                <span className={`text-sm font-semibold ${
                  pmfScore.status === "great" ? "text-green-600" :
                  pmfScore.status === "good" ? "text-yellow-600" :
                  "text-red-600"
                }`}>
                  {pmfScore.status.toUpperCase()}
                </span>
              </div>
              <Progress value={pmfScore.score} className="h-3" />
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Activation</div>
                  <div className={`font-semibold ${
                    pmfScore.breakdown.activation.status === "great" ? "text-green-600" :
                    pmfScore.breakdown.activation.status === "good" ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {pmfScore.breakdown.activation.score}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Retention</div>
                  <div className={`font-semibold ${
                    pmfScore.breakdown.retention.status === "great" ? "text-green-600" :
                    pmfScore.breakdown.retention.status === "good" ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {pmfScore.breakdown.retention.score}%
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">NPS</div>
                  <div className={`font-semibold ${
                    pmfScore.breakdown.nps.status === "great" ? "text-green-600" :
                    pmfScore.breakdown.nps.status === "good" ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {pmfScore.breakdown.nps.score}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{metrics.activationRate}%</div>
            <div className="flex items-center gap-2 text-sm">
              {metrics.activationRate >= pmfThresholds.activationRate.great ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-muted-foreground">
                Target: {pmfThresholds.activationRate.great}%
              </span>
            </div>
            <Progress 
              value={metrics.activationRate} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              7-Day Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{metrics.sevenDayRetention}%</div>
            <div className="flex items-center gap-2 text-sm">
              {metrics.sevenDayRetention >= pmfThresholds.retention.great ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-muted-foreground">
                Target: {pmfThresholds.retention.great}%
              </span>
            </div>
            <Progress 
              value={metrics.sevenDayRetention} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Promoter Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{metrics.nps}</div>
            <div className="flex items-center gap-2 text-sm">
              {metrics.nps >= pmfThresholds.nps.great ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-yellow-600" />
              )}
              <span className="text-muted-foreground">
                Target: {pmfThresholds.nps.great}
              </span>
            </div>
            <Progress 
              value={(metrics.nps + 100) / 2} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Time to Activation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{metrics.timeToActivation}h</div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Average</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Monthly Active Users</div>
                <div className="text-2xl font-bold">{metrics.monthlyActiveUsers.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Weekly Active Users</div>
                <div className="text-2xl font-bold">{metrics.weeklyActiveUsers.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Workflows per User</div>
                <div className="text-2xl font-bold">{metrics.workflowsPerUser}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">30-Day Retention</div>
                <div className="text-2xl font-bold">{metrics.thirtyDayRetention}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
