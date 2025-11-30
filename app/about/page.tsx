import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TextReveal } from "@/components/ui/TextReveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";
import { ParallaxBackground } from "@/components/ui/ParallaxBackground";

export const metadata: Metadata = {
  title: "About — AIAS Platform | Made in Canada",
  description: "AIAS Platform is built for Canadian businesses. Learn about our mission to make AI automation accessible to Canadian SMBs and solo operators.",
};

export default function AboutPage() {
  return (
    <ParallaxBackground className="container py-16">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center">
          <TextReveal
            as="h1"
            className="text-4xl md:text-5xl font-bold mb-4 block"
            delay={0.1}
            staggerDelay={0.03}
          >
            About AIAS Platform
          </TextReveal>
          <p className="text-lg text-muted-foreground">
            Systems thinking + AI automation. The critical skill for the AI age. Built in Canada, serving the world. 🇨🇦 🌍
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            🧠 Systems Thinking: The Critical Skill for the AI Age
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-4">Our Mission: Systems Thinking for the AI Age</h2>
          <div className="bg-primary/10 p-6 rounded-lg mb-4">
            <p className="font-semibold text-lg mb-2">
              Systems thinking is THE critical skill needed more than ever in the AI age.
            </p>
            <p className="text-muted-foreground">
              It's what makes you stand out in the job market, succeed in business, and achieve optimal outcomes. 
              AI amplifies systems thinking — it doesn't replace it.
            </p>
          </div>
          <p className="text-muted-foreground mb-4">
            AIAS Platform was founded in Canada with a global vision. Built on years of experience supporting 
            stakeholders across education, healthcare, technology, and business sectors worldwide, we understand 
            that <strong>productivity requires multiple approaches</strong> — not just automation. Systems thinking is 
            the foundation of everything we do.
          </p>
          <p className="text-muted-foreground mb-4">
            Our mission is to develop systems thinking capabilities while making AI automation accessible to businesses everywhere. 
            We believe that <strong>automation alone fails</strong> — but systems thinking combined with AI automation creates 
            unstoppable results. That's why every solution we build analyzes problems from multiple perspectives, finds root causes, 
            and designs holistic solutions.
          </p>
          <p className="text-muted-foreground mb-4">
            With deep roots in education and stakeholder management, we've seen first-hand how <strong>systems thinking</strong> 
            transforms outcomes across industries. Whether you're managing educational programs, healthcare operations, or business 
            processes, systems thinking reveals optimal solutions that automation alone cannot achieve.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Why Systems Thinking + AI = Success</h2>
          <div className="bg-muted/50 p-6 rounded-lg mb-4">
            <h3 className="font-semibold text-lg mb-3">The AI Paradox:</h3>
            <p className="text-muted-foreground mb-3">
              The more AI advances, the more systems thinking is needed. AI can automate tasks, but AI cannot replicate systems thinking.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• AI eliminates routine → Systems thinking becomes essential</li>
              <li>• AI handles data → Systems thinking interprets meaning</li>
              <li>• AI automates tasks → Systems thinking designs solutions</li>
              <li>• AI scales execution → Systems thinking creates strategy</li>
            </ul>
          </div>
          <p className="text-muted-foreground mb-4">
            Our Canadian roots give us a unique perspective on global business needs. We understand the importance of 
            strong privacy laws (PIPEDA), transparent pricing, and reliable service. But more importantly, we understand 
            that <strong>systems thinking is the foundation of success</strong> in the AI age.
          </p>
          <p className="text-muted-foreground mb-4">
            That's why AIAS Platform combines:
          </p>
          <ul className="space-y-2 text-muted-foreground mb-4">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span><strong>Systems Thinking:</strong> THE critical skill for the AI age. Multi-perspective analysis, root cause identification, holistic solutions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span><strong>AI Automation:</strong> Strategic automation that amplifies systems thinking. AI handles execution, systems thinking creates strategy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span><strong>Job Market Advantage:</strong> Systems thinking is what makes you stand out. Career differentiation, higher compensation, job security</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span><strong>Business Success:</strong> Systems thinking drives sustainable success. Competitive advantage, optimal outcomes, market leadership</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span><strong>Global Excellence:</strong> Built in Canada, serving the world. Systems thinking works everywhere, across all markets and cultures</span>
            </li>
          </ul>
        </section>

        <section>
          <TextReveal
            as="h2"
            className="text-2xl font-bold mb-4"
            delay={0.2}
            staggerDelay={0.02}
          >
            Our Values
          </TextReveal>
          <BentoGrid columns={2} className="gap-4">
            <BentoGridItem colSpan={1} rowSpan={1}>
              <SpotlightCard>
                <Card className="border-0 bg-transparent shadow-none h-full">
                  <CardHeader>
                    <CardTitle>Privacy First</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      PIPEDA compliance, Canadian data residency, transparent privacy policies.
                    </p>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </BentoGridItem>
            <BentoGridItem colSpan={1} rowSpan={1}>
              <SpotlightCard>
                <Card className="border-0 bg-transparent shadow-none h-full">
                  <CardHeader>
                    <CardTitle>Multi-Currency Pricing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Starting at $49/month (CAD/USD/EUR) — accessible globally with transparent pricing in your local currency.
                    </p>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </BentoGridItem>
            <BentoGridItem colSpan={1} rowSpan={1}>
              <SpotlightCard>
                <Card className="border-0 bg-transparent shadow-none h-full">
                  <CardHeader>
                    <CardTitle>No-Code First</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Build AI agents without coding. 30-minute setup. Deploy in minutes.
                    </p>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </BentoGridItem>
            <BentoGridItem colSpan={1} rowSpan={1}>
              <SpotlightCard>
                <Card className="border-0 bg-transparent shadow-none h-full">
                  <CardHeader>
                    <CardTitle>Global Perspective</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Built in Canada with global perspective. Serving businesses across 40+ countries with multi-currency and international integrations.
                    </p>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </BentoGridItem>
          </BentoGrid>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Why We Built This</h2>
          <div className="bg-primary/10 p-6 rounded-lg mb-6">
            <p className="text-muted-foreground mb-4">
              AIAS Platform was born from a simple observation: Canadian small businesses are drowning in repetitive tasks 
              that should be automated, but existing solutions are either too expensive ($150-500/month) or too complex 
              to set up.
            </p>
            <p className="text-muted-foreground mb-4">
              We experienced this problem firsthand. Whether running a Shopify store and spending 15 hours/week on 
              manual order processing, or trying to automate workflows with tools that cost $50/month for just 5 
              automations, we knew there had to be a better way.
            </p>
            <p className="text-muted-foreground">
              So we built AIAS Platform—an affordable ($49/month), no-code automation platform built specifically for 
              Canadian SMBs. With native Canadian integrations (Shopify, Wave Accounting, RBC, TD), PIPEDA compliance 
              built-in, and a visual workflow builder that anyone can use, we're making enterprise-grade automation 
              accessible to businesses that need it most.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Scott Hardie</CardTitle>
                <CardDescription>Founder & CEO</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Scott is building AIAS Platform to make automation accessible to Canadian SMBs. Based in Toronto, he combines technical execution with deep understanding of the Canadian market and e-commerce operations.
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Location:</strong> Toronto, Canada</p>
                  <p><strong>Background:</strong> Full-stack developer, e-commerce operator (Hardonia.store), founder of Hardonian Industries. Active open-source contributor with 40+ public repositories.</p>
                  <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/scottrmhardie" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">scottrmhardie</a></p>
                  <p><strong>GitHub:</strong> <a href="https://github.com/shardie-github" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">shardie-github</a></p>
                  <p><strong>Why AIAS:</strong> Experienced firsthand the pain of manual workflows running e-commerce operations. Built AIAS Platform to solve this problem for Canadian SMBs who can't afford expensive enterprise tools.</p>
                </div>
              </CardContent>
            </Card>
            {/* Add more team members as needed */}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:support@aias-platform.com" className="text-primary hover:underline">
                  support@aias-platform.com
                </a>
              </p>
              <p>
                <strong>Sales:</strong>{" "}
                <a href="mailto:sales@aias-platform.com" className="text-primary hover:underline">
                  sales@aias-platform.com
                </a>
              </p>
              <p>
                <strong>Support Hours:</strong> 24/7 global support (primary: Monday-Friday, 9 AM - 5 PM EST)
              </p>
              <p>
                <strong>Global Reach:</strong> Serving clients across North America, Europe, Asia-Pacific, and beyond
              </p>
              <p>
                <strong>Phone:</strong> 1-800-AIAS-HELP (toll-free Canada)
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </ParallaxBackground>
  );
}
