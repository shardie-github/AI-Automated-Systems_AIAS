import { Metadata } from "next";
import { CustomerHealthDashboardEnhanced } from "@/components/metrics/customer-health-dashboard-enhanced";

export const metadata: Metadata = {
  title: "Customer Health Dashboard — Admin | AIAS Platform",
  description: "Real-time customer health scores and retention metrics",
};

export default function CustomerHealthPage() {
  return (
    <div className="container mx-auto py-8">
      <CustomerHealthDashboardEnhanced />
    </div>
  );
}
