"use client";

import { DashboardPreview } from "./dashboard-preview";

interface DashboardPreviewWrapperProps {
  title?: string;
  description?: string;
  variant?: "default" | "settler" | "analytics";
  scrollTargetId?: string;
}

export function DashboardPreviewWrapper({
  title,
  description,
  variant,
  scrollTargetId = "demo-cta",
}: DashboardPreviewWrapperProps) {
  const handleRequestPreview = () => {
    const element = document.getElementById(scrollTargetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <DashboardPreview
      title={title}
      description={description}
      variant={variant}
      onRequestPreview={handleRequestPreview}
    />
  );
}
