"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { track } from "@/lib/telemetry/track";

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  requiredIntegrations: string[];
  estimatedTimeMinutes: number;
  difficulty: string;
  steps: Array<{
    id: string;
    type: string;
    name: string;
    description: string;
    config: Record<string, unknown>;
    requiredFields?: string[];
  }>;
}

interface WorkflowFormProps {
  template?: WorkflowTemplate;
  onSuccess?: (workflow: { id: string; name: string }) => void;
  onCancel?: () => void;
}

export function WorkflowForm({ template, onSuccess, onCancel }: WorkflowFormProps) {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(template || null);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [config, setConfig] = useState<Record<string, Record<string, unknown>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setWorkflowName(selectedTemplate.name);
      setWorkflowDescription(selectedTemplate.description);
      // Initialize config with template defaults
      const initialConfig: Record<string, Record<string, unknown>> = {};
      for (const step of selectedTemplate.steps) {
        initialConfig[step.id] = { ...step.config };
      }
      setConfig(initialConfig);
    }
  }, [selectedTemplate]);

  async function fetchTemplates() {
    try {
      const response = await fetch("/api/workflows/templates");
      if (!response.ok) throw new Error("Failed to fetch templates");
      const data = await response.json();
      setTemplates(data.templates);
    } catch (err) {
      console.error("Failed to fetch templates", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({
          name: workflowName,
          description: workflowDescription,
          template_id: selectedTemplate?.id,
          steps: selectedTemplate?.steps.map((step) => ({
            id: step.id,
            type: step.type,
            config: config[step.id] || step.config,
          })) || [],
          enabled: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create workflow");
      }

      const data = await response.json();
      
      // Track workflow creation
      const userId = localStorage.getItem("user_id") || "anonymous";
      await track(userId, {
        type: "workflow_created",
        path: "/onboarding/create-workflow",
        meta: {
          workflow_id: data.workflow.id,
          workflow_name: workflowName,
          template_id: selectedTemplate?.id,
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });

      onSuccess?.(data.workflow);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workflow");
    } finally {
      setLoading(false);
    }
  }

  function updateStepConfig(stepId: string, field: string, value: unknown) {
    setConfig((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [field]: value,
      },
    }));
  }

  if (!selectedTemplate && templates.length > 0) {
    return (
      <div className="space-y-4">
        <div>
          <Label>Select Template</Label>
          <Select
            value={selectedTemplate?.id || ""}
            onValueChange={(value) => {
              const template = templates.find((t) => t.id === value);
              setSelectedTemplate(template || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a workflow template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <div className="flex items-center gap-2">
                    <span>{t.icon}</span>
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (!selectedTemplate) {
    return <div>Loading templates...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="workflow-name">Workflow Name</Label>
          <Input
            id="workflow-name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            required
            placeholder="My Workflow"
          />
        </div>

        <div>
          <Label htmlFor="workflow-description">Description</Label>
          <Textarea
            id="workflow-description"
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            placeholder="Describe what this workflow does"
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium">Configuration</div>
          {selectedTemplate.steps.map((step) => (
            <Card key={step.id}>
              <CardHeader>
                <CardTitle className="text-base">{step.name}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {step.requiredFields?.map((field) => (
                  <div key={field}>
                    <Label htmlFor={`${step.id}-${field}`}>
                      {field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ")}
                    </Label>
                    <Input
                      id={`${step.id}-${field}`}
                      value={(config[step.id]?.[field] as string) || ""}
                      onChange={(e) => updateStepConfig(step.id, field, e.target.value)}
                      required={step.requiredFields?.includes(field)}
                      placeholder={`Enter ${field}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Workflow"
            )}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
