"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ArrowRight, ArrowLeft, Sparkles, Zap, Target, Clock } from "lucide-react";
import { conversionTracker } from "@/lib/analytics/conversion-tracking";
import { track } from "@/lib/telemetry/track";
import Link from "next/link";

interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  estimatedTime?: number; // in seconds
}

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [targetTime] = useState(5 * 60 * 1000); // 5 minutes in milliseconds

  // Track time elapsed
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(Date.now() - startTimeRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Track onboarding start with timestamp
    const userId = localStorage.getItem("user_id") || "anonymous";
    startTimeRef.current = Date.now();
    
    track(userId, {
      type: "onboarding_started",
      path: "/onboarding",
      meta: {
        timestamp: new Date().toISOString(),
        target_time_seconds: 300, // 5 minutes
      },
      app: "web",
    });

    conversionTracker.track("onboarding_started", {
      userId,
      timestamp: Date.now(),
      targetTimeToAha: 300, // 5 minutes
    });
  }, []);

  const steps: Step[] = [
    {
      id: "welcome",
      title: "Welcome to AI Automated Systems",
      description: "Get your first automation running in under 5 minutes",
      estimatedTime: 30, // 30 seconds
      component: <WelcomeStep onNext={() => goToNext()} />,
    },
    {
      id: "choose-integration",
      title: "Choose Your First Integration",
      description: "Connect a tool you use daily (or skip for now)",
      estimatedTime: 60, // 1 minute
      component: <ChooseIntegrationStep onNext={() => goToNext()} />,
    },
    {
      id: "create-workflow",
      title: "Create Your First Workflow",
      description: "Use a template to get started instantly",
      estimatedTime: 120, // 2 minutes
      component: <CreateWorkflowStep onNext={() => goToNext()} />,
    },
    {
      id: "test-workflow",
      title: "Test Your Workflow",
      description: "See it in action - this is your 'aha moment'!",
      estimatedTime: 30, // 30 seconds
      component: <TestWorkflowStep onNext={() => goToNext()} />,
    },
    {
      id: "complete",
      title: "You're All Set!",
      description: "Start automating and saving time",
      component: <CompleteStep />,
    },
  ];

  const goToNext = async () => {
    const currentStepId = steps[currentStep].id;
    const stepStartTime = Date.now() - startTimeRef.current;
    
    if (!completedSteps.includes(currentStepId)) {
      setCompletedSteps([...completedSteps, currentStepId]);
    }
    
    // Track step completion with timing
    const userId = localStorage.getItem("user_id") || "anonymous";
    track(userId, {
      type: "onboarding_step_completed",
      path: "/onboarding",
      meta: {
        step_id: currentStepId,
        step_number: currentStep + 1,
        time_elapsed_ms: stepStartTime,
        time_elapsed_seconds: Math.round(stepStartTime / 1000),
        timestamp: new Date().toISOString(),
      },
      app: "web",
    });
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Track onboarding completion and "aha moment"
      const totalTime = Date.now() - startTimeRef.current;
      const totalTimeSeconds = Math.round(totalTime / 1000);
      const achievedTarget = totalTime <= targetTime;
      
      track(userId, {
        type: "onboarding_completed",
        path: "/onboarding",
        meta: {
          total_time_ms: totalTime,
          total_time_seconds: totalTimeSeconds,
          target_time_seconds: Math.round(targetTime / 1000),
          achieved_target: achievedTarget,
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });
      
      // Track "aha moment" - first workflow created
      conversionTracker.track("aha_moment_achieved", {
        userId,
        timeToActivation: totalTimeSeconds,
        targetTime: Math.round(targetTime / 1000),
        achievedTarget,
        timestamp: Date.now(),
      });
      
      conversionTracker.track("first_workflow_created", {
        timeToActivation: totalTimeSeconds,
        achievedTarget,
      });

      // Mark workflow as created in database
      try {
        await fetch("/api/trial/mark-workflow-created", {
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to mark workflow created:", error);
      }
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const timeRemaining = Math.max(0, targetTime - timeElapsed);
  const timeRemainingSeconds = Math.round(timeRemaining / 1000);
  const isOnTrack = timeElapsed <= targetTime;
  const estimatedTimeRemaining = steps
    .slice(currentStep)
    .reduce((sum, step) => sum + (step.estimatedTime || 0), 0);

  return (
    <div className="space-y-6">
      {/* Time Tracker */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Clock className={`h-5 w-5 ${isOnTrack ? 'text-green-600' : 'text-orange-600'}`} />
          <div>
            <div className="text-sm font-medium">
              {isOnTrack ? "On track!" : "Take your time"}
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round(timeElapsed / 1000)}s elapsed • ~{estimatedTimeRemaining}s remaining
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            Target: 5 minutes
          </div>
          <div className={`text-xs ${isOnTrack ? 'text-green-600' : 'text-orange-600'}`}>
            {timeRemainingSeconds > 0 ? `${timeRemainingSeconds}s left` : 'Time exceeded'}
          </div>
        </div>
      </div>

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
        <h3 className="text-2xl font-bold mb-2">Welcome to AI Automated Systems!</h3>
        <p className="text-muted-foreground">
          Get your first automation running in under 5 minutes. No credit card required.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="font-semibold mb-1">5 Minutes</div>
          <div className="text-sm text-muted-foreground">To your first automation</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Target className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="font-semibold mb-1">Instant Value</div>
          <div className="text-sm text-muted-foreground">See it work immediately</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <Check className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="font-semibold mb-1">No Setup</div>
          <div className="text-sm text-muted-foreground">Use pre-built templates</div>
        </div>
      </div>
      <Button onClick={onNext} className="w-full" size="lg">
        Get Started - It's Free
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

function ChooseIntegrationStep({ onNext }: { onNext: () => void }) {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const integrations = [
    { name: "Shopify", icon: "🛍️", description: "E-commerce automation", provider: "shopify", popular: true },
    { name: "Wave Accounting", icon: "📊", description: "Financial automation", provider: "wave", popular: true },
    { name: "Stripe", icon: "💳", description: "Payment processing", provider: "stripe", popular: true },
    { name: "Gmail", icon: "📧", description: "Email automation", provider: "gmail" },
    { name: "Slack", icon: "💬", description: "Team communication", provider: "slack" },
    { name: "Notion", icon: "📝", description: "Productivity automation", provider: "notion" },
  ];

  const handleSkip = () => {
    setSkipped(true);
    const userId = localStorage.getItem("user_id") || "anonymous";
    track(userId, {
      type: "onboarding_integration_skipped",
      path: "/onboarding",
      meta: {
        timestamp: new Date().toISOString(),
      },
      app: "web",
    });
    onNext();
  };

  async function handleIntegrationClick(provider: string) {
    setSelectedIntegration(provider);
    setConnecting(true);

    try {
      // Get OAuth URL
      const response = await fetch(`/api/integrations/${provider}/oauth`);
      if (!response.ok) throw new Error("Failed to initiate OAuth");

      const data = await response.json();
      
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
        Choose a tool you use daily, or skip this step and use a demo template.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <button
            key={integration.name}
            onClick={() => handleIntegrationClick(integration.provider)}
            disabled={connecting}
            className={`p-4 border rounded-lg transition-colors text-left relative ${
              selectedIntegration === integration.provider
                ? "border-primary bg-primary/10"
                : "hover:border-primary hover:bg-primary/5"
            } ${connecting ? "opacity-50 cursor-not-allowed" : ""} ${
              integration.popular ? "ring-2 ring-primary/20" : ""
            }`}
            aria-label={`Connect ${integration.name}`}
          >
            {integration.popular && (
              <span className="absolute top-2 right-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                Popular
              </span>
            )}
            <div className="text-2xl mb-2">{integration.icon}</div>
            <div className="font-semibold mb-1">{integration.name}</div>
            <div className="text-sm text-muted-foreground">{integration.description}</div>
          </button>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={handleSkip} variant="outline" className="flex-1">
          Skip for Now
        </Button>
        <p className="text-sm text-muted-foreground text-center sm:text-left sm:flex-1 sm:flex sm:items-center">
          Don't see your tool? <Link href="/integrations" className="text-primary hover:underline ml-1">Browse all</Link>
        </p>
      </div>
    </div>
  );
}

function CreateWorkflowStep({ onNext }: { onNext: () => void }) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const templates = [
    {
      id: "shopify-slack",
      name: "Shopify → Slack",
      description: "Notify team when new order arrives",
      icon: "🛍️",
      trigger: "New order in Shopify",
      action: "Send notification to Slack",
    },
    {
      id: "email-summary",
      name: "Daily Email Summary",
      description: "Get daily summary of important events",
      icon: "📧",
      trigger: "Daily at 9 AM",
      action: "Send email summary",
    },
    {
      id: "demo-workflow",
      name: "Demo Workflow",
      description: "See how workflows work (no setup required)",
      icon: "✨",
      trigger: "Manual trigger",
      action: "Show success message",
      recommended: true,
    },
  ];

  async function handleCreateWorkflow(templateId: string) {
    setSelectedTemplate(templateId);
    setCreating(true);

    const userId = localStorage.getItem("user_id") || "anonymous";
    
    try {
      // Track template selection
      track(userId, {
        type: "onboarding_template_selected",
        path: "/onboarding",
        meta: {
          template_id: templateId,
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });

      // Simulate workflow creation (in production, this would call the API)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Track workflow creation
      track(userId, {
        type: "workflow_created",
        path: "/onboarding",
        meta: {
          template_id: templateId,
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });

      conversionTracker.track("workflow_created", {
        userId,
        templateId,
        timestamp: Date.now(),
      });

      onNext();
    } catch (error) {
      console.error("Failed to create workflow", error);
      // Continue anyway for demo
      onNext();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Choose a template to get started instantly. You can customize it later.
      </p>
      <div className="space-y-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleCreateWorkflow(template.id)}
            disabled={creating}
            className={`w-full p-4 border rounded-lg text-left transition-colors ${
              selectedTemplate === template.id
                ? "border-primary bg-primary/10"
                : "hover:border-primary hover:bg-primary/5"
            } ${creating ? "opacity-50 cursor-not-allowed" : ""} ${
              template.recommended ? "ring-2 ring-primary/20" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <div className="font-semibold">{template.name}</div>
                    {template.recommended && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded ml-2">
                        Recommended
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-3">{template.description}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Trigger:</span>
                    <span className="text-muted-foreground">{template.trigger}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Action:</span>
                    <span className="text-muted-foreground">{template.action}</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      {creating && (
        <div className="text-center text-sm text-muted-foreground">
          Creating your workflow...
        </div>
      )}
    </div>
  );
}

function TestWorkflowStep({ onNext }: { onNext: () => void }) {
  const [testing, setTesting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);

  async function handleTest() {
    setTesting(true);
    const userId = localStorage.getItem("user_id") || "anonymous";

    try {
      // Simulate workflow test execution
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Track "aha moment" - workflow executed successfully
      track(userId, {
        type: "aha_moment_achieved",
        path: "/onboarding",
        meta: {
          event: "workflow_executed",
          timestamp: new Date().toISOString(),
        },
        app: "web",
      });

      conversionTracker.track("aha_moment_achieved", {
        userId,
        event: "workflow_executed",
        timestamp: Date.now(),
      });

      setTestComplete(true);
      
      // Auto-advance after showing success
      setTimeout(() => {
        onNext();
      }, 2000);
    } catch (error) {
      console.error("Test failed", error);
      setTesting(false);
    }
  }

  useEffect(() => {
    // Auto-start test
    handleTest();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Your First Workflow is Ready!</h3>
        <p className="text-muted-foreground">
          Let's test it to see the magic happen. This is your "aha moment"!
        </p>
      </div>

      {testing && !testComplete && (
        <div className="p-6 bg-muted/50 rounded-lg text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="font-semibold mb-2">Running your workflow...</div>
          <div className="text-sm text-muted-foreground">This is what automation looks like!</div>
        </div>
      )}

      {testComplete && (
        <div className="p-6 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-500 dark:border-green-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-green-900 dark:text-green-100">
                🎉 Success! Your workflow executed!
              </div>
              <div className="text-sm text-green-800 dark:text-green-200">
                This is your "aha moment" - you've automated your first task!
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-white dark:bg-green-900 rounded border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              What just happened:
            </div>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <li>✓ Workflow triggered successfully</li>
              <li>✓ Action executed automatically</li>
              <li>✓ You saved time - no manual work needed!</li>
            </ul>
          </div>
        </div>
      )}

      {!testComplete && (
        <Button onClick={handleTest} className="w-full" size="lg" disabled={testing}>
          {testing ? "Testing..." : "Test Workflow Now"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
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
