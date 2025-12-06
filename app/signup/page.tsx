import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up — Start Your Free Trial | AI Automated Systems",
  description: "Start your 30-day free trial of AIAS Platform. No credit card required. Automate workflows, save 10+ hours/week. Canadian-built, PIPEDA compliant.",
};

export default function SignUpPage() {
  return (
    <div className="container py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Start Your Free Trial
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            No credit card required • 30-day free trial • Cancel anytime
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What You Get</CardTitle>
            <CardDescription>
              Everything you need to start automating your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>3 automation workflows</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>100 automations per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Access to pre-built templates</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Community support and resources</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>PIPEDA compliant • Canadian data residency</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button size="lg" className="w-full" asChild>
            <Link href="/api/auth/signup">Create Account</Link>
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Trusted by Canadian Businesses</h3>
          <p className="text-sm text-muted-foreground">
            🇨🇦 Built in Canada • 🔒 PIPEDA Compliant • 🛡️ Enterprise Security • ✅ 99.9% Uptime SLA
          </p>
        </div>
      </div>
    </div>
  );
}
