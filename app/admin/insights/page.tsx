"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface UsagePattern {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
  trend: "increasing" | "decreasing" | "stable";
  adoptionRate: number;
  averageFrequency: number;
}

interface ErrorPattern {
  category: string;
  message: string;
  count: number;
  affectedUsers: number;
  trend: "increasing" | "decreasing" | "stable";
  likelyCause: string;
  suggestedFix: string;
}

interface HealthSignal {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  confidence: number;
  predictedImpact: string;
  recommendedAction: string;
}

export default function InsightsPage() {
  const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>([]);
  const [errorPatterns, setErrorPatterns] = useState<ErrorPattern[]>([]);
  const [healthSignals, setHealthSignals] = useState<HealthSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    setLoading(true);
    try {
      // In production, these would use proper auth
      const [usageRes, errorsRes, healthRes] = await Promise.all([
        fetch("/api/insights/usage-patterns?days=30"),
        fetch("/api/insights/errors?days=7"),
        fetch("/api/insights/health"),
      ]);

      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsagePatterns(usageData.usagePatterns || []);
      }

      if (errorsRes.ok) {
        const errorsData = await errorsRes.json();
        setErrorPatterns(errorsData.topErrors || []);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealthSignals(healthData.signals || []);
      }
    } catch (error) {
      console.error("Failed to load insights", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">AI Insights Dashboard</h1>
        <p>Loading insights...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Insights Dashboard</h1>
        <p className="text-muted-foreground">
          AI-driven insights for usage patterns, errors, and system health
        </p>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          <TabsTrigger value="health">Health Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Patterns</CardTitle>
              <CardDescription>
                Top features by usage count and adoption rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usagePatterns.slice(0, 10).map((pattern) => (
                  <div key={pattern.feature} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{pattern.feature}</div>
                      <div className="text-sm text-muted-foreground">
                        {pattern.usageCount} uses by {pattern.uniqueUsers} users
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Adoption: {pattern.adoptionRate}% | Avg frequency: {pattern.averageFrequency.toFixed(1)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pattern.trend === "increasing" && (
                        <Badge variant="default" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Increasing
                        </Badge>
                      )}
                      {pattern.trend === "decreasing" && (
                        <Badge variant="destructive" className="gap-1">
                          <TrendingDown className="h-3 w-3" />
                          Decreasing
                        </Badge>
                      )}
                      {pattern.trend === "stable" && (
                        <Badge variant="secondary">Stable</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {usagePatterns.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No usage patterns found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
              <CardDescription>
                Top errors by frequency and impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errorPatterns.map((error) => (
                  <Alert key={error.message} className="border-l-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="font-medium">{error.message}</AlertTitle>
                    <AlertDescription className="mt-2">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Badge variant="outline">{error.category}</Badge>
                          <Badge variant="outline">{error.count} occurrences</Badge>
                          <Badge variant="outline">{error.affectedUsers} users affected</Badge>
                        </div>
                        <div className="mt-2">
                          <div className="font-medium text-sm">Likely Cause:</div>
                          <div className="text-sm text-muted-foreground">{error.likelyCause}</div>
                        </div>
                        <div className="mt-2">
                          <div className="font-medium text-sm">Suggested Fix:</div>
                          <div className="text-sm text-muted-foreground">{error.suggestedFix}</div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
                {errorPatterns.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No errors found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Health Signals</CardTitle>
              <CardDescription>
                Early warnings and system health indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthSignals.map((signal, idx) => (
                  <Alert
                    key={idx}
                    className={`border-l-4 ${
                      signal.severity === "critical"
                        ? "border-red-500"
                        : signal.severity === "high"
                        ? "border-orange-500"
                        : signal.severity === "medium"
                        ? "border-yellow-500"
                        : "border-blue-500"
                    }`}
                  >
                    {signal.severity === "critical" || signal.severity === "high" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Info className="h-4 w-4" />
                    )}
                    <AlertTitle className="font-medium flex items-center gap-2">
                      {signal.message}
                      <Badge
                        variant={
                          signal.severity === "critical"
                            ? "destructive"
                            : signal.severity === "high"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {signal.severity}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Confidence:</span> {signal.confidence}%
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Predicted Impact:</span> {signal.predictedImpact}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Recommended Action:</span> {signal.recommendedAction}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
                {healthSignals.length === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>All Systems Healthy</AlertTitle>
                    <AlertDescription>
                      No health issues detected. System is operating normally.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
