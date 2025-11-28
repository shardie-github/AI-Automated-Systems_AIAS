import { Metadata } from "next";
// Card components imported but used in PMFDashboard component
import { PMFDashboard } from "@/components/admin/pmf-dashboard";

export const metadata: Metadata = {
  title: "PMF Metrics Dashboard — AIAS Platform",
  description: "Product-Market Fit metrics dashboard: activation rate, retention, NPS, and more.",
};

export default function PMFDashboardPage() {
  return (
    <div className="container py-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Product-Market Fit Dashboard</h1>
        <p className="text-muted-foreground">
          Track activation rate, retention, NPS, and other PMF indicators
        </p>
      </div>
      <PMFDashboard />
    </div>
  );
}
