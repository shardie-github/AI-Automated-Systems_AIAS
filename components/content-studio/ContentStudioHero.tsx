"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { RichTextEditor } from "./RichTextEditor";
import { AIAssistant } from "./AIAssistant";
import { DraggableList } from "./DraggableList";
import type { Hero } from "@/lib/content/schemas";

interface ContentStudioHeroProps {
  content: Hero;
  onChange: (hero: Hero) => void;
  token: string;
}

export function ContentStudioHero({
  content,
  onChange,
  token,
}: ContentStudioHeroProps) {
  const updateField = <K extends keyof Hero>(key: K, value: Hero[K]) => {
    onChange({ ...content, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="hero-title">Title</Label>
          <Input
            id="hero-title"
            value={content.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
          <AIAssistant
            type="hero-title"
            currentContent={content.title}
            context="AIAS platform hero section"
            onGenerate={(generated) => updateField("title", generated)}
            token={token}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero-subtitle">Subtitle (optional)</Label>
          <Input
            id="hero-subtitle"
            value={content.subtitle || ""}
            onChange={(e) =>
              updateField("subtitle", e.target.value || undefined)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero-description">Description (optional)</Label>
          <RichTextEditor
            value={content.description || ""}
            onChange={(value) => updateField("description", value || undefined)}
            placeholder="Enter hero description..."
            rows={3}
          />
          <AIAssistant
            type="hero-description"
            currentContent={content.description}
            context="AIAS platform hero section"
            onGenerate={(generated) => updateField("description", generated)}
            token={token}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero-badge">Badge Text (optional)</Label>
          <Input
            id="hero-badge"
            value={content.badgeText || ""}
            onChange={(e) =>
              updateField("badgeText", e.target.value || undefined)
            }
          />
        </div>

        <ImageUpload
          value={content.imageUrl}
          onChange={(url) => updateField("imageUrl", url || undefined)}
          label="Hero Image (optional)"
          token={token}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Primary CTA</Label>
            <div className="space-y-2">
              <Input
                placeholder="Label"
                value={content.primaryCta?.label || ""}
                onChange={(e) =>
                  updateField("primaryCta", {
                    ...content.primaryCta,
                    label: e.target.value,
                    href: content.primaryCta?.href || "/",
                    visible: content.primaryCta?.visible ?? true,
                  })
                }
              />
              <Input
                placeholder="URL"
                value={content.primaryCta?.href || ""}
                onChange={(e) =>
                  updateField("primaryCta", {
                    ...content.primaryCta,
                    label: content.primaryCta?.label || "",
                    href: e.target.value,
                    visible: content.primaryCta?.visible ?? true,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Secondary CTA</Label>
            <div className="space-y-2">
              <Input
                placeholder="Label"
                value={content.secondaryCta?.label || ""}
                onChange={(e) =>
                  updateField("secondaryCta", {
                    ...content.secondaryCta,
                    label: e.target.value,
                    href: content.secondaryCta?.href || "/",
                    visible: content.secondaryCta?.visible ?? true,
                  })
                }
              />
              <Input
                placeholder="URL"
                value={content.secondaryCta?.href || ""}
                onChange={(e) =>
                  updateField("secondaryCta", {
                    ...content.secondaryCta,
                    label: content.secondaryCta?.label || "",
                    href: e.target.value,
                    visible: content.secondaryCta?.visible ?? true,
                  })
                }
              />
            </div>
          </div>
        </div>

        {content.socialProof && content.socialProof.length > 0 && (
          <div className="space-y-4">
            <Label>Social Proof Items</Label>
            <DraggableList
              items={content.socialProof}
              onReorder={(items) => updateField("socialProof", items)}
              onRemove={(index) => {
                const newItems = content.socialProof!.filter((_, i) => i !== index);
                updateField("socialProof", newItems.length > 0 ? newItems : undefined);
              }}
              renderItem={(item, index) => (
                <div className="space-y-2">
                  <Input
                    placeholder="Icon (emoji)"
                    value={item.icon || ""}
                    onChange={(e) => {
                      const newItems = [...content.socialProof!];
                      newItems[index] = { ...item, icon: e.target.value || undefined };
                      updateField("socialProof", newItems);
                    }}
                  />
                  <Input
                    placeholder="Text"
                    value={item.text}
                    onChange={(e) => {
                      const newItems = [...content.socialProof!];
                      newItems[index] = { ...item, text: e.target.value };
                      updateField("socialProof", newItems);
                    }}
                  />
                </div>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                updateField("socialProof", [
                  ...(content.socialProof || []),
                  { text: "New item" },
                ]);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Social Proof Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
