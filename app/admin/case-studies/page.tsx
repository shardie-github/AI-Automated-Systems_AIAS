import { Metadata } from "next";
import { CaseStudyDashboard } from "@/components/sales/case-study-dashboard";

export const metadata: Metadata = {
  title: "Case Studies — Admin | AIAS Platform",
  description: "Manage customer success stories for sales and marketing",
};

export default function CaseStudiesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Case Studies</h1>
        <p className="text-muted-foreground">
          Manage customer success stories. Target: 3 case studies
        </p>
      </div>
      <CaseStudyDashboard />
    </div>
  );
}
