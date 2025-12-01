"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { submitPositioningFeedback } from "@/lib/actions/positioning-actions";
import { Loader2, Sparkles } from "lucide-react";

/**
 * Positioning Feedback Form Component
 * 
 * Client Component for submitting positioning clarity feedback.
 * Uses Server Action for data mutation.
 */

type FeedbackType =
  | "value_proposition"
  | "target_persona"
  | "pain_point"
  | "solution_clarity"
  | "messaging"
  | "feature_request"
  | "general";

interface PositioningFeedbackFormProps {
  userId: string;
}

export function PositioningFeedbackForm({ userId }: PositioningFeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("general");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedbackText.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide your feedback before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitPositioningFeedback(
        userId,
        feedbackType,
        feedbackText.trim()
      );

      if (result.success && result.data) {
        toast({
          title: "Feedback Submitted!",
          description: result.data.message,
          variant: "default",
        });

        // Reset form
        setFeedbackText("");
        setFeedbackType("general");
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Positioning Clarity Input
        </CardTitle>
        <CardDescription>
          Help us refine our positioning. Your feedback directly impacts our clarity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-type">Feedback Type</Label>
            <Select
              value={feedbackType}
              onValueChange={(value) => setFeedbackType(value as FeedbackType)}
            >
              <SelectTrigger id="feedback-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value_proposition">Value Proposition</SelectItem>
                <SelectItem value="target_persona">Target Persona</SelectItem>
                <SelectItem value="pain_point">Pain Point</SelectItem>
                <SelectItem value="solution_clarity">Solution Clarity</SelectItem>
                <SelectItem value="messaging">Messaging</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="general">General Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-text">Your Feedback</Label>
            <Textarea
              id="feedback-text"
              placeholder="Share your thoughts on our positioning, messaging, or how we can better serve your needs..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              More detailed feedback earns higher impact scores and helps us improve faster.
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
