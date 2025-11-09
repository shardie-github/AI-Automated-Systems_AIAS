import { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/wizard";

export const metadata: Metadata = {
  title: "Get Started — AIAS Platform | Create Your First Workflow",
  description: "Step-by-step onboarding to create your first AI automation workflow. Get started in 30 minutes.",
};

export default function OnboardingPage() {
  return (
    <div className="container py-16 max-w-4xl">
      <OnboardingWizard />
    </div>
  );
}
