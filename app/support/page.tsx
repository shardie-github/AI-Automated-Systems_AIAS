import { Metadata } from "next";
import { Card, CardDescription, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support — Get Help | AIAS Platform",
  description: "Get help with your account, features, troubleshooting, and more.",
};

const supportCategories = [
  {
    title: "Getting Started",
    description: "New to the platform? Start here.",
    items: [
      {
        title: "Account Setup",
        description: "Learn how to set up your account and get started.",
        badge: "Popular",
      },
      {
        title: "First Steps Guide",
        description: "A comprehensive guide to your first steps on the platform.",
        badge: "New",
      },
    ],
  },
  {
    title: "Features & Usage",
    description: "Learn how to use our features effectively.",
    items: [
      {
        title: "Workflow Automation",
        description: "Create and manage automated workflows.",
        badge: "Featured",
      },
      {
        title: "AI Agents",
        description: "Build and deploy custom AI agents.",
        badge: "Popular",
      },
    ],
  },
  {
    title: "Troubleshooting",
    description: "Common issues and solutions.",
    items: [
      {
        title: "Common Issues",
        description: "Solutions to frequently encountered problems.",
        badge: "Help",
      },
      {
        title: "Error Messages",
        description: "Understand what error messages mean and how to fix them.",
        badge: "Help",
      },
    ],
  },
];

export default function SupportPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Support Center</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions, get help with features, and contact our support team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supportCategories.map((category) => (
          <Card key={category.title} className="flex flex-col">
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {category.items.map((item) => (
                <div key={item.title} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <Badge variant="secondary">{item.badge}</Badge>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/help#${category.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  Learn More
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Need personalized help? Our support team is here for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Email:</strong> support@aiautomatedsystems.ca
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Response Time:</strong> Within 24 hours during business days
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="mailto:support@aiautomatedsystems.ca">Send Email</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Browse our comprehensive documentation and guides.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Find detailed guides, API documentation, and best practices.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/help">View Documentation</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <Link href="/help" className="hover:underline">Help Center</Link>
          </Badge>
          <Badge variant="outline">
            <Link href="/features" className="hover:underline">Features</Link>
          </Badge>
          <Badge variant="outline">
            <Link href="/pricing" className="hover:underline">Pricing</Link>
          </Badge>
          <Badge variant="outline">
            <Link href="/demo" className="hover:underline">Book Demo</Link>
          </Badge>
        </div>
      </div>
    </div>
  );
}
