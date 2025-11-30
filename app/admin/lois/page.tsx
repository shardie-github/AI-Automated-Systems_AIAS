import { Metadata } from "next";
import { LOIDashboardEnhanced } from "@/components/sales/loi-dashboard-enhanced";

export const metadata: Metadata = {
  title: "LOI Management — Admin | AI Automated Systems",
  description: "Track and manage Letters of Intent for Seed Round fundraising",
};

export default function LOIPage() {
  return (
    <div className="container mx-auto py-8">
      <LOIDashboardEnhanced />
    </div>
  );
}
