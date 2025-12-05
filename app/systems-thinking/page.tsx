import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserPlanData } from "@/lib/trial/user-plan";
import { GatedSystemsThinking } from "@/components/systems-thinking/gated-systems-thinking";

export const metadata: Metadata = {
  title: "Systems Thinking: The Critical Skill for the AI Age | AIAS Platform",
  description: "Systems thinking is THE skill needed more than ever in the AI age. It's what makes you stand out in the job market, succeed in business, and achieve optimal outcomes. Learn how systems thinking works with AI.",
};

export default async function SystemsThinkingPage() {
  // Get user plan from database
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userPlan: "free" | "trial" | "starter" | "pro" = "free";
  if (user) {
    const userData = await getUserPlanData(user.id);
    userPlan = userData.plan;
  }

  return (
    <GatedSystemsThinking userPlan={userPlan} />
  );
    <div className="container py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Systems Thinking: The Critical Skill for the AI Age
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Systems thinking is THE skill needed more than ever in the AI age. It's what makes you stand out in the job market, 
          succeed in business, and achieve optimal outcomes.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          🧠 The Critical Skill • 🤖 AI Age Differentiator • 🚀 Career & Business Advantage
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">The AI Paradox: Why Systems Thinking is More Critical Than Ever</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What AI Can Do:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Write code and create content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Analyze data and generate insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Automate routine tasks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Process information at scale</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What AI Cannot Do:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Understand system interconnections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>See root causes vs. symptoms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Design holistic solutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Think across multiple perspectives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Create integrated strategies</span>
                  </li>
                </ul>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg mt-4">
                <p className="font-semibold">The Gap: Systems thinking is the uniquely human skill that AI cannot replicate.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Why Systems Thinking is Your Job Market Advantage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>The Problem</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• AI is replacing routine, single-perspective work</li>
                  <li>• Automation eliminates manual tasks</li>
                  <li>• Technology commoditizes basic skills</li>
                  <li>• Competition is fierce</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>The Solution</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Systems thinking is uniquely human</li>
                  <li>• AI amplifies systems thinking (doesn't replace it)</li>
                  <li>• Complex problems require systems thinking</li>
                  <li>• Systems thinkers are irreplaceable</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Why Employers Value Systems Thinkers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1">Competitive Advantage</h4>
                    <p className="text-sm text-muted-foreground">Systems thinkers solve root causes, not symptoms</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Better Outcomes</h4>
                    <p className="text-sm text-muted-foreground">They see interconnections others miss</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Integrated Solutions</h4>
                    <p className="text-sm text-muted-foreground">They design solutions that work together</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1">Sustainable Results</h4>
                    <p className="text-sm text-muted-foreground">They achieve lasting improvements</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Cost Savings</h4>
                    <p className="text-sm text-muted-foreground">They prevent costly mistakes</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Career Growth</h4>
                    <p className="text-sm text-muted-foreground">Systems thinking = Higher compensation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Why Systems Thinking Drives Business Success</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Without Systems Thinking</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Symptom treating (temporary fixes)</li>
                  <li>• Point solutions (isolated improvements)</li>
                  <li>• Unintended consequences</li>
                  <li>• Wasted resources</li>
                  <li>• Repeated failures</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>With Systems Thinking</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Root cause identification</li>
                  <li>• Sustainable solutions</li>
                  <li>• Risk mitigation</li>
                  <li>• Optimal resource allocation</li>
                  <li>• Lasting improvements</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Business Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Sustainable competitive advantage</li>
                  <li>• Better decision-making</li>
                  <li>• Reduced costs</li>
                  <li>• Increased innovation</li>
                  <li>• Scalable growth</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <Card className="bg-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl">AI + Systems Thinking = Unstoppable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">AI Handles:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Data processing</li>
                    <li>• Pattern recognition</li>
                    <li>• Automation</li>
                    <li>• Repetitive tasks</li>
                    <li>• Scale</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Systems Thinking Handles:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Problem definition</li>
                    <li>• Root cause analysis</li>
                    <li>• Solution design</li>
                    <li>• Integration planning</li>
                    <li>• Strategic direction</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-background rounded-lg">
                <p className="font-semibold text-center">
                  Together: AI amplifies systems thinking. Systems thinking directs AI effectively. 
                  The combination creates optimal outcomes and unstoppable competitive advantage.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">The AI Age Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-semibold">AI eliminates routine → Systems thinking becomes essential</p>
                    <p className="text-sm text-muted-foreground">As AI automates simple tasks, complex problem-solving becomes the differentiator</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-semibold">AI handles data → Systems thinking interprets meaning</p>
                    <p className="text-sm text-muted-foreground">AI processes data, systems thinking creates strategy from insights</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-semibold">AI automates tasks → Systems thinking designs solutions</p>
                    <p className="text-sm text-muted-foreground">AI executes, systems thinking creates the blueprint for execution</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                  <div>
                    <p className="font-semibold">AI scales execution → Systems thinking creates strategy</p>
                    <p className="text-sm text-muted-foreground">AI handles scale, systems thinking ensures optimal direction</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="text-center space-y-6 bg-muted/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold">Develop Systems Thinking Skills</h2>
            <p className="text-muted-foreground">
              Systems thinking is THE critical skill for the AI age. It's what makes you stand out in the job market, 
              succeed in business, and achieve optimal outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/genai-content-engine">Try GenAI Content Engine</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">Book Consultation</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>GenAI Content Engine:</strong> See systems thinking + GenAI in action with automated website creation.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
