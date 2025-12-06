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
import type { TestimonialSection } from "@/lib/content/schemas";

interface ContentStudioTestimonialsProps {
  content: TestimonialSection;
  onChange: (testimonials: TestimonialSection) => void;
  token: string;
}

export function ContentStudioTestimonials({
  content,
  onChange,
  token,
}: ContentStudioTestimonialsProps) {
  const updateField = <K extends keyof TestimonialSection>(
    key: K,
    value: TestimonialSection[K]
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
        quote: "Testimonial quote",
        author: "Author Name",
        rating: 5,
        hasVideo: false,
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
        <CardTitle>Testimonials Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="testimonials-title">Section Title (optional)</Label>
          <Input
            id="testimonials-title"
            value={content.sectionTitle || ""}
            onChange={(e) =>
              updateField("sectionTitle", e.target.value || undefined)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="testimonials-subtitle">
            Section Subtitle (optional)
          </Label>
          <Textarea
            id="testimonials-subtitle"
            value={content.sectionSubtitle || ""}
            onChange={(e) =>
              updateField("sectionSubtitle", e.target.value || undefined)
            }
            rows={2}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Testimonials (drag to reorder)</Label>
            <Button type="button" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Testimonial
            </Button>
          </div>

          <DraggableList
            items={content.items}
            onReorder={(items) => updateField("items", items)}
            onRemove={removeItem}
            renderItem={(item, index) => (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Quote</Label>
                  <RichTextEditor
                    value={item.quote}
                    onChange={(value) => updateItem(index, "quote", value)}
                    rows={4}
                  />
                  <AIAssistant
                    type="testimonial"
                    currentContent={item.quote}
                    context="Customer testimonial"
                    onGenerate={(generated) => updateItem(index, "quote", generated)}
                    token={token}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Author</Label>
                    <Input
                      value={item.author}
                      onChange={(e) =>
                        updateItem(index, "author", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Role (optional)</Label>
                    <Input
                      value={item.role || ""}
                      onChange={(e) =>
                        updateItem(index, "role", e.target.value || undefined)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company (optional)</Label>
                    <Input
                      value={item.company || ""}
                      onChange={(e) =>
                        updateItem(index, "company", e.target.value || undefined)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rating (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={item.rating}
                      onChange={(e) =>
                        updateItem(index, "rating", parseInt(e.target.value) || 5)
                      }
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
