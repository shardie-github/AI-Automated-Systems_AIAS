"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { DraggableList } from "./DraggableList";
import { RichTextEditor } from "./RichTextEditor";
import { AIAssistant } from "./AIAssistant";
import type { FeatureSection } from "@/lib/content/schemas";

interface ContentStudioFeaturesProps {
  content: FeatureSection;
  onChange: (features: FeatureSection) => void;
  token: string;
}

export function ContentStudioFeatures({
  content,
  onChange,
  token,
}: ContentStudioFeaturesProps) {
  const updateField = <K extends keyof FeatureSection>(
    key: K,
    value: FeatureSection[K]
  ) => {
    onChange({ ...content, [key]: value });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...content.items];
    newItems[index] = { ...newItems[index], [field]: value };
    updateField("items", newItems);
  };

  const addItem = () => {
    updateField("items", [
      ...content.items,
      {
        title: "New Feature",
        description: "Feature description",
        highlight: false,
      },
    ]);
  };

  const removeItem = (index: number) => {
    updateField(
      "items",
      content.items.filter((_, i) => i !== index)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Features Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="features-title">Section Title (optional)</Label>
          <Input
            id="features-title"
            value={content.sectionTitle || ""}
            onChange={(e) =>
              updateField("sectionTitle", e.target.value || undefined)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="features-subtitle">Section Subtitle (optional)</Label>
          <Textarea
            id="features-subtitle"
            value={content.sectionSubtitle || ""}
            onChange={(e) =>
              updateField("sectionSubtitle", e.target.value || undefined)
            }
            rows={2}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Feature Items (drag to reorder)</Label>
            <Button type="button" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>

          <DraggableList
            items={content.items}
            onReorder={(items) => updateField("items", items)}
            onRemove={removeItem}
            renderItem={(item, index) => (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                  />
                  <AIAssistant
                    type="hero-title"
                    currentContent={item.title}
                    context="Feature title"
                    onGenerate={(generated) => updateItem(index, "title", generated)}
                    token={token}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <RichTextEditor
                    value={item.description}
                    onChange={(value) => updateItem(index, "description", value)}
                    rows={3}
                  />
                  <AIAssistant
                    type="feature-description"
                    currentContent={item.description}
                    context="Feature description"
                    onGenerate={(generated) => updateItem(index, "description", generated)}
                    token={token}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Icon (optional)</Label>
                    <Input
                      value={item.icon || ""}
                      onChange={(e) =>
                        updateItem(index, "icon", e.target.value || undefined)
                      }
                      placeholder="sparkles, zap, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gradient (optional)</Label>
                    <Input
                      value={item.gradient || ""}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "gradient",
                          e.target.value || undefined
                        )
                      }
                      placeholder="from-blue-500 to-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
