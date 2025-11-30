import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LTVCACDashboard } from "@/components/metrics/ltv-cac-dashboard";

export const metadata: Metadata = {
  title: "LTV:CAC Dashboard — Admin | AIAS Platform",
  description: "Real-time unit economics dashboard for investor review",
};

export default function LTVCACPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Unit Economics Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time LTV:CAC, churn, and NRR metrics for VC review
        </p>
      </div>
      <LTVCACDashboard />
    </div>
  );
}
