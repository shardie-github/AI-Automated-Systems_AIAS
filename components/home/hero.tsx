"use client";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/motion/fade-in";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative py-20 md:py-32">
      <FadeIn>
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            🧠 Systems Thinking • 🤖 AI-Powered • 🌍 Global Solutions
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Systems Thinking:
            <br />
            <span className="text-primary">The Critical Skill for the AI Age</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            <strong className="text-foreground">Systems thinking is THE skill</strong> needed more than ever in the AI age. 
            It's what makes you <strong className="text-foreground">stand out in the job market</strong>, 
            <strong className="text-foreground"> succeed in business</strong>, and achieve optimal outcomes. 
            We combine systems thinking with AI automation to create solutions that work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-base" asChild>
              <Link href="/genai-content-engine">Try GenAI Content Engine</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link href="/demo">Book Demo</Link>
            </Button>
          </div>
          <div className="pt-6 text-sm text-muted-foreground">
            <p className="mb-2">
              <strong className="text-foreground">AI amplifies systems thinking</strong> — it doesn't replace it. 
              Systems thinking is uniquely human, irreplaceable, and the key to sustainable success.
            </p>
            <p>✅ Multi-dimensional problem-solving • ✅ Root cause analysis • ✅ Holistic solutions • ✅ GenAI Content Engine</p>
            <p className="mt-2">
              <strong className="text-foreground">GenAI Content Engine:</strong> AI-powered blog and article analysis for automated website creation. 
              Systems thinking + GenAI generates optimized websites automatically.
            </p>
            <p className="mt-1">Join <strong className="text-foreground">2,000+ businesses worldwide</strong> using systems thinking + AI for optimal outcomes</p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
