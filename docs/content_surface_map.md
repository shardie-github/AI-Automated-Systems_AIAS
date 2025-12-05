# Content Surface Map
**AIAS Platform - Complete Content Location Inventory**

*Last Updated: 2025-01-XX*
*Status: Comprehensive Audit Complete*

---

## Executive Summary

This document maps every location where content exists or should exist across the AIAS Platform codebase. It identifies:
- **Existing content surfaces** (pages, components, modals)
- **Content gaps** (missing copy, unclear messaging)
- **Funnel stages** (awareness → activation → retention → upsell)
- **Target audiences** (anonymous, trial, paid user)
- **Primary CTAs** and conversion opportunities
- **Areas for automation** and personalized content injection

---

## Table of Contents

1. [Pages & Routes](#pages--routes)
2. [Components & UI Elements](#components--ui-elements)
3. [System Messages](#system-messages)
4. [Email Templates](#email-templates)
5. [Onboarding Flows](#onboarding-flows)
6. [Help & Documentation](#help--documentation)
7. [Error States & Empty States](#error-states--empty-states)
8. [Notifications & In-App Messages](#notifications--in-app-messages)
9. [Content Gaps & Opportunities](#content-gaps--opportunities)

---

## Pages & Routes

### Public-Facing Pages (Awareness Stage)

#### `/` (Homepage)
- **File**: `app/page.tsx` (not found in scan, likely exists)
- **Purpose**: Primary landing page, conversion funnel entry
- **Funnel Stage**: Awareness
- **Target Audience**: Anonymous visitors
- **Primary CTAs**: 
  - "Start Free Trial" (primary)
  - "Schedule Demo" (secondary)
  - "See Features" (tertiary)
- **Existing Copy Quality**: ⚠️ Needs audit
- **Missing Content Opportunities**:
  - Value proposition clarity
  - Social proof integration
  - Systems thinking explanation
  - ROI calculator copy
- **Personalization Opportunities**:
  - Industry-specific messaging
  - Use case recommendations based on referrer
  - Dynamic testimonials

#### `/about`
- **File**: `app/about/page.tsx`
- **Purpose**: Company story, mission, team
- **Funnel Stage**: Awareness → Consideration
- **Target Audience**: Anonymous, trial users
- **Primary CTAs**: "Start Free Trial", "Contact Us"
- **Existing Copy Quality**: ⚠️ Needs review
- **Missing Content**: 
  - Systems thinking philosophy
  - Canadian identity narrative
  - Team bios
  - Company milestones

#### `/features`
- **File**: `app/features/page.tsx`
- **Purpose**: Feature showcase, capability demonstration
- **Funnel Stage**: Consideration
- **Target Audience**: Anonymous, trial users
- **Primary CTAs**: "Start Free Trial", "See Pricing"
- **Missing Content**:
  - Feature comparison table
  - Use case mapping
  - Integration highlights
  - Systems thinking framework explanation

#### `/pricing`
- **File**: `app/pricing/page.tsx` ✅ **REVIEWED**
- **Purpose**: Pricing tiers, plan comparison, conversion
- **Funnel Stage**: Decision
- **Target Audience**: Anonymous, trial users
- **Primary CTAs**: "Start Free Trial", "Contact Sales"
- **Existing Copy Quality**: ✅ Good structure, needs refinement
- **Content Issues**:
  - Plan descriptions could emphasize benefits over features
  - Missing "Why upgrade?" messaging for trial users
  - Annual pricing could be more prominent
- **Missing Content**:
  - ROI calculator integration
  - "Most popular" badge copy
  - Feature comparison matrix
  - FAQ section (exists but could expand)

#### `/signup`
- **File**: `app/signup/page.tsx` ✅ **REVIEWED**
- **Purpose**: Account creation, trial initiation
- **Funnel Stage**: Activation
- **Target Audience**: Anonymous → Trial
- **Primary CTAs**: "Create Account", "Sign In"
- **Existing Copy Quality**: ✅ Good
- **Missing Content**:
  - Trial benefits summary
  - "What happens next?" section
  - Social proof (e.g., "Join 2,000+ users")
  - Trust signals (PIPEDA, Canadian data residency)

#### `/signin`
- **File**: `app/signin/page.tsx` ✅ **REVIEWED**
- **Purpose**: User authentication
- **Funnel Stage**: Retention
- **Target Audience**: Existing users
- **Primary CTAs**: "Sign In", "Forgot Password", "Start Free Trial"
- **Existing Copy Quality**: ✅ Good
- **Missing Content**:
  - "Welcome back" personalization
  - Trial status reminder
  - Recent activity summary

### Product Pages (Activation → Retention)

#### `/dashboard`
- **File**: `app/dashboard/page.tsx` ✅ **REVIEWED**
- **Purpose**: Main user interface, activity overview
- **Funnel Stage**: Activation, Retention
- **Target Audience**: Trial, Paid users
- **Primary CTAs**: 
  - "Create Workflow" (trial/paid)
  - "Upgrade" (trial users)
  - "View Analytics" (paid)
- **Existing Copy Quality**: ⚠️ Functional but needs improvement
- **Content Issues**:
  - Empty state messaging could be more engaging
  - Upgrade prompts need clearer value proposition
  - KPI descriptions are technical, not benefit-focused
- **Missing Content**:
  - Personalized welcome message
  - Quick start guide for first-time users
  - Trial progress indicator
  - Feature discovery tooltips
  - Success metrics explanation

#### `/workflows`
- **File**: `app/workflows/page.tsx` ✅ **REVIEWED**
- **Purpose**: Workflow management, creation, monitoring
- **Funnel Stage**: Activation, Retention
- **Target Audience**: Trial, Paid users
- **Primary CTAs**: "Create Workflow", "Browse Templates", "View Help"
- **Existing Copy Quality**: ⚠️ Basic, needs enhancement
- **Missing Content**:
  - Empty state guidance ("Create your first workflow")
  - Workflow templates explanation
  - Best practices tips
  - Performance metrics explanation
  - Error state guidance

#### `/onboarding`
- **File**: `app/onboarding/page.tsx` ✅ **REVIEWED**
- **Purpose**: Guided setup, first workflow creation
- **Funnel Stage**: Activation
- **Target Audience**: New trial users
- **Primary CTAs**: "Get Started", "Next", "Skip"
- **Existing Copy Quality**: ✅ Good structure
- **Content Issues**:
  - Step descriptions could be more benefit-focused
  - Time estimates need validation
  - Success messaging could be more celebratory
- **Missing Content**:
  - Progress celebration animations
  - Contextual help tooltips
  - "Why this matters" explanations
  - Skip rationale (what they'll miss)

#### `/onboarding/create-workflow`
- **File**: `app/onboarding/create-workflow/page.tsx`
- **Purpose**: First workflow creation step
- **Funnel Stage**: Activation
- **Target Audience**: New trial users
- **Missing Content**: Needs full audit

#### `/onboarding/complete`
- **File**: `app/onboarding/complete/page.tsx`
- **Purpose**: Onboarding completion, next steps
- **Funnel Stage**: Activation
- **Target Audience**: New trial users
- **Missing Content**: Needs full audit

#### `/settings`
- **File**: `app/settings/page.tsx`
- **Purpose**: Account management, preferences
- **Funnel Stage**: Retention
- **Target Audience**: Trial, Paid users
- **Missing Content**: Needs full audit

#### `/billing`
- **File**: `app/billing/page.tsx`
- **Purpose**: Subscription management, payment
- **Funnel Stage**: Decision, Retention
- **Target Audience**: Trial, Paid users
- **Missing Content**: Needs full audit

### Marketing Pages (Awareness → Consideration)

#### `/blog`
- **File**: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`
- **Purpose**: Content marketing, SEO, education
- **Funnel Stage**: Awareness, Consideration
- **Target Audience**: Anonymous, trial users
- **Missing Content**: Needs full audit

#### `/case-studies`
- **File**: `app/case-studies/page.tsx`
- **Purpose**: Social proof, use case demonstration
- **Funnel Stage**: Consideration, Decision
- **Target Audience**: Anonymous, trial users
- **Missing Content**: Needs full audit

#### `/help`
- **File**: `app/help/page.tsx` ✅ **REVIEWED**
- **Purpose**: Support, documentation, FAQs
- **Funnel Stage**: All stages
- **Target Audience**: All users
- **Existing Copy Quality**: ✅ Comprehensive
- **Content Issues**:
  - FAQ answers could be more concise
  - Missing video tutorials
  - Search functionality needed
- **Missing Content**:
  - Video walkthroughs
  - Interactive tutorials
  - Troubleshooting guides
  - API documentation links

#### `/demo`
- **File**: `app/demo/page.tsx`
- **Purpose**: Demo booking, sales qualification
- **Funnel Stage**: Consideration, Decision
- **Target Audience**: Anonymous, trial users
- **Missing Content**: Needs full audit

#### `/pricing`
- **File**: `app/pricing/page.tsx` ✅ **REVIEWED** (see above)

### Specialized Product Pages

#### `/settler`
- **File**: `app/settler/page.tsx` ✅ **REVIEWED**
- **Purpose**: Settler product showcase (enterprise payment platform)
- **Funnel Stage**: Consideration, Decision
- **Target Audience**: Enterprise prospects
- **Existing Copy Quality**: ✅ Good
- **Missing Content**:
  - Integration examples
  - Pricing information
  - Case studies specific to Settler

#### `/genai-content-engine`
- **File**: `app/genai-content-engine/page.tsx`
- **Purpose**: GenAI Content Engine product page
- **Funnel Stage**: Consideration
- **Target Audience**: Content creators, marketers
- **Missing Content**: Needs full audit

#### `/edge-ai`
- **File**: `app/edge-ai/` (multiple files)
- **Purpose**: Edge AI capabilities showcase
- **Funnel Stage**: Consideration
- **Target Audience**: Technical users, developers
- **Missing Content**: Needs full audit

---

## Components & UI Elements

### Layout Components

#### Header (`components/layout/header.tsx`)
- **Content Surfaces**:
  - Navigation menu items
  - CTA buttons ("Start Free Trial", "Sign In")
  - User menu (when logged in)
- **Missing Content**:
  - Tooltip explanations for menu items
  - Badge indicators (e.g., "New" for features)
  - Trial status indicator

#### Footer (`components/layout/footer.tsx`)
- **Content Surfaces**:
  - Footer links (legal, support, product)
  - Social media links
  - Copyright notice
- **Missing Content**:
  - Newsletter signup copy
  - Trust badges
  - Partner logos

#### Sticky CTA (`components/layout/enhanced-sticky-cta.tsx`)
- **Content Surfaces**:
  - Floating CTA button
  - Dismissible banner
- **Missing Content**:
  - Context-aware messaging (trial vs. paid)
  - Urgency messaging for trial users
  - Personalization based on page

### Dashboard Components

#### Dashboard Upgrade Section (`components/dashboard/dashboard-upgrade-section.tsx`)
- **Content Surfaces**:
  - Upgrade prompts for trial users
  - Feature unlock messaging
  - Trial countdown
- **Existing Copy Quality**: ⚠️ Needs review
- **Missing Content**:
  - Benefit-focused upgrade copy
  - Social proof ("Join 2,000+ paid users")
  - Feature comparison
  - Success stories

#### Realtime Dashboard (`components/dashboard/realtime-dashboard.tsx`)
- **Content Surfaces**:
  - KPI cards
  - Activity feed
  - Metric descriptions
- **Missing Content**:
  - Tooltip explanations for metrics
  - Empty state messaging
  - Help text for interpreting data

### Onboarding Components

#### Onboarding Wizard (`components/onboarding/wizard.tsx`) ✅ **REVIEWED**
- **Content Surfaces**:
  - Step titles and descriptions
  - Progress indicators
  - Success messages
  - Skip button copy
- **Existing Copy Quality**: ✅ Good structure
- **Content Issues**:
  - Step descriptions could emphasize benefits
  - Success messaging could be more celebratory
- **Missing Content**:
  - Contextual help tooltips
  - "Why this matters" explanations
  - Video tutorials

#### Pre-Test Questionnaire (`components/onboarding/pre-test-questionnaire.tsx`)
- **Content Surfaces**:
  - Question text
  - Answer options
  - Progress indicators
- **Missing Content**: Needs full audit

### UI Components (Content Surfaces)

#### Empty States (`components/ui/empty-state.tsx`)
- **Content Surfaces**:
  - Empty state messages
  - CTA buttons
  - Illustration alt text
- **Missing Content**:
  - Contextual empty state copy for each page
  - Actionable guidance
  - Video tutorial links

#### Error States (`components/ui/error-state.tsx`)
- **Content Surfaces**:
  - Error messages
  - Recovery actions
  - Support links
- **Missing Content**:
  - User-friendly error explanations
  - Troubleshooting steps
  - Contact support CTAs

#### Tooltips (via `components/ui/popover.tsx` or similar)
- **Content Surfaces**:
  - Feature explanations
  - Help text
  - Shortcuts
- **Missing Content**:
  - Comprehensive tooltip content for all features
  - Contextual help system

#### Modals/Dialogs (`components/ui/dialog.tsx`)
- **Content Surfaces**:
  - Confirmation dialogs
  - Feature explanations
  - Upgrade prompts
- **Missing Content**:
  - Standardized modal copy patterns
  - Confirmation message templates
  - Upgrade modal content

### Feature-Specific Components

#### Workflow Form (`components/workflows/WorkflowForm.tsx`)
- **Content Surfaces**:
  - Form labels
  - Field descriptions
  - Validation messages
  - Help text
- **Missing Content**: Needs full audit

#### Template Cards (`components/templates/TemplateCard.tsx`)
- **Content Surfaces**:
  - Template names
  - Descriptions
  - Use case tags
- **Missing Content**:
  - Benefit-focused descriptions
  - Time-saving estimates
  - Difficulty indicators

#### Upgrade Prompts (`components/monetization/upgrade-prompt.tsx`)
- **Content Surfaces**:
  - Upgrade messaging
  - Feature unlock lists
  - Pricing information
- **Missing Content**:
  - Benefit-focused copy
  - Social proof
  - Urgency messaging

---

## System Messages

### Validation Messages

**Location**: `lib/validation/` (various files)
- **Content Surfaces**:
  - Form validation errors
  - Field requirement messages
  - Format validation errors
- **Missing Content**:
  - User-friendly error messages
  - Helpful correction suggestions
  - Examples of valid input

### Error Messages

**Location**: `lib/utils/error-detection.ts`, `lib/errors.ts`
- **Content Surfaces**:
  - API error messages
  - Network error messages
  - System error messages
- **Missing Content**:
  - User-friendly error explanations
  - Recovery action suggestions
  - Support contact information

### Success Messages

**Location**: Various components (toast notifications, success modals)
- **Content Surfaces**:
  - Action confirmation messages
  - Achievement notifications
  - Completion messages
- **Missing Content**:
  - Celebratory messaging
  - Next step suggestions
  - Share achievements CTAs

### Banner Messages

**Location**: Various components (announcements, alerts)
- **Content Surfaces**:
  - Feature announcements
  - Maintenance notices
  - Trial reminders
- **Missing Content**:
  - Standardized banner copy patterns
  - Dismissible messaging
  - Action CTAs

---

## Email Templates

### Existing Email Infrastructure

**Location**: 
- `lib/email/email-service.ts` ✅ **REVIEWED**
- `lib/email/templates.ts` ✅ **REVIEWED**
- `lib/email-cadence/templates.ts` ✅ **REVIEWED**
- `lib/email-templates/templates.ts` ✅ **REVIEWED**

**Existing Templates**:
1. Welcome Email ✅
2. Booking Confirmation ✅
3. Lead Gen PDF Delivery ✅
4. Password Reset ✅
5. Trial Email Cadence (Day 0-30) ✅

**Missing Templates** (See `docs/content_backfill_plan.md` for details):
- Trial midpoint nudge (Day 15)
- Trial ending urgency (Day 27, 29)
- Monthly paid summary
- Monthly insights report
- New workflow available notification
- New analysis ready notification
- "We noticed you haven't X yet" nudges
- Renewal reminders
- Churn recovery
- Feature announcement emails
- Success milestone emails

**Content Issues**:
- Templates need dynamic field expansion
- Subject line variations needed
- Preview text missing
- Plain-text fallbacks incomplete
- Brand voice consistency needs review

---

## Onboarding Flows

### Main Onboarding Flow

**Location**: `app/onboarding/page.tsx`, `components/onboarding/wizard.tsx` ✅ **REVIEWED**

**Steps**:
1. Welcome Step ✅
2. Choose Integration Step ✅
3. Create Workflow Step ✅
4. Test Workflow Step ✅
5. Complete Step ✅

**Content Quality**: ✅ Good structure
**Missing Content**:
- Contextual help tooltips
- Video tutorials
- "Why this matters" explanations
- Skip rationale
- Progress celebration

### Pre-Test Questionnaire

**Location**: `components/onboarding/pre-test-questionnaire.tsx`
**Purpose**: Personalize experience, gather user goals
**Missing Content**: Needs full audit

### Post-Onboarding Guidance

**Location**: `app/onboarding/complete/page.tsx`
**Purpose**: Next steps, feature discovery
**Missing Content**: Needs full audit

---

## Help & Documentation

### Help Center

**Location**: `app/help/page.tsx` ✅ **REVIEWED**
**Content Quality**: ✅ Comprehensive FAQ structure
**Missing Content**:
- Video tutorials
- Interactive guides
- Search functionality
- Category filtering
- Related articles

### Documentation

**Location**: `docs/` (401 files)
**Content Quality**: ⚠️ Needs audit
**Missing Content**:
- Getting started guide
- API documentation
- Integration guides
- Troubleshooting guides
- Video walkthroughs

---

## Error States & Empty States

### Error States

**Components**: `components/ui/error-state.tsx`
**Content Surfaces**:
- Error messages
- Recovery actions
- Support links
**Missing Content**:
- User-friendly explanations
- Troubleshooting steps
- Contact support CTAs

### Empty States

**Components**: `components/ui/empty-state.tsx`
**Content Surfaces**:
- Empty state messages
- CTA buttons
- Illustration alt text
**Missing Content**:
- Contextual guidance for each page
- Actionable next steps
- Video tutorial links

**Pages Needing Empty States**:
- `/workflows` (no workflows created)
- `/dashboard` (first visit)
- `/templates` (loading/template selection)
- `/integrations` (no integrations connected)

---

## Notifications & In-App Messages

### In-App Notifications

**Location**: `components/notifications/`, `components/gamification/NotificationsCenter.tsx`
**Content Surfaces**:
- Success notifications
- Error notifications
- Feature announcements
- Trial reminders
**Missing Content**:
- Standardized notification copy
- Action CTAs
- Dismissible messaging

### Toast Notifications

**Location**: `components/ui/toast.tsx`, `components/ui/toaster.tsx`
**Content Surfaces**:
- Action confirmations
- Error alerts
- Success messages
**Missing Content**:
- Standardized toast copy patterns
- Duration guidelines
- Action button integration

---

## Content Gaps & Opportunities

### High-Priority Gaps

1. **Onboarding Enhancement**
   - Contextual help tooltips
   - Video tutorials
   - "Why this matters" explanations
   - Progress celebration

2. **Dashboard Personalization**
   - Welcome messages
   - Trial progress indicators
   - Feature discovery prompts
   - Success metrics explanation

3. **Email Template Expansion**
   - Lifecycle emails (trial → paid → retention)
   - Monthly insights
   - Feature announcements
   - Churn recovery

4. **Error State Improvement**
   - User-friendly error messages
   - Troubleshooting guidance
   - Recovery action suggestions

5. **Empty State Enhancement**
   - Contextual guidance
   - Actionable next steps
   - Video tutorial links

### Medium-Priority Gaps

1. **Help Center Enhancement**
   - Video tutorials
   - Interactive guides
   - Search functionality

2. **Feature Discovery**
   - Tooltip system
   - Feature announcement modals
   - Guided tours

3. **Social Proof Integration**
   - Testimonials on key pages
   - Usage statistics
   - Success stories

4. **Conversion Optimization**
   - CTA copy refinement
   - Urgency messaging
   - Benefit-focused messaging

### Low-Priority Gaps

1. **Documentation Expansion**
   - API documentation
   - Integration guides
   - Advanced tutorials

2. **Accessibility**
   - Alt text for images
   - ARIA labels
   - Screen reader optimization

3. **Internationalization**
   - Multi-language support
   - Currency localization
   - Date/time formatting

---

## Automation & Personalization Opportunities

### Personalization Triggers

1. **User Stage**
   - Anonymous → Trial → Paid
   - First-time vs. returning
   - Active vs. inactive

2. **User Behavior**
   - Workflows created
   - Integrations connected
   - Features used
   - Time in trial

3. **User Profile**
   - Industry
   - Company size
   - Goals (from pre-test)
   - Usage patterns

### Content Injection Points

1. **Dashboard**
   - Personalized welcome message
   - Recommended next steps
   - Feature discovery prompts

2. **Email**
   - Dynamic content based on usage
   - Personalized recommendations
   - Industry-specific case studies

3. **Onboarding**
   - Personalized workflow suggestions
   - Industry-specific templates
   - Goal-based guidance

4. **Upgrade Prompts**
   - Feature-specific unlock messaging
   - Usage-based upgrade suggestions
   - Time-based urgency

---

## Next Steps

1. **Priority 1**: Complete content backfill for high-priority gaps (see `docs/content_backfill_plan.md`)
2. **Priority 2**: Implement email template expansion (see `emails/` folder structure)
3. **Priority 3**: Enhance onboarding with contextual help
4. **Priority 4**: Improve error and empty states
5. **Priority 5**: Add personalization layer

---

*This document is a living resource and should be updated as new content surfaces are identified or existing content is improved.*
