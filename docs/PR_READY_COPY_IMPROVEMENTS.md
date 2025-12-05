# PR-Ready Copy Improvements
**AIAS Platform - Key Surface Copy Enhancements**

*Last Updated: 2025-01-XX*
*Status: Ready for Implementation*

---

## Overview

This document provides PR-ready copy improvements for key surfaces identified in the content audit. All copy is:
- ✅ Conversion-optimized
- ✅ Benefit-focused (not feature-focused)
- ✅ Clear and actionable
- ✅ Aligned with brand voice
- ✅ Ready to implement

---

## Onboarding Flow Improvements

### Welcome Step (`components/onboarding/wizard.tsx`)

**Current**:
```tsx
<h3>Welcome to AI Automated Systems!</h3>
<p>Get your first automation running in under 5 minutes. No credit card required.</p>
```

**Improved**:
```tsx
<h3>Welcome! Let's get your first automation running in 5 minutes</h3>
<p className="text-muted-foreground">
  Save 10+ hours per week with AI-powered workflows. Built in Canada, trusted by 2,000+ businesses.
</p>
<p className="text-sm text-muted-foreground">
  Get started in 5 minutes. Choose a template, connect an integration (or skip), and watch your first automation run. No coding required.
</p>
```

---

### Integration Selection Step

**Current**:
```tsx
<p>Choose a tool you use daily, or skip this step and use a demo template.</p>
```

**Improved**:
```tsx
<p className="text-muted-foreground mb-4">
  Connect a tool you use daily to unlock powerful automations. Or skip this step and use a demo template to see how workflows work.
</p>
<div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-4">
  <p className="text-sm font-medium mb-2">Popular integrations:</p>
  <ul className="text-sm space-y-1 text-muted-foreground">
    <li>• <strong>Shopify</strong> → Automate order processing, inventory sync</li>
    <li>• <strong>Wave Accounting</strong> → Auto-categorize expenses, generate reports</li>
    <li>• <strong>Stripe</strong> → Process payments, send receipts automatically</li>
  </ul>
</div>
```

---

### Workflow Creation Step

**Current**:
```tsx
<p>Choose a template to get started instantly. You can customize it later.</p>
```

**Improved**:
```tsx
<p className="text-muted-foreground mb-4">
  Templates save hours of setup time. Each template includes pre-configured triggers and actions with best practices built-in.
</p>
<div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg mb-4">
  <p className="text-sm font-medium mb-2">💡 Recommended for beginners:</p>
  <p className="text-sm text-muted-foreground">
    <strong>Demo Workflow</strong> — See how it works with zero setup. Perfect for your first automation.
  </p>
</div>
<p className="text-sm text-muted-foreground">
  After creating your workflow, you can customize triggers, add conditions, and connect more integrations.
</p>
```

---

## Dashboard Improvements

### Empty State (`app/dashboard/page.tsx`)

**Current**: Basic empty state (if exists)

**Improved**:
```tsx
{isFirstVisit && (
  <Card className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" />
        Welcome to your dashboard, {user.firstName}!
      </CardTitle>
      <CardDescription>
        This is your command center for automation. Here's what you'll see:
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
          <h4 className="font-semibold mb-2">Workflows</h4>
          <p className="text-sm text-muted-foreground">All your automation workflows</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
          <h4 className="font-semibold mb-2">Analytics</h4>
          <p className="text-sm text-muted-foreground">Performance metrics and insights</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
          <h4 className="font-semibold mb-2">Integrations</h4>
          <p className="text-sm text-muted-foreground">Connected tools and services</p>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="font-semibold">Get started in 3 steps:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Create your first workflow — Use a template or build from scratch</li>
          <li>Connect an integration — Link your favorite tools</li>
          <li>Test and activate — See your automation in action</li>
        </ol>
      </div>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/onboarding/create-workflow">Create Your First Workflow</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/templates">Browse Templates</Link>
        </Button>
      </div>
      {userPlan === 'trial' && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
          <p className="text-sm">
            <strong>Your trial:</strong> You have {trialDaysLeft} days left. Upgrade to unlock unlimited workflows and advanced features.
          </p>
        </div>
      )}
    </CardContent>
  </Card>
)}
```

---

### Upgrade Prompt (`components/dashboard/dashboard-upgrade-section.tsx`)

**Current**: Basic upgrade prompt

**Improved**:
```tsx
{userPlan === 'trial' && (
  <Card className="mb-8 border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        Unlock the Full Power of Automation
      </CardTitle>
      <CardDescription>
        You've created {workflowCount} workflows. Upgrade to unlock unlimited workflows and save 10+ hours per week.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="font-semibold mb-2">What you'll unlock:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>✓ Unlimited workflows & automations</li>
            <li>✓ Personalized news feed (50+ articles/day)</li>
            <li>✓ Advanced analytics & insights</li>
            <li>✓ 30-minute onboarding session (free)</li>
            <li>✓ Priority support</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Your trial ends in {trialDaysLeft} days</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Upgrade now to keep all your workflows, integrations, and personalized system. No credit card required to start.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Join 2,000+ paid users saving 10+ hours/week</span>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/pricing">Upgrade Now</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/case-studies">See Success Stories</Link>
        </Button>
      </div>
    </CardContent>
  </Card>
)}
```

