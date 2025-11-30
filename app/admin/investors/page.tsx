import { Metadata } from "next";
import { InvestorDashboard } from "@/components/sales/investor-dashboard";

export const metadata: Metadata = {
  title: "Investor Outreach — Admin | AIAS Platform",
  description: "Track investor meetings and deal status for Seed Round fundraising",
};

export default function InvestorsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Investor Outreach</h1>
        <p className="text-muted-foreground">
          Track investor meetings, follow-ups, and deal status. Target: $3M Seed Round
        </p>
      </div>
      <InvestorDashboard />
    </div>
  );
}
