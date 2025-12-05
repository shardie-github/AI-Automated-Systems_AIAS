# Monthly Cadence Engine
**AIAS Platform - Free Trial & Paid Subscription Content Strategy**

*Last Updated: 2025-01-XX*
*Status: Ready for Implementation*

---

## Executive Summary

This document defines the complete value cadence for AIAS Platform's subscription product, including:
- **Free Trial (0-30 days)**: Daily → weekly touchpoints with content delivery, paywall messaging, and upgrade persuasion
- **Paid Monthly Subscription (Month 1+)**: Standardized monthly value drops, personalized insights, and retention messaging
- **Retention System**: Monthly milestones, low-activity nudges, renewal reminders, and loyalty perks

All content is designed to create a "value drip" experience that maximizes conversion, retention, and lifetime value.

---

## Table of Contents

1. [Free Trial Cadence (0-30 Days)](#free-trial-cadence-0-30-days)
2. [Paid Monthly Subscription (Month 1+)](#paid-monthly-subscription-month-1)
3. [Retention System](#retention-system)
4. [Content Delivery Mechanisms](#content-delivery-mechanisms)
5. [Personalization Rules](#personalization-rules)
6. [Implementation Guide](#implementation-guide)

---

## Free Trial Cadence (0-30 Days)

### Day 0: Welcome & Activation

**Touchpoint**: Email + In-App
**Goal**: Immediate activation, "aha moment" within 5 minutes

#### Email: Trial Welcome
- **Subject**: "Welcome to AIAS Platform! Here's how to get value in 10 minutes"
- **Content**: See `emails/lifecycle/trial_welcome.html`
- **CTA**: "Go to Dashboard"
- **Key Message**: "3 quick wins you can achieve today"

#### In-App: Onboarding Wizard
- **Content**: See `components/onboarding/wizard.tsx`
- **Goal**: First workflow created in 5 minutes
- **Success Metric**: Workflow created + tested

#### Content Delivered:
- ✅ Welcome message
- ✅ Quick start guide
- ✅ Systems thinking introduction
- ✅ Canadian identity messaging

#### Paywall Status:
- **Unlocked**: Basic features, 3 workflows, 100 automations/month
- **Locked**: Unlimited workflows, advanced analytics, personalized news feed

---

### Day 2: First Value Delivery

**Touchpoint**: Email
**Goal**: Show personalized value, reinforce trial benefits

#### Email: First Value Drop
- **Subject**: "Your AI news feed is ready! Plus, here's a quick win"
- **Content**:
  - News feed ready notification
  - One insight from email analysis (if email connected)
  - Quick win suggestion
- **CTA**: "View Insights"
- **Key Message**: "Your personalized experience is ready"

#### Content Delivered:
- ✅ News feed introduction
- ✅ First insight (if available)
- ✅ Quick win suggestion

#### Paywall Status:
- **Unlocked**: Basic news feed (15 articles/day)
- **Locked**: Personalized news feed (50+ articles/day), unlimited email analysis

---

### Day 7: Mid-Week Check-In

**Touchpoint**: Email
**Goal**: Show what's unlocked with paid plan, gentle upsell

#### Email: Week 1 Summary
- **Subject**: "You're doing great! Here's what you're missing"
- **Content**: See `emails/lifecycle/trial_day7.html`
- **CTA**: "Upgrade to Unlock"
- **Key Message**: "You've made progress. Here's what you could unlock."

#### Content Delivered:
- ✅ Week 1 progress summary
- ✅ Paid plan benefits
- ✅ Feature comparison

#### Paywall Status:
- **Unlocked**: Trial features continue
- **Locked**: Advanced features highlighted

---

### Day 14: Social Proof & Case Study

**Touchpoint**: Email
**Goal**: Show real results, build trust, encourage upgrade

#### Email: Case Study
- **Subject**: "How [Company] saved 15 hours/week with AIAS Platform"
- **Content**:
  - Similar business case study
  - Real results (time saved, ROI)
  - Upgrade CTA with case study access
- **CTA**: "Upgrade to See Full Case Study"
- **Key Message**: "Real businesses are seeing results. You can too."

#### Content Delivered:
- ✅ Case study preview
- ✅ Social proof
- ✅ Results metrics

#### Paywall Status:
- **Unlocked**: Case study preview
- **Locked**: Full case study with step-by-step solutions

---

### Day 21: Midpoint Comparison

**Touchpoint**: Email
**Goal**: Clear comparison, upgrade incentive

#### Email: Trial Midpoint
- **Subject**: "Trial halfway done. Here's what paid users get"
- **Content**:
  - Free vs. Paid comparison
  - Feature unlock list
  - Upgrade incentive
- **CTA**: "Upgrade Now"
- **Key Message**: "You're halfway through. See what you're missing."

#### Content Delivered:
- ✅ Feature comparison table
- ✅ Upgrade benefits
- ✅ Social proof (2,000+ paid users)

#### Paywall Status:
- **Unlocked**: Trial features
- **Locked**: Paid features clearly highlighted

---

### Day 25: Urgency Introduction

**Touchpoint**: Email + In-App Banner
**Goal**: Create urgency, prevent churn

#### Email: Trial Ending Soon
- **Subject**: "Your trial ends in 5 days. Lock in your personalized system"
- **Content**: See `emails/lifecycle/trial_ending.html`
- **CTA**: "Upgrade Before Trial Ends"
- **Key Message**: "Don't lose your setup. Upgrade now."

#### In-App: Banner
- **Content**: "Trial ends in 5 days. Upgrade to keep your {{workflow_count}} workflows."
- **CTA**: "Upgrade Now"

#### Content Delivered:
- ✅ Trial countdown
- ✅ What you'll lose message
- ✅ Upgrade benefits
- ✅ Special offer (48-hour upgrade bonus)

#### Paywall Status:
- **Unlocked**: Trial features (ending soon)
- **Locked**: All paid features

---

### Day 27: Final Reminder

**Touchpoint**: Email + In-App Modal
**Goal**: Last chance messaging, prevent churn

#### Email: Last Chance
- **Subject**: "Last chance: Your trial ends in 3 days"
- **Content**: Urgency-focused, benefit-focused
- **CTA**: "Upgrade Now - Trial Ending Soon"
- **Key Message**: "Final reminder. Upgrade to keep everything."

#### In-App: Modal (on login)
- **Content**: "Your trial ends in 3 days. Upgrade now to keep your personalized system."
- **CTA**: "Upgrade Now" / "Remind Me Later"

#### Content Delivered:
- ✅ Final countdown
- ✅ Upgrade benefits
- ✅ What you'll lose

#### Paywall Status:
- **Unlocked**: Trial features (ending very soon)
- **Locked**: All paid features

---

### Day 29: Last Day

**Touchpoint**: Email + In-App Banner
**Goal**: Final conversion attempt

#### Email: Last Day
- **Subject**: "Last chance: Your trial ends tomorrow"
- **Content**: Maximum urgency, clear value proposition
- **CTA**: "Upgrade Before Trial Ends"
- **Key Message**: "This is your last chance. Upgrade today."

#### In-App: Persistent Banner
- **Content**: "Trial ends tomorrow. Upgrade now to keep your setup."
- **CTA**: "Upgrade Now" (cannot dismiss)

#### Content Delivered:
- ✅ Final urgency message
- ✅ Upgrade benefits
- ✅ Post-trial recovery option

#### Paywall Status:
- **Unlocked**: Trial features (ending tomorrow)
- **Locked**: All paid features

---

### Day 30: Trial Ended

**Touchpoint**: Email
**Goal**: Win-back, restore access

#### Email: Trial Ended
- **Subject**: "Your trial has ended. Upgrade to restore full access"
- **Content**:
  - Trial ended notification
  - What you can still access
  - Upgrade CTA
  - 7-day grace period message
- **CTA**: "Upgrade Now"
- **Key Message**: "Upgrade within 7 days to restore everything."

#### Content Delivered:
- ✅ Trial ended notification
- ✅ Grace period information
- ✅ Upgrade benefits
- ✅ Recovery path

#### Paywall Status:
- **Unlocked**: Limited access (read-only)
- **Locked**: All paid features

---

## Paid Monthly Subscription (Month 1+)

### Month 1: Welcome to Paid

**Touchpoint**: Email
**Goal**: Onboard to paid features, maximize value

#### Email: Paid Welcome
- **Subject**: "Welcome to {{plan_name}}! Here's what's unlocked"
- **Content**:
  - Welcome to paid plan
  - Unlocked features list
  - Onboarding session booking
  - Getting started guide
- **CTA**: "Book Your Onboarding Session"
- **Key Message**: "You're now a paid member. Here's how to maximize value."

#### Content Delivered:
- ✅ Paid plan welcome
- ✅ Feature unlock list
- ✅ Onboarding session offer
- ✅ Getting started resources

---

### Monthly Summary (Every Month)

**Touchpoint**: Email (1st of month)
**Goal**: Show value, reinforce ROI, encourage engagement

#### Email: Monthly Summary
- **Subject**: "Your {{month}} Summary - {{automation_count}} automations executed"
- **Content**: See `emails/lifecycle/paid_monthly_summary.html`
- **CTA**: "View Full Dashboard"
- **Key Message**: "Here's how {{product_name}} performed for you this month."

#### Content Delivered:
- ✅ Monthly stats (workflows, automations, time saved)
- ✅ Key insights
- ✅ Recommended next steps
- ✅ Success metrics

#### For Settler Users:
- Reconciliation progress
- Compliance/risk score changes
- Upcoming deadlines
- Suggested next actions

#### For AIAS Users:
- Automation maturity score
- Workflow adoption rate
- Recommended upgrades
- Cost/time savings summary

---

### Monthly Insights (Mid-Month)

**Touchpoint**: Email (15th of month)
**Goal**: Deliver value, maintain engagement

#### Email: Monthly Insights
- **Subject**: "{{insight_count}} insights for {{user.first_name}} this month"
- **Content**:
  - Personalized insights based on usage
  - Industry-specific recommendations
  - New feature announcements
  - Best practices
- **CTA**: "View Insights"
- **Key Message**: "Here are insights tailored to your business."

#### Content Delivered:
- ✅ Personalized insights
- ✅ Industry recommendations
- ✅ New features
- ✅ Best practices

---

### Quarterly Deep-Dive (Every 3 Months)

**Touchpoint**: Email
**Goal**: Comprehensive assessment, upsell opportunities

#### Email: Quarterly Assessment
- **Subject**: "Your Q{{quarter}} Assessment: {{time_saved_hours}} hours saved"
- **Content**:
  - Quarterly stats
  - ROI calculation
  - Maturity assessment
  - Upsell recommendations (if applicable)
- **CTA**: "View Full Report"
- **Key Message**: "Here's your comprehensive quarterly assessment."

#### Content Delivered:
- ✅ Quarterly statistics
- ✅ ROI analysis
- ✅ Maturity assessment
- ✅ Upsell opportunities

---

## Retention System

### Monthly Milestone Emails

**Touchpoint**: Email (on milestone dates)
**Goal**: Celebrate achievements, reinforce value

#### Milestones:
- **1 Month**: "You've been with us for 1 month! Here's what you've achieved."
- **3 Months**: "3 months of automation success! Here's your progress."
- **6 Months**: "Half a year of time saved! Here's your impact."
- **1 Year**: "1 year anniversary! Thank you for being part of our community."

#### Content:
- Achievement celebration
- Stats summary
- Loyalty perks (if applicable)
- Community invitation

---

### Low Activity Nudges

**Trigger**: 7 days of inactivity
**Touchpoint**: Email + In-App
**Goal**: Re-engage, prevent churn

#### Email: We Miss You
- **Subject**: "We miss you! Here's what's new at {{product_name}}"
- **Content**:
  - Friendly re-engagement message
  - New features since last visit
  - Quick win suggestion
  - Support offer
- **CTA**: "Return to Dashboard"
- **Key Message**: "We've been busy building. Come see what's new."

#### In-App: On Login
- **Content**: "Welcome back! Here's what's new since your last visit."
- **CTA**: "Explore New Features"

---

### Renewal Reminders

**Touchpoint**: Email
**Goal**: Prevent churn, encourage renewal

#### 30 Days Before Renewal:
- **Subject**: "Your subscription renews in 30 days"
- **Content**: Renewal date, benefits reminder, continue subscription CTA
- **CTA**: "Continue Subscription"

#### 7 Days Before Renewal:
- **Subject**: "Your subscription renews in 7 days"
- **Content**: Renewal reminder, benefits summary, continue CTA
- **CTA**: "Continue Subscription"

#### 1 Day Before Renewal:
- **Subject**: "Your subscription renews tomorrow"
- **Content**: Final reminder, benefits, continue CTA
- **CTA**: "Continue Subscription"

---

### Churn Recovery

**Trigger**: Cancellation request or non-renewal
**Touchpoint**: Email
**Goal**: Win-back, understand churn reason

#### Email: We're Sorry to See You Go
- **Subject**: "We're sorry to see you go, {{user.first_name}}"
- **Content**:
  - Acknowledgment
  - Feedback request
  - Special offer (if applicable)
  - Win-back CTA
- **CTA**: "Restore Subscription" / "Share Feedback"
- **Key Message**: "We'd love to understand why and see if we can help."

#### Follow-Up (7 days after cancellation):
- **Subject**: "Special offer: 20% off your next 3 months"
- **Content**: Win-back offer, benefits reminder
- **CTA**: "Claim Your Discount"

---

## Content Delivery Mechanisms

### Email Delivery

**Provider**: Resend / SendGrid / SMTP (configurable)
**Service**: `lib/email/email-service.ts`
**Templates**: `emails/lifecycle/`
**Scheduling**: Cron jobs or event-driven

### In-App Delivery

**Components**:
- Banners: `components/layout/enhanced-sticky-cta.tsx`
- Modals: `components/ui/dialog.tsx`
- Notifications: `components/notifications/`
- Tooltips: `components/ui/popover.tsx`

### Push Notifications

**Service**: Web Push API
**Components**: `components/gamification/PushNotificationButton.tsx`
**Use Cases**: Urgent updates, milestone achievements

---

## Personalization Rules

### User Stage Personalization

#### Anonymous:
- Generic messaging
- Awareness-focused content
- Social proof

#### Trial:
- Trial-specific messaging
- Countdown timers
- Upgrade prompts
- Feature unlock messaging

#### Paid:
- Value-focused messaging
- ROI emphasis
- Upsell opportunities (if applicable)
- Community access

### Behavior-Based Personalization

#### High Engagement:
- Advanced features
- Upsell opportunities
- Community invitations
- Case studies

#### Low Engagement:
- Re-engagement campaigns
- Quick win suggestions
- Support offers
- Feature discovery

#### Churn Risk:
- Win-back campaigns
- Special offers
- Feedback requests
- Support outreach

### Profile-Based Personalization

#### Industry:
- Industry-specific case studies
- Industry news
- Industry templates
- Industry best practices

#### Goals (from pre-test):
- Goal-aligned content
- Goal-specific templates
- Goal-focused insights
- Goal achievement tracking

#### Usage Patterns:
- Usage-based recommendations
- Usage-specific insights
- Usage-aligned features
- Usage-driven upsells

---

## Implementation Guide

### Email Template Engine

**Location**: `lib/email-templates/` (existing)
**Enhancement**: Add dynamic field support from `emails/fields/dynamic_fields.json`

**Implementation Steps**:
1. Extend `replaceTemplateVariables()` to support nested fields (e.g., `{{user.first_name}}`)
2. Add conditional rendering (e.g., `{{#if user.workflow_count}}...{{/if}}`)
3. Add date formatting helpers
4. Add URL tracking (UTM parameters)

### Scheduling System

**Location**: `supabase/functions/` or cron jobs
**Implementation**:
1. Create scheduled functions for each email type
2. Query users based on trial day, subscription status, activity
3. Render templates with user data
4. Send via `emailService.sendTemplate()`

### In-App Delivery

**Components to Create/Enhance**:
1. `components/notifications/TrialReminder.tsx` - Trial countdown banner
2. `components/notifications/MonthlySummary.tsx` - Monthly summary card
3. `components/notifications/FeatureAnnouncement.tsx` - New feature announcements
4. `components/notifications/LowActivityNudge.tsx` - Re-engagement prompts

### Analytics & Tracking

**Metrics to Track**:
- Email open rates
- Email click rates
- Conversion rates (trial → paid)
- Churn rates
- Engagement scores
- Time to value
- Feature adoption

**Tools**:
- Email service analytics (Resend/SendGrid)
- Custom event tracking (`lib/telemetry/track.ts`)
- Conversion tracking (`lib/analytics/conversion-tracking.ts`)

---

## Content Calendar Template

### Monthly Schedule

**Week 1**:
- Day 1: Monthly summary email (paid users)
- Day 2: Trial day 2 email (if applicable)
- Day 7: Trial day 7 email (if applicable)

**Week 2**:
- Day 14: Trial day 14 email (if applicable)
- Day 15: Monthly insights email (paid users)

**Week 3**:
- Day 21: Trial day 21 email (if applicable)
- Feature announcements (as needed)

**Week 4**:
- Day 25: Trial day 25 email (if applicable)
- Day 27: Trial day 27 email (if applicable)
- Day 29: Trial day 29 email (if applicable)
- Day 30: Trial ended email (if applicable)

**Ad-Hoc**:
- Low activity nudges (triggered)
- Churn recovery (triggered)
- Renewal reminders (scheduled)
- Milestone emails (scheduled)

---

## Success Metrics

### Trial Conversion
- **Target**: 15-25% trial → paid conversion
- **Measurement**: Users who upgrade within 30 days of trial start
- **Optimization**: A/B test email subject lines, CTAs, timing

### Paid Retention
- **Target**: 90%+ monthly retention
- **Measurement**: Users who remain subscribed month-over-month
- **Optimization**: Value delivery, engagement, support

### Engagement
- **Target**: 60%+ email open rate, 10%+ click rate
- **Measurement**: Email analytics
- **Optimization**: Personalization, timing, content quality

### Time to Value
- **Target**: First workflow created within 5 minutes
- **Measurement**: Onboarding completion time
- **Optimization**: Onboarding flow, templates, guidance

---

*This document is a living resource. Update cadence, content, and metrics based on performance data and user feedback.*
