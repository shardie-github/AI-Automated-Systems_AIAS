# Content Backfill Plan
**AIAS Platform - Required Content Inventory & Copy Specifications**

*Last Updated: 2025-01-XX*
*Status: Ready for Implementation*

---

## Executive Summary

This document provides a comprehensive inventory of all content required to fill gaps identified in the Content Surface Map. Each entry includes:
- **Proposed tone** (formal, friendly, concise, executive)
- **2-3 alternative headline options**
- **Sub-headline**
- **Body copy** (short + medium length variants)
- **CTA wording**
- **Optional personalized variant** (if product supports personalization)

Content is grouped by priority and category for systematic implementation.

---

## Table of Contents

1. [Onboarding Flows](#onboarding-flows)
2. [Help Panels & Tooltips](#help-panels--tooltips)
3. [Workflow/Tutorial Explanations](#workflowtutorial-explanations)
4. [Premium-Only Summaries](#premium-only-summaries)
5. [Newsfeed Intros & Category Descriptions](#newsfeed-intros--category-descriptions)
6. [Error-State Guidance Blocks](#error-state-guidance-blocks)
7. [Dashboard Empty States](#dashboard-empty-states)
8. [In-App Lifecycle Nudges](#in-app-lifecycle-nudges)
9. [Email Content](#email-content)
10. [Modal & Dialog Content](#modal--dialog-content)

---

## Onboarding Flows

### Welcome Step Enhancement

**Location**: `components/onboarding/wizard.tsx` - WelcomeStep

**Current Copy**: "Welcome to AI Automated Systems! Get your first automation running in under 5 minutes. No credit card required."

**Proposed Improvements**:

#### Headline Options:
1. **Friendly**: "Welcome! Let's get your first automation running in 5 minutes"
2. **Benefit-Focused**: "Automate your first task in 5 minutes — no credit card needed"
3. **Executive**: "Welcome to AIAS Platform: Your automation journey starts here"

#### Sub-headline:
"Save 10+ hours per week with AI-powered workflows. Built in Canada, trusted by 2,000+ businesses."

#### Body Copy (Short):
"Get started in 5 minutes. Choose a template, connect an integration (or skip), and watch your first automation run. No coding required."

#### Body Copy (Medium):
"AIAS Platform combines systems thinking with AI automation to help you save time and scale your business. In the next 5 minutes, you'll:
- Choose a workflow template (or create your own)
- Connect an integration (optional — you can skip)
- Test your first automation
- See the magic happen!

No credit card required. Cancel anytime. 🇨🇦 Built in Canada, PIPEDA compliant."

#### CTA:
"Get Started - It's Free" (primary)
"Watch 2-Minute Demo" (secondary, if video available)

#### Personalized Variant:
"Hi {{firstName}}! Let's get your first automation running in 5 minutes. Based on your industry ({{industry}}), we've pre-selected templates that work best for businesses like yours."

---

### Integration Selection Step Enhancement

**Location**: `components/onboarding/wizard.tsx` - ChooseIntegrationStep

**Current Copy**: "Choose a tool you use daily, or skip this step and use a demo template."

**Proposed Improvements**:

#### Headline Options:
1. **Friendly**: "Connect a tool you use daily (or skip for now)"
2. **Benefit-Focused**: "Connect your tools to unlock powerful automations"
3. **Concise**: "Connect an integration — or skip to templates"

#### Sub-headline:
"Connect Shopify, Wave Accounting, Stripe, or 100+ other tools. You can always add more later."

#### Body Copy (Short):
"Choose a tool you use daily. We'll help you connect it securely. Or skip this step and use a demo template to see how workflows work."

#### Body Copy (Medium):
"Connecting an integration unlocks powerful automations. For example:
- **Shopify** → Automate order processing, inventory sync, customer notifications
- **Wave Accounting** → Auto-categorize expenses, generate reports, sync invoices
- **Stripe** → Process payments, send receipts, update subscriptions

Don't see your tool? Skip this step and explore our 100+ integrations later. You can always connect tools after creating your first workflow."

#### CTA:
"Connect {{integrationName}}" (per integration)
"Skip for Now" (secondary)

#### Personalized Variant:
"Based on your goals ({{userGoals}}), we recommend connecting {{recommendedIntegration}}. This will unlock {{benefit}}."

---

### Workflow Creation Step Enhancement

**Location**: `components/onboarding/wizard.tsx` - CreateWorkflowStep

**Current Copy**: "Choose a template to get started instantly. You can customize it later."

**Proposed Improvements**:

#### Headline Options:
1. **Friendly**: "Choose a template to get started instantly"
2. **Benefit-Focused**: "Create your first automation in 2 minutes"
3. **Action-Oriented**: "Pick a template and watch it work"

#### Sub-headline:
"Templates are pre-built workflows for common tasks. Customize them to fit your needs."

#### Body Copy (Short):
"Choose a template below. We'll create your workflow automatically. You can customize it later or create your own from scratch."

#### Body Copy (Medium):
"Templates save hours of setup time. Each template includes:
- Pre-configured triggers (what starts the workflow)
- Pre-configured actions (what happens next)
- Best practices built-in

**Recommended for beginners**: Demo Workflow — see how it works with zero setup.

After creating your workflow, you can customize triggers, add conditions, and connect more integrations."

#### CTA:
"Use This Template" (per template)
"Create Custom Workflow" (alternative)

#### Personalized Variant:
"Based on your industry ({{industry}}), here are templates that work best for businesses like yours: {{recommendedTemplates}}."

---

### Test Workflow Step Enhancement

**Location**: `components/onboarding/wizard.tsx` - TestWorkflowStep

**Current Copy**: "Let's test it to see the magic happen. This is your 'aha moment'!"

**Proposed Improvements**:

#### Headline Options:
1. **Celebratory**: "🎉 Your first workflow is ready! Let's test it"
2. **Benefit-Focused**: "See your automation in action — this is your 'aha moment'"
3. **Action-Oriented**: "Test your workflow and watch it work"

#### Sub-headline:
"This is where you'll see the power of automation. One click, and your workflow runs automatically."

#### Body Copy (Short):
"Click 'Test Workflow' to see your automation in action. This is your 'aha moment' — the moment you realize how much time you'll save."

#### Body Copy (Medium):
"Your workflow is ready! When you click 'Test Workflow', here's what happens:
1. The workflow triggers automatically
2. Actions execute in sequence
3. You see results in real-time

**This is your 'aha moment'** — the moment you realize how much time automation saves. Most users save 10+ hours per week after setting up just 3-5 workflows.

Ready to see it in action?"

#### CTA:
"Test Workflow Now" (primary)
"Skip Test" (secondary, if needed)

#### Personalized Variant:
"{{firstName}}, your {{workflowName}} workflow is ready! This workflow will {{benefit}}. Click 'Test Workflow' to see it in action."

---

### Completion Step Enhancement

**Location**: `components/onboarding/wizard.tsx` - CompleteStep

**Current Copy**: "You've created your first workflow. You're now ready to automate and save time."

**Proposed Improvements**:

#### Headline Options:
1. **Celebratory**: "🎉 Congratulations! You're all set"
2. **Achievement-Focused**: "You've automated your first task — well done!"
3. **Forward-Looking**: "You're ready to automate and save time"

#### Sub-headline:
"Your first workflow is live. Create more workflows to save 10+ hours per week."

#### Body Copy (Short):
"Congratulations! You've created your first workflow. Create more workflows to unlock the full power of automation."

#### Body Copy (Medium):
"🎉 **Congratulations, {{firstName}}!**

You've successfully created your first automation workflow. This is just the beginning. Here's what to do next:

**Immediate Next Steps:**
1. **Create 2-3 more workflows** — Most users see value after 3-5 workflows
2. **Connect more integrations** — The more tools you connect, the more powerful your automations
3. **Explore templates** — Browse 50+ pre-built templates for common tasks

**Pro Tip**: Apply systems thinking to identify your highest-impact automation opportunities. Analyze problems from 6 perspectives (process, technology, people, data, systems, automation) to find optimal solutions.

**Your Trial**: You have {{trialDaysLeft}} days left in your free trial. Upgrade to unlock unlimited workflows, advanced features, and priority support."

#### CTA:
"Go to Dashboard" (primary)
"Browse Templates" (secondary)
"Upgrade to Pro" (tertiary, for trial users)

#### Personalized Variant:
"{{firstName}}, you've created your first {{workflowType}} workflow! Based on your goals ({{userGoals}}), we recommend creating {{recommendedWorkflow}} next. This will help you {{benefit}}."

---

## Help Panels & Tooltips

### Dashboard Tooltips

**Location**: `app/dashboard/page.tsx` - KPI cards, metrics

#### KPI Card Tooltips:

**"New Users This Week" Tooltip**:
- **Short**: "Number of new users who signed up this week"
- **Medium**: "This metric tracks weekly growth. A healthy platform sees 50+ new users per week. This indicates strong product-market fit and growing community engagement."

**"Average Post Views" Tooltip**:
- **Short**: "Average number of views per post in the community"
- **Medium**: "This metric measures content engagement. Higher views indicate valuable content and active community. Target: 100+ views per post."

**"Actions Last Hour" Tooltip**:
- **Short**: "Number of user actions (workflows, clicks, etc.) in the last hour"
- **Medium**: "This real-time metric shows platform activity. High activity indicates engaged users finding value. Target: 20+ actions per hour."

#### Feature Discovery Tooltips:

**"Create Workflow" Tooltip**:
- **Short**: "Create a new automation workflow"
- **Medium**: "Workflows automate repetitive tasks. Create workflows to save 10+ hours per week. Start with a template or build from scratch."

**"View Analytics" Tooltip**:
- **Short**: "See performance metrics for your workflows"
- **Medium**: "Analytics show how your workflows are performing. Track success rates, time saved, and ROI. Use insights to optimize your automations."

---

### Workflow Builder Tooltips

**Location**: `components/workflows/WorkflowForm.tsx` (or similar)

#### Trigger Tooltip:
- **Short**: "What starts your workflow"
- **Medium**: "Triggers are events that start your workflow automatically. Examples: new order in Shopify, email received, scheduled time. Choose a trigger that matches your use case."

#### Action Tooltip:
- **Short**: "What happens when your workflow runs"
- **Medium**: "Actions are tasks your workflow performs automatically. Examples: send email, update database, create task. Chain multiple actions to automate complex processes."

#### Condition Tooltip:
- **Short**: "Add logic to your workflow"
- **Medium**: "Conditions let you add 'if/then' logic to workflows. Example: 'If order total > $100, then send to manager for approval.' Use conditions to create smart automations."

---

## Workflow/Tutorial Explanations

### "What is a Workflow?" Explanation

**Location**: `/workflows` page, onboarding, help center

#### Headline Options:
1. **Simple**: "What is a workflow?"
2. **Benefit-Focused**: "Workflows automate your repetitive tasks"
3. **Definition**: "Workflows: Your automation building blocks"

#### Body Copy (Short):
"A workflow is a series of automated actions triggered by an event. For example: 'When a new order arrives in Shopify, send a notification to Slack and update inventory.'"

#### Body Copy (Medium):
"A workflow is a series of automated actions that run when triggered by an event.

**Example Workflow:**
1. **Trigger**: New order in Shopify
2. **Action 1**: Send notification to Slack
3. **Action 2**: Update inventory in database
4. **Action 3**: Send confirmation email to customer

**Benefits:**
- Save 10+ hours per week
- Reduce errors by 90%
- Scale your business without hiring

**How to Create a Workflow:**
1. Choose a trigger (what starts it)
2. Add actions (what happens next)
3. Add conditions (optional logic)
4. Test and activate

Start with a template or build from scratch. No coding required."

#### CTA:
"Create Your First Workflow"
"Browse Templates"
"Watch Tutorial"

---

### "What is Systems Thinking?" Explanation

**Location**: Help center, about page, onboarding

#### Headline Options:
1. **Philosophical**: "Systems thinking: The critical skill for the AI age"
2. **Benefit-Focused**: "Why systems thinking makes your automations better"
3. **Educational**: "Systems thinking: Analyze problems from 6 perspectives"

#### Body Copy (Short):
"Systems thinking is analyzing problems from multiple perspectives to find optimal solutions. AIAS Platform applies systems thinking to every automation, ensuring solutions work holistically, not just for one task."

#### Body Copy (Medium):
"**Systems thinking is THE critical skill for the AI age.**

While AI handles execution, systems thinking creates strategy. It's what makes you stand out in the job market, succeed in business, and achieve optimal outcomes.

**The 6-Perspective Framework:**
Every challenge is analyzed through:
1. **Process**: How things work
2. **Technology**: What tools are used
3. **People**: Who is involved
4. **Data**: What information flows
5. **Systems**: How everything connects
6. **Automation**: Where AI can help

**Why It Matters:**
- **Point solutions** fix symptoms
- **Systems thinking** fixes root causes

**Example:**
Instead of automating one task (point solution), systems thinking asks: 'What's the root cause? How does this connect to other processes? What's the optimal solution that works holistically?'

**AIAS Platform** combines systems thinking with AI automation to create unstoppable results. AI handles execution. Systems thinking ensures optimal direction."

#### CTA:
"Learn More About Systems Thinking"
"See It in Action"
"Start Your Free Trial"

---

## Premium-Only Summaries

### Feature Lock Messages

**Location**: `components/monetization/premium-content-gate.tsx`, upgrade prompts

#### Headline Options:
1. **Benefit-Focused**: "Unlock {{featureName}} to {{benefit}}"
2. **Action-Oriented**: "Upgrade to access {{featureName}}"
3. **Value-Focused**: "{{featureName}} is available on {{planName}}"

#### Body Copy (Short):
"{{featureName}} is available on {{planName}} and above. Upgrade to unlock this feature and {{benefit}}."

#### Body Copy (Medium):
"**{{featureName}}** is available on **{{planName}}** and above.

**What you get:**
- {{featureBenefit1}}
- {{featureBenefit2}}
- {{featureBenefit3}}

**Upgrade to {{planName}}** to unlock this feature and {{primaryBenefit}}. Join 2,000+ paid users who save 10+ hours per week.

**Special Offer**: Upgrade in the next 48 hours and get your free 30-minute onboarding session."

#### CTA:
"Upgrade to {{planName}}" (primary)
"See All Features" (secondary)
"Start Free Trial" (if not on trial)

---

### Trial Limitation Messages

**Location**: Dashboard, workflow limits, feature gates

#### Headline Options:
1. **Friendly**: "You've reached your trial limit"
2. **Benefit-Focused**: "Unlock unlimited {{feature}} with {{planName}}"
3. **Action-Oriented**: "Upgrade to continue"

#### Body Copy (Short):
"You've used {{currentUsage}} of {{trialLimit}} {{feature}} in your trial. Upgrade to {{planName}} for unlimited {{feature}}."

#### Body Copy (Medium):
"You've used **{{currentUsage}} of {{trialLimit}} {{feature}}** in your free trial.

**What happens next:**
- You can continue using your existing {{feature}} until your trial ends
- New {{feature}} creation is limited until you upgrade
- Your data and workflows are safe — upgrade anytime to restore full access

**Upgrade to {{planName}}** to unlock:
- Unlimited {{feature}}
- {{additionalFeature1}}
- {{additionalFeature2}}
- Priority support

**Your trial ends in {{trialDaysLeft}} days.** Upgrade now to lock in your current setup and avoid interruption."

#### CTA:
"Upgrade to {{planName}}" (primary)
"See Pricing" (secondary)
"Contact Sales" (tertiary)

---

## Newsfeed Intros & Category Descriptions

### Newsfeed Welcome Message

**Location**: RSS news feed, personalized news dashboard

#### Headline Options:
1. **Personalized**: "Your personalized news feed is ready, {{firstName}}"
2. **Benefit-Focused**: "Stay ahead with AI-curated insights"
3. **Action-Oriented**: "Discover insights tailored to your goals"

#### Body Copy (Short):
"Your personalized news feed delivers 50+ articles per day based on your goals and industry. Stay ahead with AI-curated insights."

#### Body Copy (Medium):
"**Your personalized news feed is ready, {{firstName}}!**

Based on your pre-test responses and usage patterns, we've curated a news feed tailored to your goals:
- **Industry**: {{industry}}
- **Goals**: {{userGoals}}
- **Interests**: {{interests}}

**What you'll see:**
- 50+ articles per day from trusted sources
- Industry-specific insights
- Automation best practices
- Systems thinking frameworks
- Case studies from similar businesses

**Categories:**
- **Automation Trends**: Latest in AI and workflow automation
- **Systems Thinking**: Frameworks and methodologies
- **Industry News**: Updates relevant to {{industry}}
- **Case Studies**: Real results from businesses like yours
- **Tutorials**: Step-by-step guides

**Pro Tip**: Bookmark articles you find valuable. We'll use your preferences to refine your feed over time."

#### CTA:
"Explore News Feed" (primary)
"Customize Preferences" (secondary)

---

### Category Descriptions

**Location**: News feed category filters, help center

#### "Automation Trends" Category:
- **Short**: "Latest trends in AI and workflow automation"
- **Medium**: "Stay updated on the latest developments in AI automation, workflow tools, and productivity innovations. Learn from industry leaders and discover new ways to save time."

#### "Systems Thinking" Category:
- **Short**: "Frameworks and methodologies for holistic problem-solving"
- **Medium**: "Deep dive into systems thinking frameworks, methodologies, and real-world applications. Learn how to analyze problems from multiple perspectives and find optimal solutions."

#### "Industry News" Category:
- **Short**: "Updates relevant to your industry"
- **Medium**: "Industry-specific news, trends, and insights tailored to {{industry}}. Stay informed about market changes, regulatory updates, and opportunities in your sector."

#### "Case Studies" Category:
- **Short**: "Real results from businesses using automation"
- **Medium**: "See how businesses like yours are using AIAS Platform to save time, reduce errors, and scale. Learn from real-world examples and discover new use cases."

#### "Tutorials" Category:
- **Short**: "Step-by-step guides to maximize your results"
- **Medium**: "Learn how to get the most out of AIAS Platform with step-by-step tutorials. From creating your first workflow to advanced automation techniques, we've got you covered."

---

## Error-State Guidance Blocks

### Generic Error Message

**Location**: `components/ui/error-state.tsx`, API error handlers

#### Headline Options:
1. **Friendly**: "Something went wrong"
2. **Action-Oriented**: "We're having trouble loading this"
3. **Helpful**: "Oops! Let's get you back on track"

#### Body Copy (Short):
"Something went wrong. Please try again or contact support if the problem persists."

#### Body Copy (Medium):
"**Something went wrong**

We encountered an error while processing your request. This is usually temporary.

**What to try:**
1. **Refresh the page** — Most issues resolve with a refresh
2. **Check your connection** — Ensure you're connected to the internet
3. **Clear your cache** — Sometimes cached data causes issues
4. **Try again in a few minutes** — If it's a server issue, it may resolve shortly

**Still having trouble?**
- **Contact Support**: support@aiautomatedsystems.ca
- **Help Center**: /help
- **Status Page**: /status

**Error Code**: {{errorCode}} (include this when contacting support)"

#### CTA:
"Try Again" (primary)
"Contact Support" (secondary)
"Go to Dashboard" (tertiary)

---

### Workflow Execution Error

**Location**: Workflow execution results, error logs

#### Headline Options:
1. **Specific**: "Workflow execution failed"
2. **Action-Oriented**: "Let's fix this workflow"
3. **Helpful**: "Your workflow needs attention"

#### Body Copy (Short):
"Your workflow encountered an error. Check the error details below and fix the issue, then try again."

#### Body Copy (Medium):
"**Workflow execution failed**

Your workflow '{{workflowName}}' encountered an error during execution.

**Error Details:**
- **Step**: {{failedStep}}
- **Error**: {{errorMessage}}
- **Time**: {{timestamp}}

**Common causes:**
1. **Invalid credentials** — Re-authenticate your integration
2. **Missing data** — Check that required fields are provided
3. **Rate limits** — You may have hit API rate limits
4. **Network issues** — Check your connection

**How to fix:**
1. Review the error details above
2. Check your integration settings
3. Verify your workflow configuration
4. Test the workflow again

**Need help?** Visit our [Troubleshooting Guide](/help/troubleshooting) or contact support."

#### CTA:
"View Error Details" (primary)
"Edit Workflow" (secondary)
"Get Help" (tertiary)

---

## Dashboard Empty States

### First Visit Empty State

**Location**: `app/dashboard/page.tsx` - First-time user experience

#### Headline Options:
1. **Welcoming**: "Welcome to your dashboard, {{firstName}}!"
2. **Action-Oriented**: "Let's create your first workflow"
3. **Benefit-Focused**: "Start automating and save 10+ hours per week"

#### Body Copy (Short):
"Your dashboard is where you'll manage workflows, view analytics, and track your automation success. Create your first workflow to get started."

#### Body Copy (Medium):
"**Welcome to your dashboard, {{firstName}}!**

This is your command center for automation. Here's what you'll see:
- **Workflows**: All your automation workflows
- **Analytics**: Performance metrics and insights
- **Integrations**: Connected tools and services
- **Templates**: Pre-built workflows to get started

**Get started in 3 steps:**
1. **Create your first workflow** — Use a template or build from scratch
2. **Connect an integration** — Link your favorite tools
3. **Test and activate** — See your automation in action

**Your trial**: You have {{trialDaysLeft}} days left. Upgrade to unlock unlimited workflows and advanced features.

**Need help?** Check out our [Getting Started Guide](/help/getting-started) or [watch a 2-minute tutorial](/help/videos)."

#### CTA:
"Create Your First Workflow" (primary)
"Browse Templates" (secondary)
"Watch Tutorial" (tertiary)

---

### No Workflows Empty State

**Location**: `/workflows` page - No workflows created

#### Headline Options:
1. **Action-Oriented**: "Create your first workflow"
2. **Benefit-Focused**: "Start automating and save time"
3. **Friendly**: "No workflows yet — let's create one!"

#### Body Copy (Short):
"You haven't created any workflows yet. Create your first workflow to start automating tasks and saving time."

#### Body Copy (Medium):
"**No workflows yet**

Workflows automate repetitive tasks and save you 10+ hours per week. Create your first workflow to get started.

**How to create a workflow:**
1. **Choose a template** — Start with a pre-built template
2. **Or build from scratch** — Create a custom workflow
3. **Connect integrations** — Link your tools
4. **Test and activate** — See it in action

**Popular templates:**
- **E-commerce Order Processing** — Automate order fulfillment
- **Lead Capture to CRM** — Qualify and route leads
- **Daily Email Summary** — Get daily reports automatically
- **Customer Support Automation** — Route tickets intelligently

**Need inspiration?** Browse our [50+ templates](/templates) or read [case studies](/case-studies) from businesses like yours."

#### CTA:
"Create Workflow" (primary)
"Browse Templates" (secondary)
"Watch Tutorial" (tertiary)

---

## In-App Lifecycle Nudges

### Trial Ending Reminder (5 Days Left)

**Location**: Dashboard banner, email, in-app notification

#### Headline Options:
1. **Urgent**: "Your trial ends in 5 days"
2. **Benefit-Focused**: "Lock in your personalized system before trial ends"
3. **Action-Oriented**: "Upgrade now to keep everything"

#### Body Copy (Short):
"Your 30-day free trial ends in 5 days. Upgrade now to keep your workflows, integrations, and personalized news feed."

#### Body Copy (Medium):
"**Your trial ends in 5 days, {{firstName}}**

You've created {{workflowCount}} workflows and connected {{integrationCount}} integrations. Your personalized system is ready — upgrade now to keep everything.

**What you'll keep:**
- All {{workflowCount}} workflows
- {{integrationCount}} connected integrations
- Your personalized news feed
- All your data and settings

**What you'll unlock:**
- Unlimited workflows (currently limited to {{trialLimit}})
- Unlimited automations
- Advanced analytics
- Priority support
- 30-minute onboarding session (free with upgrade)

**Special offer**: Upgrade in the next 48 hours and get your free onboarding session to maximize your results.

**Your trial ends**: {{trialEndDate}}. Upgrade now to avoid interruption."

#### CTA:
"Upgrade Before Trial Ends" (primary)
"See Pricing" (secondary)
"Contact Sales" (tertiary)

---

### Incomplete Setup Nudge

**Location**: Dashboard, after 3 days of inactivity

#### Headline Options:
1. **Friendly**: "Let's finish setting up your account"
2. **Action-Oriented**: "Complete your setup in 5 minutes"
3. **Benefit-Focused**: "Unlock the full power of automation"

#### Body Copy (Short):
"You're almost there! Complete your setup to unlock the full power of automation. It only takes 5 minutes."

#### Body Copy (Medium):
"**Let's finish setting up your account, {{firstName}}**

You've created your account, but there are a few quick steps to unlock the full power of automation:

**Quick setup checklist:**
- ✅ Account created
- {{#if workflowsCreated}}✅ First workflow created{{else}}⏳ Create your first workflow{{/if}}
- {{#if integrationsConnected}}✅ Integration connected{{else}}⏳ Connect an integration{{/if}}
- {{#if preTestCompleted}}✅ Pre-test completed{{else}}⏳ Complete pre-test for personalized experience{{/if}}

**Why complete setup?**
- **Personalized experience** — Get recommendations tailored to your goals
- **Faster results** — See value in days, not weeks
- **Better insights** — Analytics improve with more data

**It only takes 5 minutes.** Complete your setup now to start saving time."

#### CTA:
"Complete Setup" (primary)
"Skip for Now" (secondary)

---

### Feature Unused Nudge

**Location**: Dashboard, after 7 days without using a key feature

#### Headline Options:
1. **Discovery-Focused**: "Discover {{featureName}}"
2. **Benefit-Focused**: "Unlock {{benefit}} with {{featureName}}"
3. **Action-Oriented**: "Try {{featureName}} now"

#### Body Copy (Short):
"You haven't tried {{featureName}} yet. It's a powerful way to {{benefit}}. Try it now — it only takes 2 minutes."

#### Body Copy (Medium):
"**Discover {{featureName}}, {{firstName}}**

You've been using AIAS Platform for {{daysActive}} days, but you haven't tried **{{featureName}}** yet. This feature helps you {{primaryBenefit}}.

**What {{featureName}} does:**
- {{benefit1}}
- {{benefit2}}
- {{benefit3}}

**How to get started:**
1. Go to {{featureLocation}}
2. Follow the 2-minute setup
3. See results immediately

**Example use case:**
{{exampleUseCase}}

**Try it now** — it only takes 2 minutes and could save you {{timeSaved}} per week."

#### CTA:
"Try {{featureName}}" (primary)
"Learn More" (secondary)
"Dismiss" (tertiary)

---

## Email Content

*Note: Detailed email templates are in `emails/` folder. This section provides copy specifications for email content.*

### Trial Welcome Email (Day 0)

**See**: `emails/lifecycle/trial_welcome.html` (to be created)

**Subject Line Options**:
1. "Welcome to AIAS Platform! Here's how to get value in 10 minutes"
2. "{{firstName}}, your 30-day free trial starts now"
3. "Welcome! Get your first automation running in 5 minutes"

**Preview Text**: "Get started with 3 quick wins you can achieve today. No credit card required."

**Body Copy**: See email template file for full HTML structure.

---

### Trial Midpoint Nudge (Day 15)

**Subject Line Options**:
1. "You're halfway through your trial — here's what you're missing"
2. "{{firstName}}, unlock unlimited workflows before trial ends"
3. "Trial halfway done. See what paid users get"

**Preview Text**: "Unlock personalized insights, unlimited workflows, and advanced features."

**Body Copy**: See email template file.

---

### Trial Ending Urgency (Day 27)

**Subject Line Options**:
1. "Last chance: Your trial ends in 3 days"
2. "{{firstName}}, upgrade now to keep your {{workflowCount}} workflows"
3. "Trial ending soon — lock in your personalized system"

**Preview Text**: "Upgrade now to keep all your workflows, integrations, and data."

**Body Copy**: See email template file.

---

## Modal & Dialog Content

### Confirmation Dialogs

#### Delete Workflow Confirmation

**Headline**: "Delete workflow '{{workflowName}}'?"

**Body Copy (Short)**:
"This will permanently delete your workflow and all its execution history. This action cannot be undone."

**Body Copy (Medium)**:
"**Are you sure you want to delete '{{workflowName}}'?**

This will permanently delete:
- The workflow configuration
- All execution history ({{executionCount}} runs)
- All associated data

**This action cannot be undone.**

If you want to keep the workflow but stop it from running, consider **deactivating** it instead. You can reactivate it anytime."

**CTA**:
"Delete Workflow" (destructive, primary)
"Cancel" (secondary)
"Deactivate Instead" (tertiary)

---

### Feature Explanation Modals

#### Systems Thinking Modal

**Headline**: "What is systems thinking?"

**Body Copy**: See "What is Systems Thinking?" explanation above.

**CTA**:
"Learn More" (primary)
"Close" (secondary)

---

## Implementation Priority

### Priority 1 (Immediate)
1. Onboarding flow enhancements
2. Dashboard empty states
3. Error state guidance
4. Trial ending reminders

### Priority 2 (This Month)
1. Help panels & tooltips
2. Workflow/tutorial explanations
3. Premium-only summaries
4. In-app lifecycle nudges

### Priority 3 (Next Quarter)
1. Newsfeed intros & categories
2. Email content expansion
3. Modal & dialog content
4. Advanced personalization

---

## Content Guidelines

### Tone of Voice
- **Primary**: Friendly, professional, benefit-focused
- **Secondary**: Concise, action-oriented
- **Tertiary**: Executive (for enterprise features)

### Writing Principles
1. **Benefits over features** — Always lead with "what's in it for you"
2. **Clear CTAs** — Action-oriented, specific
3. **Personalization** — Use {{variables}} where possible
4. **Social proof** — Include usage stats, testimonials
5. **Urgency** — Use sparingly, only when genuine

### Content Length Guidelines
- **Short**: 1-2 sentences (tooltips, short messages)
- **Medium**: 3-5 sentences (body copy, explanations)
- **Long**: 5+ sentences (tutorials, detailed guides)

---

*This document is a living resource. Update as new content requirements are identified or existing content is improved.*
