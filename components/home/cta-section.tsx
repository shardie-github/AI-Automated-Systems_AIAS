"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FadeIn from "@/components/motion/fade-in";

export function CTASection() {
  return (
    <section className="py-20 bg-primary/5">
      <FadeIn>
        <div className="container max-w-4xl mx-auto">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="text-center">
              <div className="text-5xl mb-4">🧠</div>
              <CardTitle className="text-3xl md:text-4xl mb-4">
                Systems Thinking: The Critical Skill for the AI Age
              </CardTitle>
              <CardDescription className="text-lg">
                Systems thinking is THE skill needed more than ever in the AI age. It's what makes you stand out in the job market, 
                succeed in business, and achieve optimal outcomes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">Job Market</div>
                  <p className="text-sm text-muted-foreground">Stand out with systems thinking</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">Business</div>
                  <p className="text-sm text-muted-foreground">Drive success with systems thinking</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">AI Age</div>
                  <p className="text-sm text-muted-foreground">The critical skill for today</p>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-foreground">The Reality:</strong> AI can automate tasks, but AI cannot replicate systems thinking.
                </p>
                <p className="text-sm text-muted-foreground">
                  Systems thinking is uniquely human, irreplaceable, and the key to sustainable success in the AI age.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/systems-thinking">Learn About Systems Thinking</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/demo">Book Consultation</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </section>
  );
}
