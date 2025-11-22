"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WorkflowForm } from "@/components/workflows/WorkflowForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  requiredIntegrations: string[];
  estimatedTimeMinutes: number;
  difficulty: "easy" | "medium" | "advanced";
  steps: Array<{
    id: string;
    type: string;
    name: string;
    description: string;
    config: Record<string, unknown>;
    requiredFields?: string[];
  }>;
}

export default function CreateWorkflowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId);
    } else {
      setLoading(false);
    }
  }, [templateId]);

  async function fetchTemplate(id: string) {
    try {
      const response = await fetch(`/api/workflows/templates`);
      if (!response.ok) throw new Error("Failed to fetch template");
      const data = await response.json();
      const foundTemplate = data.templates.find((t: WorkflowTemplate) => t.id === id);
      setTemplate(foundTemplate || null);
    } catch (err) {
      console.error("Failed to fetch template", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSuccess(workflow: { id: string; name: string }) {
    router.push(`/onboarding/results?workflow=${workflow.id}`);
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Create Your Workflow</h1>
        <p className="text-muted-foreground">
          Configure your workflow settings and customize it to your needs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Configuration</CardTitle>
          <CardDescription>
            {template
              ? `Configuring: ${template.name}`
              : "Fill in the details below to create your workflow"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkflowForm template={template || undefined} onSuccess={handleSuccess} />
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
