"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { AIAssistant } from "./AIAssistant";
import type { FAQSection } from "@/lib/content/schemas";

interface ContentStudioFAQProps {
  content: FAQSection;
  onChange: (faq: FAQSection) => void;
  token: string;
}

export function ContentStudioFAQ({
  content,
  onChange,
  token,
}: ContentStudioFAQProps) {
  const updateField = <K extends keyof FAQSection>(
    key: K,
    value: FAQSection[K]
  ) => {
    onChange({ ...content, [key]: value });
  };

  const updateCategory = (categoryIndex: number, field: string, value: any) => {
    const newCategories = [...content.categories];
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      [field]: value,
    };
    updateField("categories", newCategories);
  };

  const updateQuestion = (
    categoryIndex: number,
    questionIndex: number,
    field: string,
    value: any
  ) => {
    const newCategories = [...content.categories];
    const questions = [...newCategories[categoryIndex].questions];
    questions[questionIndex] = { ...questions[questionIndex], [field]: value };
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      questions,
    };
    updateField("categories", newCategories);
  };

  const addCategory = () => {
    updateField("categories", [
      ...content.categories,
      {
        category: "New Category",
        questions: [
          {
            question: "Question?",
            answer: "Answer.",
          },
        ],
      },
    ]);
  };

  const addQuestion = (categoryIndex: number) => {
    const newCategories = [...content.categories];
    newCategories[categoryIndex].questions.push({
      question: "New Question?",
      answer: "New Answer.",
    });
    updateField("categories", newCategories);
  };

  const removeCategory = (categoryIndex: number) => {
    updateField(
      "categories",
      content.categories.filter((_, i) => i !== categoryIndex)
    );
  };

  const removeQuestion = (categoryIndex: number, questionIndex: number) => {
    const newCategories = [...content.categories];
    newCategories[categoryIndex].questions = newCategories[
      categoryIndex
    ].questions.filter((_, i) => i !== questionIndex);
    updateField("categories", newCategories);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>FAQ Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="faq-title">Section Title (optional)</Label>
          <Input
            id="faq-title"
            value={content.sectionTitle || ""}
            onChange={(e) =>
              updateField("sectionTitle", e.target.value || undefined)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="faq-subtitle">Section Subtitle (optional)</Label>
          <Textarea
            id="faq-subtitle"
            value={content.sectionSubtitle || ""}
            onChange={(e) =>
              updateField("sectionSubtitle", e.target.value || undefined)
            }
            rows={2}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>FAQ Categories</Label>
            <Button type="button" size="sm" onClick={addCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>

          {content.categories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Input
                    value={category.category}
                    onChange={(e) =>
                      updateCategory(categoryIndex, "category", e.target.value)
                    }
                    className="font-semibold"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCategory(categoryIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Questions</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addQuestion(categoryIndex)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                  </div>

                  {category.questions.map((faq, questionIndex) => (
                    <Card key={questionIndex} className="p-3 bg-muted/50">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Q{questionIndex + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeQuestion(categoryIndex, questionIndex)
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Question"
                          value={faq.question}
                          onChange={(e) =>
                            updateQuestion(
                              categoryIndex,
                              questionIndex,
                              "question",
                              e.target.value
                            )
                          }
                        />
                        <RichTextEditor
                          value={faq.answer}
                          onChange={(value) =>
                            updateQuestion(
                              categoryIndex,
                              questionIndex,
                              "answer",
                              value
                            )
                          }
                          placeholder="Answer"
                          rows={3}
                        />
                        <AIAssistant
                          type="faq-answer"
                          currentContent={faq.answer}
                          context={`FAQ question: ${faq.question}`}
                          onGenerate={(generated) =>
                            updateQuestion(
                              categoryIndex,
                              questionIndex,
                              "answer",
                              generated
                            )
                          }
                          token={token}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
