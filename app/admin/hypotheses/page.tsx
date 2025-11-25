"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Hypothesis {
  id: string;
  area: string;
  statement: string;
  status: "untested" | "partially_tested" | "validated";
  testMethods: string[];
  successCriteria: string;
  results?: string;
  confidence: "low" | "medium" | "high";
}

export default function HypothesesDashboard() {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHypotheses();
  }, []);

  async function fetchHypotheses() {
    try {
      const response = await fetch("/api/admin/hypotheses");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setHypotheses(data.hypotheses || []);
    } catch (err) {
      console.error("Failed to fetch hypotheses:", err);
      // Use mock data from LEAN_STARTUP_HYPOTHESES.md
      setHypotheses([
        {
          id: "1",
          area: "Problem",
          statement: "We believe Canadian SMBs waste 10-30 hours/week on repetitive manual tasks and would pay $49/month to automate them",
          status: "partially_tested",
          testMethods: ["Customer interviews", "Surveys", "Market research"],
          successCriteria: "80%+ confirm problem exists, 50%+ willing to pay $49/month",
          confidence: "medium",
        },
        {
          id: "2",
          area: "Customer Segment",
          statement: "We believe Canadian e-commerce SMBs (Shopify store owners) are the best initial customer segment",
          status: "untested",
          testMethods: ["Target Shopify store owners", "Measure activation rate"],
          successCriteria: "40%+ activation rate for Shopify store owners",
          confidence: "low",
        },
        {
          id: "3",
          area: "Solution",
          statement: "We believe visual workflow builders solve the problem by allowing users to automate tasks without coding",
          status: "untested",
          testMethods: ["Concierge MVP", "Beta testing", "Prototype testing"],
          successCriteria: "70%+ successfully create workflows, < 2 days time-to-activation",
          confidence: "low",
        },
        {
          id: "4",
          area: "Revenue Model",
          statement: "We believe $49/month subscription pricing is the right model",
          status: "untested",
          testMethods: ["Pricing tests", "Conversion tracking", "Willingness to pay interviews"],
          successCriteria: "10%+ conversion rate (free → paid), $49 ARPU, 3:1 LTV:CAC",
          confidence: "low",
        },
        {
          id: "5",
          area: "Growth Channel",
          statement: "We believe Shopify App Store is the best initial growth channel",
          status: "untested",
          testMethods: ["Submit app to Shopify App Store", "Track installs and activations"],
          successCriteria: "100+ installs/month, 20%+ activation rate, lower CAC than other channels",
          confidence: "low",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "validated":
        return "bg-green-500";
      case "partially_tested":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      default:
        return "text-red-600";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading hypotheses...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hypotheses Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track hypothesis validation status and test results
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {hypotheses.map((hypothesis) => (
          <Card key={hypothesis.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{hypothesis.area} Hypothesis</CardTitle>
                  <CardDescription className="mt-2">{hypothesis.statement}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(hypothesis.status)}>
                    {hypothesis.status.replace("_", " ").toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className={getConfidenceColor(hypothesis.confidence)}>
                    {hypothesis.confidence.toUpperCase()} CONFIDENCE
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Test Methods</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {hypothesis.testMethods.map((method, index) => (
                      <li key={index}>{method}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Success Criteria</h4>
                  <p className="text-sm text-muted-foreground">{hypothesis.successCriteria}</p>
                </div>
                {hypothesis.results && (
                  <div>
                    <h4 className="font-semibold mb-2">Results</h4>
                    <p className="text-sm text-muted-foreground">{hypothesis.results}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
