"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, TrendingUp, Zap, AlertCircle } from "lucide-react";

interface ImprovementCandidate {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  priority: number;
  estimatedImpact: string;
  estimatedEffort: string;
  risk: "low" | "medium" | "high";
  suggestedImplementation: string;
}

export default function OptimizationPage() {
  const [candidates, setCandidates] = useState<ImprovementCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImprovements();
  }, []);

  async function loadImprovements() {
    setLoading(true);
    try {
      const res = await fetch("/api/insights/improvements");
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
      }
    } catch (error) {
      console.error("Failed to load improvements", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Optimization Opportunities</h1>
        <p>Loading improvements...</p>
      </div>
    );
  }

  const quickWins = candidates.filter((c) => c.impact === "high" && c.effort === "low");
  const highPriority = candidates.filter((c) => c.priority >= 70);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Optimization Opportunities</h1>
        <p className="text-muted-foreground">
          AI-generated improvement suggestions based on system insights
        </p>
      </div>

      {quickWins.length > 0 && (
        <Alert className="mb-6 border-green-500">
          <Zap className="h-4 w-4" />
          <AlertTitle>Quick Wins Available</AlertTitle>
          <AlertDescription>
            {quickWins.length} high-impact, low-effort improvements identified
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {highPriority.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                High Priority Improvements
              </CardTitle>
              <CardDescription>
                Top improvements sorted by priority
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {highPriority.map((candidate) => (
                  <Card key={candidate.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{candidate.title}</CardTitle>
                          <CardDescription className="mt-1">{candidate.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={candidate.impact === "high" ? "default" : "secondary"}>
                            {candidate.impact} impact
                          </Badge>
                          <Badge variant={candidate.effort === "low" ? "default" : "outline"}>
                            {candidate.effort} effort
                          </Badge>
                          <Badge variant="outline">Priority: {candidate.priority}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Category:</span> {candidate.category}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Estimated Impact:</span> {candidate.estimatedImpact}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Estimated Effort:</span> {candidate.estimatedEffort}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Risk:</span>{" "}
                          <Badge variant={candidate.risk === "low" ? "default" : "destructive"} className="ml-1">
                            {candidate.risk}
                          </Badge>
                        </div>
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <div className="font-medium text-sm mb-1">Suggested Implementation:</div>
                          <div className="text-sm text-muted-foreground">{candidate.suggestedImplementation}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {candidates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                All Improvement Candidates
              </CardTitle>
              <CardDescription>
                Complete list of optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{candidate.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{candidate.description}</div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Badge variant="outline">{candidate.category}</Badge>
                      <Badge variant={candidate.impact === "high" ? "default" : "secondary"}>
                        {candidate.impact}
                      </Badge>
                      <Badge variant={candidate.effort === "low" ? "default" : "outline"}>
                        {candidate.effort}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {candidates.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Improvements Found</AlertTitle>
            <AlertDescription>
              No optimization opportunities detected at this time. Check back later for new insights.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
