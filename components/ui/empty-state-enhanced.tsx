"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen, Play } from "lucide-react";

interface EmptyStateEnhancedProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  tips?: string[];
  children?: React.ReactNode;
}

export function EmptyStateEnhanced({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  tips,
  children,
}: EmptyStateEnhancedProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          {icon || <Sparkles className="h-6 w-6 text-primary" />}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}

        {tips && tips.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-sm">Quick tips:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {primaryAction && (
            <Button asChild size="lg">
              <Link href={primaryAction.href}>
                {primaryAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" asChild>
              <Link href={secondaryAction.href}>
                {secondaryAction.label}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-configured empty states for common use cases

export function WorkflowsEmptyState() {
  return (
    <EmptyStateEnhanced
      title="Create your first workflow"
      description="Workflows automate repetitive tasks and save you 10+ hours per week. Create your first workflow to get started."
      icon={<Sparkles className="h-6 w-6 text-primary" />}
      primaryAction={{
        label: "Create Workflow",
        href: "/onboarding/create-workflow",
      }}
      secondaryAction={{
        label: "Browse Templates",
        href: "/templates",
      }}
      tips={[
        "Start with a template to save setup time",
        "Connect integrations to unlock powerful automations",
        "Test your workflow before activating it",
        "Most users see value after 3-5 workflows",
      ]}
    >
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-sm">Popular templates:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium mb-1 text-sm">E-commerce Order Processing</h5>
            <p className="text-xs text-muted-foreground">Automate order fulfillment</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium mb-1 text-sm">Lead Capture to CRM</h5>
            <p className="text-xs text-muted-foreground">Qualify and route leads</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium mb-1 text-sm">Daily Email Summary</h5>
            <p className="text-xs text-muted-foreground">Get daily reports automatically</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium mb-1 text-sm">Customer Support Automation</h5>
            <p className="text-xs text-muted-foreground">Route tickets intelligently</p>
          </div>
        </div>
      </div>
    </EmptyStateEnhanced>
  );
}

export function IntegrationsEmptyState() {
  return (
    <EmptyStateEnhanced
      title="Connect your first integration"
      description="Integrations unlock powerful automations. Connect your favorite tools to get started."
      icon={<Sparkles className="h-6 w-6 text-primary" />}
      primaryAction={{
        label: "Browse Integrations",
        href: "/integrations",
      }}
      secondaryAction={{
        label: "Learn More",
        href: "/help/integrations",
      }}
      tips={[
        "Start with tools you use daily (Shopify, Wave, Stripe)",
        "Each integration unlocks new automation possibilities",
        "You can connect multiple integrations to one workflow",
        "All integrations are secure and PIPEDA compliant",
      ]}
    />
  );
}

export function TemplatesEmptyState() {
  return (
    <EmptyStateEnhanced
      title="No templates found"
      description="Templates help you get started quickly with pre-built workflows."
      icon={<BookOpen className="h-6 w-6 text-primary" />}
      primaryAction={{
        label: "Create Custom Workflow",
        href: "/onboarding/create-workflow",
      }}
      secondaryAction={{
        label: "View Help",
        href: "/help",
      }}
    />
  );
}
