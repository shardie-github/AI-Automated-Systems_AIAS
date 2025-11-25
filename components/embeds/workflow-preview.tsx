"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface WorkflowPreviewProps {
  workflowId: string;
  embedId?: string;
}

export function WorkflowPreview({ workflowId, embedId }: WorkflowPreviewProps) {
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflow();
  }, [workflowId]);

  async function fetchWorkflow() {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setWorkflow(data);
    } catch (err) {
      console.error("Failed to fetch workflow:", err);
    } finally {
      setLoading(false);
    }
  }

  // Track embed view
  useEffect(() => {
    if (embedId) {
      fetch("/api/embeds/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embedId, workflowId }),
      }).catch(console.error);
    }
  }, [embedId, workflowId]);

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading workflow preview...</div>
        </CardContent>
      </Card>
    );
  }

  if (!workflow) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Workflow not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{workflow.name || "Workflow Preview"}</CardTitle>
        <CardDescription>
          Powered by AIAS Platform — Automate your business workflows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {workflow.description && (
          <p className="text-sm text-muted-foreground">{workflow.description}</p>
        )}
        <div className="space-y-2">
          <p className="text-sm font-medium">What this workflow does:</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            {workflow.steps?.slice(0, 3).map((step: any, index: number) => (
              <li key={index}>{step.name || `Step ${index + 1}`}</li>
            ))}
          </ul>
        </div>
        <Button className="w-full" asChild>
          <Link href={`/signup?ref=embed-${embedId || workflowId}`}>
            Try This Workflow Free
          </Link>
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Start automating in 30 minutes. No credit card required.
        </p>
      </CardContent>
    </Card>
  );
}

// Embed script for external websites
export function WorkflowPreviewEmbedScript({ workflowId }: { workflowId: string }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var script = document.createElement('script');
            script.src = '${typeof window !== 'undefined' ? window.location.origin : ''}/api/embeds/${workflowId}/script.js';
            script.async = true;
            document.head.appendChild(script);
          })();
        `,
      }}
    />
  );
}
