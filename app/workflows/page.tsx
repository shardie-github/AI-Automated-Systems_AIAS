import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Sparkles, Plus, Play, Settings } from "lucide-react";
import { WorkflowsEmptyState } from "@/components/ui/empty-state-enhanced";

export const metadata: Metadata = {
  title: "Workflows — AIAS Platform | Manage Your Automations",
  description: "Manage and monitor your AI workflows and automations. Create, execute, and optimize your business processes.",
};

export default function WorkflowsPage() {
  return (
    <div className="container py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Your Workflows
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Manage and monitor your automation workflows
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/onboarding/create-workflow">
              <Plus className="h-5 w-5 mr-2" />
              Create Workflow
            </Link>
          </Button>
        </div>

        {/* Empty state for no workflows */}
        <WorkflowsEmptyState />

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Create your first workflow to start automating your business processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Start with Templates</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose from pre-built templates for common workflows
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/templates">Browse Templates</Link>
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Build Custom</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a workflow from scratch tailored to your needs
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/onboarding/create-workflow">Create Custom</Link>
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Learn More</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore our documentation and guides
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/help">View Help</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Our team is here to help you get the most out of AIAS Platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/demo">Schedule Demo</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/help">Visit Help Center</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
