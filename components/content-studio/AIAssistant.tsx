"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Wand2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AIAssistantProps {
  type: "hero-title" | "hero-description" | "feature-description" | "testimonial" | "faq-answer" | "optimize";
  currentContent?: string;
  context?: string;
  onGenerate: (content: string) => void;
  token: string;
}

export function AIAssistant({
  type,
  currentContent,
  context,
  onGenerate,
  token,
}: AIAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [seoAnalyzing, setSeoAnalyzing] = useState(false);
  const [seoSuggestions, setSeoSuggestions] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt for AI generation.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/content/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          type,
          context,
          currentContent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Generation failed");
      }

      const data = await response.json();
      onGenerate(data.content);
      toast({
        title: "Content generated",
        description: "AI has generated new content. Review and apply if you like it.",
      });
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSEOAnalysis = async () => {
    if (!currentContent) {
      toast({
        title: "No content to analyze",
        description: "Please provide content to analyze.",
        variant: "destructive",
      });
      return;
    }

    setSeoAnalyzing(true);
    try {
      const response = await fetch("/api/content/ai/seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: currentContent,
          type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "SEO analysis failed");
      }

      const data = await response.json();
      setSeoSuggestions(data.suggestions);
      toast({
        title: "SEO analysis complete",
        description: "Review the suggestions below.",
      });
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze SEO",
        variant: "destructive",
      });
    } finally {
      setSeoAnalyzing(false);
    }
  };

  const typeLabels: Record<string, string> = {
    "hero-title": "Hero Title",
    "hero-description": "Hero Description",
    "feature-description": "Feature Description",
    testimonial: "Testimonial",
    "faq-answer": "FAQ Answer",
    optimize: "Optimize Content",
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Generate {typeLabels[type]}</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              type === "optimize"
                ? "Describe how you'd like to improve the content..."
                : `Describe what you want for the ${typeLabels[type].toLowerCase()}...`
            }
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="flex-1"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
          {currentContent && (
            <Button
              onClick={handleSEOAnalysis}
              disabled={seoAnalyzing}
              variant="outline"
            >
              {seoAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  SEO
                </>
              )}
            </Button>
          )}
        </div>

        {seoSuggestions && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">SEO Suggestions:</h4>
            <p className="text-sm whitespace-pre-wrap">{seoSuggestions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
