"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { heroTemplates, featureTemplates } from "@/lib/content/templates";
import type { AIASContent, SettlerContent } from "@/lib/content/schemas";

interface ContentTemplatesProps {
  content: AIASContent | SettlerContent;
  onChange: (content: AIASContent | SettlerContent) => void;
}

export function ContentTemplates({ content, onChange }: ContentTemplatesProps) {
  const applyHeroTemplate = (templateType: "saas" | "enterprise" | "startup") => {
    const template = heroTemplates[templateType];
    onChange({
      ...content,
      hero: {
        ...content.hero,
        title: template.title,
        subtitle: template.subtitle,
        description: template.description,
        badgeText: template.badgeText,
      },
    });
  };

  const applyFeatureTemplate = (templateType: "saas" | "enterprise") => {
    const template = featureTemplates[templateType];
    if ("features" in content) {
      onChange({
        ...content,
        features: {
          ...content.features,
          items: template.map((item) => ({
            title: item.title,
            description: item.description,
            icon: item.icon,
            highlight: item.highlight || false,
          })),
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Content Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Hero Template</Label>
          <div className="flex gap-2">
            <Select onValueChange={applyHeroTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose hero template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saas">SaaS Platform</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => applyHeroTemplate("saas")}
            >
              Apply SaaS
            </Button>
            <Button
              variant="outline"
              onClick={() => applyHeroTemplate("enterprise")}
            >
              Apply Enterprise
            </Button>
          </div>
        </div>

        {"features" in content && (
          <div className="space-y-2">
            <Label>Feature Template</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => applyFeatureTemplate("saas")}
              >
                Apply SaaS Features
              </Button>
              <Button
                variant="outline"
                onClick={() => applyFeatureTemplate("enterprise")}
              >
                Apply Enterprise Features
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Templates provide quick starting points. You can customize everything after applying.
        </p>
      </CardContent>
    </Card>
  );
}
