"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { track } from "@/lib/telemetry/track";

interface PreTestAnswers {
  goals: string;
  industry: string;
  listSize?: string;
  emailFrequency?: string;
  contentTypes: string[];
  painPoints: string[];
}

interface PreTestQuestionnaireProps {
  onComplete: (answers: PreTestAnswers) => void;
  onSkip?: () => void;
  canDismiss?: boolean;
}

const GOALS = [
  { value: "save-time", label: "Save time on repetitive tasks" },
  { value: "email-performance", label: "Improve email campaign performance" },
  { value: "automate-processes", label: "Automate business processes" },
  { value: "learn-automation", label: "Learn AI automation" },
  { value: "other", label: "Other" },
];

const INDUSTRIES = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "saas", label: "SaaS" },
  { value: "agency", label: "Agency" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

const LIST_SIZES = [
  { value: "under-1k", label: "Under 1,000" },
  { value: "1k-10k", label: "1,000 - 10,000" },
  { value: "10k-50k", label: "10,000 - 50,000" },
  { value: "50k-plus", label: "50,000+" },
  { value: "not-applicable", label: "Not applicable" },
];

const EMAIL_FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "irregular", label: "Irregular" },
  { value: "not-applicable", label: "Not applicable" },
];

const CONTENT_TYPES = [
  { value: "newsletters", label: "Newsletters" },
  { value: "promotional", label: "Promotional emails" },
  { value: "transactional", label: "Transaction emails" },
  { value: "drip-campaigns", label: "Drip campaigns" },
  { value: "other", label: "Other" },
];

const PAIN_POINTS = [
  { value: "too-much-manual-work", label: "Too much manual work" },
  { value: "low-email-engagement", label: "Low email engagement" },
  { value: "poor-campaign-insights", label: "Poor campaign insights" },
  { value: "time-consuming-workflows", label: "Time-consuming workflows" },
  { value: "lack-of-automation", label: "Lack of automation" },
];

export function PreTestQuestionnaire({ onComplete, onSkip, canDismiss = false }: PreTestQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<PreTestAnswers>>({});

  const steps = [
    {
      id: "goals",
      title: "What's your main goal?",
      description: "Help us personalize your experience",
      required: true,
    },
    {
      id: "industry",
      title: "What industry are you in?",
      description: "We'll show you relevant examples",
      required: true,
    },
    {
      id: "email-info",
      title: "Tell us about your email marketing",
      description: "Optional - helps us personalize insights",
      required: false,
    },
    {
      id: "pain-points",
      title: "What are your biggest challenges?",
      description: "Select all that apply",
      required: false,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const userId = localStorage.getItem("user_id") || "anonymous";
    
    track(userId, {
      type: "pretest_completed",
      path: window.location.pathname,
      meta: {
        answers,
        timestamp: new Date().toISOString(),
      },
      app: "web",
    });

    // Save to database
    try {
      const response = await fetch("/api/trial/pretest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        // Also save to localStorage as fallback
        localStorage.setItem("pretest_answers", JSON.stringify(answers));
        localStorage.setItem("pretest_completed", "true");
      }
    } catch (error) {
      console.error("Failed to save pretest answers:", error);
      // Still save to localStorage as fallback
      localStorage.setItem("pretest_answers", JSON.stringify(answers));
      localStorage.setItem("pretest_completed", "true");
    }

    onComplete(answers as PreTestAnswers);
  };

  const handleSkip = () => {
    const userId = localStorage.getItem("user_id") || "anonymous";
    
    track(userId, {
      type: "pretest_skipped",
      path: window.location.pathname,
      meta: {
        step: currentStep,
        timestamp: new Date().toISOString(),
      },
      app: "web",
    });

    if (onSkip) {
      onSkip();
    }
  };

  const canProceed = () => {
    const step = steps[currentStep];
    if (step.id === "goals") {
      return !!answers.goals;
    }
    if (step.id === "industry") {
      return !!answers.industry;
    }
    return true; // Optional steps
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="border-2 border-primary/30 shadow-xl max-w-2xl mx-auto">
      {canDismiss && (
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="h-8 w-8"
            aria-label="Close questionnaire"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Personalize Your Experience</CardTitle>
        </div>
        <CardDescription>
          {steps[currentStep].description}
        </CardDescription>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Goals */}
        {currentStep === 0 && (
          <RadioGroup
            value={answers.goals || ""}
            onValueChange={(value) => setAnswers({ ...answers, goals: value })}
          >
            <div className="space-y-3">
              {GOALS.map((goal) => (
                <div key={goal.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={goal.value} id={goal.value} />
                  <Label htmlFor={goal.value} className="cursor-pointer flex-1">
                    {goal.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {/* Step 2: Industry */}
        {currentStep === 1 && (
          <RadioGroup
            value={answers.industry || ""}
            onValueChange={(value) => setAnswers({ ...answers, industry: value })}
          >
            <div className="space-y-3">
              {INDUSTRIES.map((industry) => (
                <div key={industry.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={industry.value} id={industry.value} />
                  <Label htmlFor={industry.value} className="cursor-pointer flex-1">
                    {industry.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {/* Step 3: Email Info */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Email list size
              </Label>
              <RadioGroup
                value={answers.listSize || ""}
                onValueChange={(value) => setAnswers({ ...answers, listSize: value })}
              >
                <div className="space-y-2">
                  {LIST_SIZES.map((size) => (
                    <div key={size.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={size.value} id={size.value} />
                      <Label htmlFor={size.value} className="cursor-pointer flex-1 text-sm">
                        {size.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Email frequency
              </Label>
              <RadioGroup
                value={answers.emailFrequency || ""}
                onValueChange={(value) => setAnswers({ ...answers, emailFrequency: value })}
              >
                <div className="space-y-2">
                  {EMAIL_FREQUENCIES.map((freq) => (
                    <div key={freq.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={freq.value} id={freq.value} />
                      <Label htmlFor={freq.value} className="cursor-pointer flex-1 text-sm">
                        {freq.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Content types (select all that apply)
              </Label>
              <div className="space-y-2">
                {CONTENT_TYPES.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.value}
                      checked={(answers.contentTypes || []).includes(type.value)}
                      onCheckedChange={(checked) => {
                        const current = answers.contentTypes || [];
                        if (checked) {
                          setAnswers({ ...answers, contentTypes: [...current, type.value] });
                        } else {
                          setAnswers({ ...answers, contentTypes: current.filter((t) => t !== type.value) });
                        }
                      }}
                    />
                    <Label htmlFor={type.value} className="cursor-pointer flex-1 text-sm">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Pain Points */}
        {currentStep === 3 && (
          <div className="space-y-2">
            {PAIN_POINTS.map((point) => (
              <div key={point.value} className="flex items-center space-x-2">
                <Checkbox
                  id={point.value}
                  checked={(answers.painPoints || []).includes(point.value)}
                  onCheckedChange={(checked) => {
                    const current = answers.painPoints || [];
                    if (checked) {
                      setAnswers({ ...answers, painPoints: [...current, point.value] });
                    } else {
                      setAnswers({ ...answers, painPoints: current.filter((p) => p !== point.value) });
                    }
                  }}
                />
                <Label htmlFor={point.value} className="cursor-pointer flex-1">
                  {point.label}
                </Label>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Previous
              </Button>
            )}
            {onSkip && currentStep === 0 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {onSkip && currentStep > 0 && (
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext} disabled={!canProceed()}>
              {currentStep === steps.length - 1 ? "Complete" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
