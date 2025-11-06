"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PremiumContentGateProps {
  title?: string;
  description?: string;
  preview?: string;
  unlockPrice?: number;
}

export function PremiumContentGate({
  title = "Premium Content",
  description = "This content is available for premium subscribers",
  preview,
  unlockPrice = 9,
}: PremiumContentGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  // TODO: Check if user is premium subscriber

  if (isUnlocked) {
    return null; // Show full content
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔒 Premium Content
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg mb-4">
          <p className="text-sm font-semibold mb-1">🧠 Systems Thinking Premium Content</p>
          <p className="text-xs text-muted-foreground">
            This content goes deeper into systems thinking frameworks, multi-perspective analysis, 
            and advanced methodologies that help you apply systems thinking to real-world challenges.
          </p>
        </div>
        {preview && (
          <div className="prose prose-sm dark:prose-invert max-w-none opacity-60 blur-sm pointer-events-none">
            {preview}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/pricing">Unlock Systems Thinking Premium (${unlockPrice}/month)</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/premium">View Premium Frameworks</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Premium subscribers get exclusive access to advanced systems thinking frameworks, 
          detailed case studies, and the tools that make systems thinking THE critical skill for the AI age.
        </p>
      </CardContent>
    </Card>
  );
}
