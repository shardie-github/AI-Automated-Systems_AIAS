import { Metadata } from "next";
import { MobileOptimizedLayout } from "@/components/mobile/mobile-optimized-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Workflow, Zap, Shield, Smartphone } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mobile App — AIAS Platform",
  description: "Secure mobile-first experience for AIAS Platform",
};

export default function MobilePage() {
  return (
    <MobileOptimizedLayout>
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Smartphone className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">AIAS Platform Mobile</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access your workflows and automations securely from any device. 
            Optimized for mobile with offline support and enterprise-grade security.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Secure</CardTitle>
              </div>
              <CardDescription>
                Enterprise-grade security with encrypted communications and secure API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• End-to-end encryption</li>
                <li>• Secure authentication</li>
                <li>• Penetration tested</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Fast</CardTitle>
              </div>
              <CardDescription>
                Optimized for mobile with offline support and intelligent caching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Offline mode</li>
                <li>• Smart caching</li>
                <li>• Instant load</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Workflow className="h-5 w-5 text-primary" />
                <CardTitle>Full Featured</CardTitle>
              </div>
              <CardDescription>
                Complete access to all platform features optimized for mobile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Workflow management</li>
                <li>• Real-time updates</li>
                <li>• Push notifications</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/workflows">View Workflows</Link>
          </Button>
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>Install as App</CardTitle>
            <CardDescription>
              Install AIAS Platform as a Progressive Web App (PWA) for a native app experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              On mobile devices, you can install this app to your home screen for quick access 
              and offline functionality. Look for the install prompt in your browser.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p><strong>iOS:</strong> Tap Share → Add to Home Screen</p>
              <p><strong>Android:</strong> Tap Menu → Add to Home Screen</p>
              <p><strong>Desktop:</strong> Click the install icon in your browser address bar</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileOptimizedLayout>
  );
}
