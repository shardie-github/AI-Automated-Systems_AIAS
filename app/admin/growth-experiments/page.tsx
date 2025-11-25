"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  status: "planned" | "running" | "completed" | "failed";
  startDate: string;
  endDate?: string;
  metrics: {
    primary: string;
    secondary: string[];
  };
  results?: {
    primary: number;
    statisticalSignificance?: number;
    winner?: string;
  };
  learnings?: string;
  nextSteps?: string;
}

export default function GrowthExperimentsDashboard() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiments();
  }, []);

  async function fetchExperiments() {
    try {
      const response = await fetch("/api/admin/growth-experiments");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setExperiments(data.experiments || []);
    } catch (err) {
      console.error("Failed to fetch experiments:", err);
      // Use mock data for now
      setExperiments([
        {
          id: "1",
          name: "A/B Test Onboarding Flow",
          hypothesis: "We believe optimizing the onboarding flow will increase activation rate from [current]% to 40%+",
          status: "planned",
          startDate: new Date().toISOString(),
          metrics: {
            primary: "Activation rate",
            secondary: ["Time-to-activation", "Drop-off rate"],
          },
        },
        {
          id: "2",
          name: "Test Referral Rewards",
          hypothesis: "We believe offering commission-based referral rewards will increase referral rate from 5% to 15%",
          status: "planned",
          startDate: new Date().toISOString(),
          metrics: {
            primary: "Referral rate",
            secondary: ["Referral signups", "Referral conversions"],
          },
        },
        {
          id: "3",
          name: "Test Pricing Page Copy",
          hypothesis: "We believe emphasizing benefits and social proof will increase conversion rate to 10%+",
          status: "planned",
          startDate: new Date().toISOString(),
          metrics: {
            primary: "Conversion rate (free → paid)",
            secondary: ["Click-through rate", "Time on pricing page"],
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "running":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading experiments...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Growth Experiments Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track all growth experiments, results, and learnings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {experiments.map((experiment) => (
          <Card key={experiment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{experiment.name}</CardTitle>
                  <CardDescription className="mt-2">{experiment.hypothesis}</CardDescription>
                </div>
                <Badge className={getStatusColor(experiment.status)}>
                  {experiment.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Metrics</h4>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Primary:</strong> {experiment.metrics.primary}</p>
                    <p><strong>Secondary:</strong> {experiment.metrics.secondary.join(", ")}</p>
                  </div>
                </div>
                {experiment.results && (
                  <div>
                    <h4 className="font-semibold mb-2">Results</h4>
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Primary Metric:</strong> {experiment.results.primary}</p>
                      {experiment.results.statisticalSignificance && (
                        <p><strong>Statistical Significance:</strong> {experiment.results.statisticalSignificance}%</p>
                      )}
                      {experiment.results.winner && (
                        <p><strong>Winner:</strong> {experiment.results.winner}</p>
                      )}
                    </div>
                  </div>
                )}
                {experiment.learnings && (
                  <div>
                    <h4 className="font-semibold mb-2">Learnings</h4>
                    <p className="text-sm text-muted-foreground">{experiment.learnings}</p>
                  </div>
                )}
                {experiment.nextSteps && (
                  <div>
                    <h4 className="font-semibold mb-2">Next Steps</h4>
                    <p className="text-sm text-muted-foreground">{experiment.nextSteps}</p>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  <p>Start Date: {new Date(experiment.startDate).toLocaleDateString()}</p>
                  {experiment.endDate && (
                    <p>End Date: {new Date(experiment.endDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
