"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ArrowRight, ArrowLeft, Sparkles, Zap, Target } from "lucide-react";
import { conversionTracker } from "@/lib/analytics/conversion-tracking";
import Link from "next/link";

interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

export function OnboardingWizard() {
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

  const goToNext = () => {
    const currentStepId = steps[currentStep].id;
    if (!completedSteps.includes(currentStepId)) {
      setCompletedSteps([...completedSteps, currentStepId]);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Track activation
      conversionTracker.track("first_workflow_created", {
        timeToActivation: Date.now(),
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
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  index < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : index === currentStep
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted text-muted-foreground"
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
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
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={goToNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
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
        <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Welcome to AIAS Platform!</h3>
        <p className="text-muted-foreground">
          We'll help you create your first automation workflow in just 30 minutes.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="font-semibold mb-1">Quick Setup</div>
          <div className="text-sm text-muted-foreground">30 minutes</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Target className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="font-semibold mb-1">First Workflow</div>
          <div className="text-sm text-muted-foreground">Automate tasks</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Check className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="font-semibold mb-1">Save Time</div>
          <div className="text-sm text-muted-foreground">10+ hours/week</div>
        </div>
      </div>
      <Button onClick={onNext} className="w-full" size="lg">
        Get Started
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

function ChooseIntegrationStep({ onNext }: { onNext: () => void }) {
  const integrations = [
    { name: "Shopify", icon: "🛍️", description: "E-commerce automation" },
    { name: "Wave Accounting", icon: "📊", description: "Financial automation" },
    { name: "Stripe", icon: "💳", description: "Payment processing" },
    { name: "Gmail", icon: "📧", description: "Email automation" },
    { name: "Slack", icon: "💬", description: "Team communication" },
    { name: "Notion", icon: "📝", description: "Productivity automation" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Choose a tool you use daily. We'll help you automate it.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <button
            key={integration.name}
            onClick={onNext}
            className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
          >
            <div className="text-2xl mb-2">{integration.icon}</div>
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

function CreateWorkflowStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Let's create a simple workflow. For example: "When a new order comes in Shopify, send a notification to Slack."
      </p>
      <div className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="font-semibold mb-2">Trigger</div>
          <div className="text-sm text-muted-foreground">New order in Shopify</div>
        </div>
        <div className="text-center text-2xl">→</div>
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="font-semibold mb-2">Action</div>
          <div className="text-sm text-muted-foreground">Send notification to Slack</div>
        </div>
      </div>
      <Button onClick={onNext} className="w-full" size="lg">
        Create Workflow
        <ArrowRight className="ml-2 h-4 w-4" />
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
          <Check className="h-5 w-5 text-green-600" />
          <div className="font-semibold text-green-900 dark:text-green-100">Workflow Created Successfully</div>
        </div>
        <div className="text-sm text-green-800 dark:text-green-200">
          Your workflow is ready to use. It will automatically run when triggered.
        </div>
      </div>
      <Button onClick={onNext} className="w-full" size="lg">
        Test Complete
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

function CompleteStep() {
  return (
    <div className="space-y-6 text-center">
      <div className="text-6xl mb-4">🎉</div>
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
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">Create more workflows</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">Explore templates</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
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
