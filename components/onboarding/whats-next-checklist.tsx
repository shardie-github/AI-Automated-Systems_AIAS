"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface ChecklistItem {
  id: string;
  label: string;
  href: string;
  completed: boolean;
}

export function WhatsNextChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "connect-integration",
      label: "Connect your first integration (Shopify, Wave, etc.)",
      href: "/integrations",
      completed: false,
    },
    {
      id: "create-workflow",
      label: "Create your first workflow",
      href: "/workflows?create=true",
      completed: false,
    },
    {
      id: "test-workflow",
      label: "Test your workflow",
      href: "/workflows",
      completed: false,
    },
    {
      id: "explore-templates",
      label: "Explore workflow templates",
      href: "/templates",
      completed: false,
    },
    {
      id: "view-analytics",
      label: "Check your automation analytics",
      href: "/dashboard/analytics",
      completed: false,
    },
  ]);

  useEffect(() => {
    // Load completed items from localStorage
    const completed = JSON.parse(localStorage.getItem("onboarding-checklist") || "{}");
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        completed: completed[item.id] || false,
      }))
    );
  }, []);

  const handleToggle = (id: string) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      const completed = updated.reduce(
        (acc, item) => ({ ...acc, [item.id]: item.completed }),
        {} as Record<string, boolean>
      );
      localStorage.setItem("onboarding-checklist", JSON.stringify(completed));
      return updated;
    });
  };

  const completedCount = items.filter((item) => item.completed).length;
  const allCompleted = completedCount === items.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>What's Next?</CardTitle>
        <CardDescription>
          Complete these steps to get the most out of AIAS Platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => handleToggle(item.id)}
                className="h-5 w-5"
              />
              <label
                className={`flex-1 cursor-pointer ${
                  item.completed ? "line-through text-muted-foreground" : ""
                }`}
                onClick={() => handleToggle(item.id)}
              >
                {item.label}
              </label>
              {!item.completed && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={item.href}>
                    Go
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              )}
              {item.completed && (
                <Check className="h-5 w-5 text-green-600" />
              )}
            </div>
          ))}
        </div>
        {allCompleted && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              🎉 You've completed all steps! You're ready to automate your business.
            </p>
          </div>
        )}
        <div className="mt-4 text-sm text-muted-foreground text-center">
          {completedCount} of {items.length} completed
        </div>
      </CardContent>
    </Card>
  );
}
