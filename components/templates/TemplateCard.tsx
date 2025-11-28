"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  requiredIntegrations: string[];
  estimatedTimeMinutes: number;
  difficulty: "easy" | "medium" | "advanced";
}

interface TemplateCardProps {
  template: WorkflowTemplate;
  onSelect?: (template: WorkflowTemplate) => void;
  selected?: boolean;
}

export function TemplateCard({ template, onSelect, selected }: TemplateCardProps) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onSelect?.(template)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{template.icon}</div>
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="mt-1">{template.description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className={difficultyColors[template.difficulty]}>
            {template.difficulty}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {template.estimatedTimeMinutes} min
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Required Integrations:</div>
          <div className="flex flex-wrap gap-2">
            {template.requiredIntegrations.map((integration) => (
              <Badge key={integration} variant="secondary" className="text-xs">
                {integration}
              </Badge>
            ))}
          </div>
        </div>

        {onSelect && (
          <Button className="w-full mt-4" variant={selected ? "default" : "outline"}>
            {selected ? "Selected" : "Select Template"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
