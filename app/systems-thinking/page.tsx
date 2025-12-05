import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, ArrowRight, Brain, Target, Zap, Users, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Systems Thinking: The Critical Skill for the AI Age | AIAS Platform",
  description: "Learn why systems thinking is THE critical skill needed more than ever in the AI age. Discover the 6-perspective framework and how it creates optimal outcomes.",
  keywords: [
    "systems thinking",
    "systems thinking framework",
    "holistic problem solving",
    "6-perspective analysis",
    "systems thinking AI",
    "systems thinking business",
    "root cause analysis",
    "multi-perspective thinking",
  ],
};

export default function SystemsThinkingPage() {
  return (
    <div className="container py-12 md:py-16 px-4">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
          <Brain className="h-4 w-4" />
          <span>Content Pillar: Systems Thinking</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Systems Thinking: The Critical Skill for the AI Age
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          While AI handles execution, systems thinking creates strategy. It's what makes you stand out in the job market, succeed in business, and achieve optimal outcomes.
        </p>
      </div>

      {/* Key Message */}
      <Card className="mb-12 max-w-4xl mx-auto border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <Brain className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">The AI Paradox</h2>
              <p className="text-lg mb-4">
                The more AI advances, the more systems thinking is needed.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>AI eliminates routine</strong> → Systems thinking becomes essential</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>AI handles data</strong> → Systems thinking interprets meaning</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>AI automates tasks</strong> → Systems thinking designs solutions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>AI scales execution</strong> → Systems thinking creates strategy</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6-Perspective Framework */}
      <div className="max-w-6xl mx-auto mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          The 6-Perspective Analysis Framework
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Every challenge is analyzed through six perspectives to find optimal solutions that work holistically, not just for one task.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Target, title: "Process", description: "How things work, workflows, and procedures" },
            { icon: Zap, title: "Technology", description: "What tools are used, infrastructure, and systems" },
            { icon: Users, title: "People", description: "Who is involved, roles, and relationships" },
            { icon: TrendingUp, title: "Data", description: "What information flows, metrics, and insights" },
            { icon: Brain, title: "Systems", description: "How everything connects, dependencies, and interactions" },
            { icon: Zap, title: "Automation", description: "Where AI can help, opportunities, and implementation" },
          ].map((perspective, index) => {
            const Icon = perspective.icon;
            return (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{perspective.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{perspective.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Why It Matters */}
      <div className="max-w-4xl mx-auto mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">What This Means for You</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Job Market Advantage</h3>
              <p className="text-muted-foreground">
                Systems thinking is uniquely human and irreplaceable. Combined with AI, it's your competitive advantage. 
                Employers value professionals who can see the big picture and design holistic solutions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Business Success</h3>
              <p className="text-muted-foreground">
                Systems thinking drives sustainable success. It's what separates successful businesses from those that struggle. 
                By analyzing problems from multiple perspectives, you find solutions that work long-term.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Optimal Outcomes</h3>
              <p className="text-muted-foreground">
                Systems thinking reveals solutions that point solutions cannot. It finds leverage points for sustainable change 
                and ensures your automations work together, not in isolation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How AIAS Combines Both */}
      <div className="max-w-4xl mx-auto mb-12">
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="text-2xl">How AIAS Platform Combines Both</CardTitle>
            <CardDescription>
              AIAS Platform doesn't just automate tasks. We apply systems thinking to analyze problems from 6 perspectives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This multi-dimensional analysis reveals optimal solutions that automation alone cannot achieve. 
              AI handles execution. Systems thinking ensures optimal direction.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>6-Perspective Analysis:</strong> Every challenge analyzed through process, technology, people, data, systems, AND automation</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Root Cause Identification:</strong> Find underlying causes, not symptoms</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Holistic Solution Design:</strong> Design integrated solutions that work together</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>AI-Powered Execution:</strong> AI handles execution, systems thinking creates strategy</span>
              </li>
            </ul>
            <Button asChild size="lg">
              <Link href="/signup">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto text-center">
        <Card className="bg-primary/5">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Apply Systems Thinking?</h2>
            <p className="text-muted-foreground mb-6">
              Start your free trial and see how systems thinking + AI automation creates unstoppable results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/case-studies">See Case Studies</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
