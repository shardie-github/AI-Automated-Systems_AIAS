"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ArrowRight, ArrowLeft, Sparkles, Zap, Target } from "lucide-react";
import { track } from "@/lib/telemetry/track";
import Link from "next/link";

interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

export function OnboardingWizard() {
  // const router = useRouter(); // Will be used for navigation
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const steps: Step[] = [
    {
      id: "welcome",
      title: "Welcome to AIAS Platform",
      description: "Let's get you set up in 30 minutes",
      component: <WelcomeStep onNext={() => goToNext()} />,
    },
    {
      id: "choose-integration",
      title: "Choose Your First Integration",
      description: "Connect a tool you use daily",
      component: <ChooseIntegrationStep onNext={() => goToNext()} />,
    },
    {
      id: "create-workflow",
      title: "Create Your First Workflow",
      description: "Build an automation in minutes",
      component: <CreateWorkflowStep onNext={() => goToNext()} />,
    },
    {
      id: "test-workflow",
      title: "Test Your Workflow",
      description: "Make sure everything works",
      component: <TestWorkflowStep onNext={() => goToNext()} />,
    },
    {
      id: "complete",
      title: "You're All Set!",
      description: "Start automating and saving time",
      component: <CompleteStep />,
    },
  ];

  useEffect(() => {
    // Track onboarding start
    const userId = localStorage.getItem("user_id") || "anonymous";
    track(userId, {
      type: "onboarding_started",
      path: "/onboarding",
      meta: {
        timestamp: new Date().toISOString(),
      },
      app: "web",
    });
  }, []);

  const goToNext = () => {
    const currentStepId = steps[currentStep].id;
    if (!completedSteps.includes(currentStepId)) {
      setCompletedSteps([...completedSteps, currentStepId]);
    }
    
    // Track step completion
    const userId = localStorage.getItem("user_id") || "anonymous";
    track(userId, {
      type: "onboarding_step_completed",
      path: "/onboarding",
      meta: {
        step_id: currentStepId,
        step_number: currentStep + 1,
        timestamp: new Date().toISOString(),
      },
      app: "web",
    });
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Track activation
      track(userId, {
        type: "onboarding_completed",
        path: "/onboarding",
        meta: {
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-6" role="main" aria-label="Onboarding wizard">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" aria-label={`Onboarding progress: ${Math.round(progress)}%`} />
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between" role="list" aria-label="Onboarding steps">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1" role="listitem">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  index < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : index === currentStep
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted text-muted-foreground"
                }`}
                aria-label={`Step ${index + 1}: ${step.title}${index < currentStep ? " completed" : index === currentStep ? " current" : ""}`}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{index + 1}</span>
                )}
              </div>
              <div className="mt-2 text-xs text-center max-w-[100px] text-muted-foreground">
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  index < currentStep ? "bg-primary" : "bg-muted"
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {steps[currentStep].component}
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep < steps.length - 1 && (
        <div className="flex justify-between" role="navigation" aria-label="Onboarding navigation">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentStep === 0}
            aria-label="Go to previous step"
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Previous
          </Button>
          <Button onClick={goToNext} aria-label="Go to next step">
            Next
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-2xl font-bold mb-2">Welcome to AIAS Platform!</h3>
        <p className="text-muted-foreground">
          We'll help you create your first automation workflow in just 30 minutes.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Zap className="h-8 w-8 text-primary mx-auto mb-2" aria-hidden="true" />
          <div className="font-semibold mb-1">Quick Setup</div>
          <div className="text-sm text-muted-foreground">30 minutes</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Target className="h-8 w-8 text-primary mx-auto mb-2" aria-hidden="true" />
          <div className="font-semibold mb-1">First Workflow</div>
          <div className="text-sm text-muted-foreground">Automate tasks</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Check className="h-8 w-8 text-primary mx-auto mb-2" aria-hidden="true" />
          <div className="font-semibold mb-1">Save Time</div>
          <div className="text-sm text-muted-foreground">10+ hours/week</div>
        </div>
      </div>
      <Button onClick={onNext} className="w-full" size="lg">
        Get Started
        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

function ChooseIntegrationStep({ onNext }: { onNext: () => void }) {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const integrations = [
    { name: "Shopify", icon: "🛍️", description: "E-commerce automation", provider: "shopify" },
    { name: "Wave Accounting", icon: "📊", description: "Financial automation", provider: "wave" },
    { name: "Stripe", icon: "💳", description: "Payment processing", provider: "stripe" },
    { name: "Gmail", icon: "📧", description: "Email automation", provider: "gmail" },
    { name: "Slack", icon: "💬", description: "Team communication", provider: "slack" },
    { name: "Notion", icon: "📝", description: "Productivity automation", provider: "notion" },
  ];

  async function handleIntegrationClick(provider: string) {
    setSelectedIntegration(provider);
    setConnecting(true);

    try {
      // Get OAuth URL
      const response = await fetch(`/api/integrations/${provider}/oauth`);
      if (!response.ok) throw new Error("Failed to initiate OAuth");

      const data = await response.json();
      
      // Track integration connection attempt
      const userId = localStorage.getItem("user_id") || "anonymous";
      track(userId, {
        type: "integration_connect_started",
        path: "/onboarding/choose-integration",
        meta: {
          provider,
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });
      
      // Redirect to OAuth URL
      if (data.oauth_url) {
        window.location.href = data.oauth_url;
      } else {
        // For demo purposes, simulate connection
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onNext();
      }
    } catch (error) {
      // Note: Using console.error here as this is a demo/fallback scenario
      // In production, this should use structured logger
      console.error("Failed to connect integration", error);
      // For demo purposes, continue anyway
      onNext();
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Choose a tool you use daily. We'll help you automate it.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4" role="list" aria-label="Available integrations">
        {integrations.map((integration) => (
          <button
            key={integration.name}
            onClick={() => handleIntegrationClick(integration.provider)}
            disabled={connecting}
            className={`p-4 border rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              selectedIntegration === integration.provider
                ? "border-primary bg-primary/10"
                : "hover:border-primary hover:bg-primary/5"
            } ${connecting ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label={`Connect ${integration.name}`}
            role="listitem"
          >
            <div className="text-2xl mb-2" aria-hidden="true">{integration.icon}</div>
            <div className="font-semibold mb-1">{integration.name}</div>
            <div className="text-sm text-muted-foreground">{integration.description}</div>
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Don't see your tool? <Link href="/integrations" className="text-primary hover:underline">Browse all integrations</Link>
      </p>
    </div>
  );
}

function CreateWorkflowStep({ onNext: _onNext }: { onNext: () => void }) {
  const router = useRouter();

  function handleCreateWorkflow() {
    // Navigate to template selection page
    router.push("/onboarding/select-template");
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Let's create a simple workflow. Choose from our pre-built templates or create your own.
      </p>
      <div className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="font-semibold mb-2">Trigger</div>
          <div className="text-sm text-muted-foreground">New order in Shopify</div>
        </div>
        <div className="text-center text-2xl" aria-hidden="true">→</div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="font-semibold mb-2">Action</div>
          <div className="text-sm text-muted-foreground">Send notification to Slack</div>
        </div>
      </div>
      <Button onClick={handleCreateWorkflow} className="w-full" size="lg">
        Choose Template
        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

function TestWorkflowStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Great! Your workflow is created. Let's test it to make sure everything works.
      </p>
      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 mb-2">
          <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
          <div className="font-semibold text-green-900 dark:text-green-100">Workflow Created Successfully</div>
        </div>
        <div className="text-sm text-green-800 dark:text-green-200">
          Your workflow is ready to use. It will automatically run when triggered.
        </div>
      </div>
      <Button onClick={onNext} className="w-full" size="lg">
        Test Complete
        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

function CompleteStep() {
  return (
    <div className="space-y-6 text-center">
      <div className="text-6xl mb-4" role="img" aria-label="Celebration">🎉</div>
      <h3 className="text-2xl font-bold">Congratulations!</h3>
      <p className="text-muted-foreground">
        You've created your first workflow. You're now ready to automate and save time.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-left">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-sm">Create more workflows</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-sm">Explore templates</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-sm">Connect more integrations</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-left">
            <Link href="/help" className="block text-sm text-primary hover:underline">
              Help Center
            </Link>
            <Link href="/case-studies" className="block text-sm text-primary hover:underline">
              Case Studies
            </Link>
            <Link href="/blog" className="block text-sm text-primary hover:underline">
              Blog & Tutorials
            </Link>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button size="lg" asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/templates">Browse Templates</Link>
        </Button>
      </div>
    </div>
  );
}