---

## Workflows Page Improvements

### Empty State (`app/workflows/page.tsx`)

**Current**: Basic empty state

**Improved**:
```tsx
{workflows.length === 0 && (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle>Create your first workflow</CardTitle>
      <CardDescription>
        Workflows automate repetitive tasks and save you 10+ hours per week. Create your first workflow to get started.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="mb-6">
        <h4 className="font-semibold mb-3">How to create a workflow:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Choose a template — Start with a pre-built template</li>
          <li>Or build from scratch — Create a custom workflow</li>
          <li>Connect integrations — Link your tools</li>
          <li>Test and activate — See it in action</li>
        </ol>
      </div>
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Popular templates:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium mb-1">E-commerce Order Processing</h5>
            <p className="text-xs text-muted-foreground">Automate order fulfillment</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium mb-1">Lead Capture to CRM</h5>
            <p className="text-xs text-muted-foreground">Qualify and route leads</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium mb-1">Daily Email Summary</h5>
            <p className="text-xs text-muted-foreground">Get daily reports automatically</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium mb-1">Customer Support Automation</h5>
            <p className="text-xs text-muted-foreground">Route tickets intelligently</p>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/onboarding/create-workflow">Create Workflow</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/templates">Browse All Templates</Link>
        </Button>
      </div>
    </CardContent>
  </Card>
)}
```

---

## Pricing Page Improvements

### Plan Descriptions (`app/pricing/page.tsx`)

**Current**: Feature-focused descriptions

**Improved** (for Starter plan):
```tsx
<CardDescription className="text-sm font-medium text-primary mt-1">
  For solo operators and small businesses
</CardDescription>
<p className="text-sm text-muted-foreground mt-2">
  Everything you need to automate your business operations and save 10+ hours per week. 
  Perfect for solo founders, freelancers, and small teams who want to scale without hiring.
</p>
```

**Improved** (for Pro plan):
```tsx
<CardDescription className="text-sm font-medium text-primary mt-1">
  For small teams (2-10 employees)
</CardDescription>
<p className="text-sm text-muted-foreground mt-2">
  Advanced features for growing teams. Collaborate, scale, and automate everything with 
  priority support and advanced analytics. Perfect for teams that need to coordinate 
  workflows and share insights.
</p>
```

---

## Help Center Improvements

### FAQ Answers (`app/help/page.tsx`)

**Current**: Good structure, but answers could be more concise

**Improved** (example - "How do I get started?"):
```tsx
{
  question: "How do I get started with AIAS Platform?",
  answer: "Getting started is easy! Sign up for a free account — no credit card required. You'll get access to our Starter plan features including 3 workflows and 100 automations per month. Complete the onboarding wizard to create your first automation in 5 minutes. We'll guide you through connecting an integration, choosing a template, and testing your first workflow."
}
```

---

## Error State Improvements

### Generic Error (`components/ui/error-state.tsx`)

**Current**: Basic error message

**Improved**:
```tsx
<div className="text-center py-12">
  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
  <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
    We encountered an error while processing your request. This is usually temporary.
  </p>
  <div className="bg-muted p-4 rounded-lg mb-6 max-w-md mx-auto text-left">
    <h3 className="font-semibold mb-2">What to try:</h3>
    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
      <li>Refresh the page — Most issues resolve with a refresh</li>
      <li>Check your connection — Ensure you're connected to the internet</li>
      <li>Clear your cache — Sometimes cached data causes issues</li>
      <li>Try again in a few minutes — If it's a server issue, it may resolve shortly</li>
    </ol>
  </div>
  <div className="flex gap-3 justify-center">
    <Button onClick={() => window.location.reload()}>Try Again</Button>
    <Button variant="outline" asChild>
      <Link href="/help">Get Help</Link>
    </Button>
  </div>
  <p className="text-xs text-muted-foreground mt-4">
    Error Code: {errorCode} — Include this when contacting support
  </p>
</div>
```

---

## Implementation Notes

### Copy Guidelines
- ✅ Always lead with benefits, not features
- ✅ Use clear, action-oriented CTAs
- ✅ Include social proof where relevant
- ✅ Personalize with user data when available
- ✅ Keep copy concise but informative

### Testing
- A/B test CTAs and headlines
- Track conversion rates
- Monitor user feedback
- Iterate based on data

---

*This document provides PR-ready copy improvements. Implement incrementally and test for conversion impact.*
