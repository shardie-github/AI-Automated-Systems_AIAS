# Content & Jargon Audit Report

**Date:** 2025-01-27  
**Purpose:** Comprehensive audit of marketing site and app content for clarity, brevity, and conversion optimization

---

## Executive Summary

The current site has strong technical content but suffers from:
- **Excessive jargon**: "Systems thinking" repeated 50+ times, creating academic tone
- **Verbosity**: Long paragraphs explaining concepts that could be simplified
- **Unclear value proposition**: Mixing consultancy services (custom builds) with SaaS platform
- **Trial inconsistency**: Mentions "14-day free trial" but should be "30-day" per requirements
- **No content gating**: All information freely available, reducing upgrade motivation
- **Multiple competing CTAs**: Not focused on single primary action

---

## Page Inventory & Funnel Mapping

### Top-of-Funnel (Awareness)

| Route | Purpose | Primary CTA | Secondary CTAs | Funnel Stage |
|-------|---------|--------------|----------------|--------------|
| `/` (Homepage) | Main landing, value prop | "Schedule Free Strategy Call" | "See Our Builds", "Try AIAS Free" | Awareness |
| `/about` | Company story, credibility | "Schedule Strategy Call" | "Email Support" | Awareness |
| `/features` | Feature showcase | "Learn About Systems Thinking", "Book Consultation" | None | Consideration |
| `/systems-thinking` | Educational content | "Try GenAI Content Engine", "Book Consultation" | None | Consideration |
| `/rss-news` | News feed (should be free tier) | "View Blog Articles", "Get Daily Updates" | None | Awareness/Consideration |

### Mid-Funnel (Consideration)

| Route | Purpose | Primary CTA | Secondary CTAs | Funnel Stage |
|-------|---------|--------------|----------------|--------------|
| `/pricing` | Pricing & plans | "Start Free Trial" (inconsistent - says 14-day) | "Contact Sales" | Conversion |
| `/compare` | Competitive comparison | "Start Free Trial" | None | Consideration |
| `/case-studies` | Social proof | "Start Free Trial" | None | Consideration |
| `/demo` | Demo request | "Start Free Trial" | None | Consideration |
| `/integrations` | Integration showcase | "Start Free Trial" | None | Consideration |

### Bottom-of-Funnel (Conversion)

| Route | Purpose | Primary CTA | Secondary CTAs | Funnel Stage |
|-------|---------|--------------|----------------|--------------|
| `/signup` | Account creation | "Create Account" | "Sign in" | Conversion |
| `/signin` | Login | "Sign in" | "Start your free trial" | Post-signup |
| `/onboarding` | First-time setup | Complete wizard | None | Activation |

### Post-Signup (Retention/Expansion)

| Route | Purpose | Primary CTA | Secondary CTAs | Funnel Stage |
|-------|---------|--------------|----------------|--------------|
| `/dashboard` | Main app dashboard | None (should have upgrade prompts) | None | Retention |
| `/workflows` | Workflow management | None (should gate advanced features) | None | Retention |
| `/rss-news` | News feed (should be personalized for paid) | None (should prompt upgrade) | None | Retention |
| `/billing` | Subscription management | "Subscribe" | None | Expansion |

---

## Jargon & Verbosity Analysis

### Critical Issues by Page

#### 1. Homepage (`/app/page.tsx` + `components/home/enhanced-hero.tsx`)

**Issues:**
- Hero headline: "Custom AI Platforms That Transform Your Business" - too generic
- Subheadline: 3-line paragraph explaining consultancy vs platform - too much detail upfront
- "Systems thinking" mentioned in features section - jargon-heavy
- Value props are feature-focused, not benefit-focused

**Location:** `components/home/enhanced-hero.tsx:103-106`
```typescript
We don't sell software. We architect, build, and deploy{" "}
<span className="text-foreground font-bold">custom AI solutions</span> — 
from TikTok analytics platforms to e-commerce automation ecosystems.
```

**Issue Type:** Verbosity, unclear benefits  
**Target:** 1-2 short sentences, benefit-first  
**Suggested:** "Save 10+ hours per week with AI automation. Start your 30-day free trial."

---

#### 2. Features Page (`/app/features/page.tsx`)

**Issues:**
- Title: "Systems Thinking + AI: The Complete Solution" - jargon-heavy
- Repeated "Systems thinking is THE critical skill" - academic tone
- Long paragraphs explaining concepts
- No clear differentiation between free/paid features

**Location:** `app/features/page.tsx:15-36`
```typescript
{
  title: "Systems Thinking Framework",
  description: "THE critical skill for the AI age. Analyze problems from multiple perspectives.",
  features: [
    {
      name: "6-Perspective Analysis",
      description: "Every challenge analyzed through process, technology, people, data, systems, AND automation. Systems thinking reveals optimal solutions.",
    },
```

**Issue Type:** Jargon, verbosity, unclear benefits  
**Target:** Grade 7-9 reading level, 2-3 short bullets max  
**Suggested:** "See problems from all angles. Find root causes, not symptoms. Design solutions that actually work."

---

#### 3. Systems Thinking Page (`/app/systems-thinking/page.tsx`)

**Issues:**
- Entire page is jargon-heavy educational content
- Should be gated or significantly simplified
- "THE critical skill" repeated 10+ times
- Academic tone throughout

**Location:** `app/systems-thinking/page.tsx:15-25`
```typescript
<h1 className="text-4xl md:text-5xl font-bold mb-4">
  Systems Thinking: The Critical Skill for the AI Age
</h1>
<p className="text-lg text-muted-foreground max-w-3xl mx-auto">
  Systems thinking is THE skill needed more than ever in the AI age. It's what makes you stand out in the job market, 
  succeed in business, and achieve optimal outcomes.
</p>
```

**Issue Type:** Jargon, verbosity, should be gated  
**Target:** Teaser only for free, full content for paid  
**Recommendation:** Gate 80% of this content behind paid subscription

---

#### 4. Pricing Page (`/app/pricing/page.tsx`)

**Issues:**
- Inconsistent trial length: Says "14-day free trial" but requirements specify 30-day
- Free plan description too detailed (giving away value)
- No clear "what you get vs. what you unlock" comparison
- Missing consulting time mention

**Location:** `app/pricing/page.tsx:103`
```typescript
14-day free trial
```

**Issue Type:** Inconsistency, missing value prop  
**Target:** "30-day free trial" + mention consulting time  
**Fix Required:** Update all instances of "14-day" to "30-day"

---

#### 5. About Page (`/app/about/page.tsx`)

**Issues:**
- Entire first section is jargon-heavy "Systems Thinking" explanation
- Long paragraphs (4-5 sentences each)
- Academic tone
- Should be simplified and benefit-focused

**Location:** `app/about/page.tsx:35-56`
```typescript
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
```

**Issue Type:** Jargon, verbosity  
**Target:** 2-3 short paragraphs, benefit-first  
**Suggested:** "We help businesses automate repetitive tasks and make better decisions. Our AI tools save time, reduce errors, and free you to focus on what matters."

---

#### 6. RSS News Feed (`/app/rss-news/page.tsx`)

**Issues:**
- Currently fully accessible (should be free tier feature)
- No personalization mentioned (should be paid feature)
- "Systems thinking analysis" jargon in description

**Location:** `app/rss-news/page.tsx:67-69`
```typescript
Curated AI and tech news from top sources, analyzed through systems thinking. 
<strong className="text-foreground"> Editorial takes + open discussion.</strong> Get daily insights on AI, automation, and technology with systems thinking perspectives.
```

**Issue Type:** Jargon, no gating  
**Target:** Simple news feed for free, personalized for paid  
**Recommendation:** Keep basic feed free, gate personalization and advanced analysis

---

#### 7. FAQ Component (`components/home/faq.tsx`)

**Issues:**
- Mixes consultancy and platform questions (confusing)
- Long answers (3-4 sentences)
- Too much process detail

**Location:** `components/home/faq.tsx:17-19`
```typescript
{
  question: "What's the difference between AIAS Consultancy and AIAS Platform?",
  answer: "AIAS Consultancy builds custom AI platforms from scratch (like TokPulse and Hardonia Suite). We architect, develop, and deploy complete solutions tailored to your business. AIAS Platform is our SaaS product for businesses that want ready-made automation tools. Think of it as: Consultancy = custom builds, Platform = ready-to-use software.",
},
```

**Issue Type:** Verbosity, confusion  
**Target:** 1-2 sentences max  
**Suggested:** "AIAS Platform is ready-to-use automation software. Our consultancy builds custom platforms from scratch."

---

#### 8. Testimonials (`components/home/testimonials.tsx`)

**Issues:**
- Testimonials mention "systems thinking" jargon
- Mix consultancy and platform testimonials (confusing)
- Long quotes

**Location:** `components/home/testimonials.tsx:32-33`
```typescript
quote: "Systems thinking is what sets AIAS apart. They didn't just automate my processes — they analyzed my entire system from multiple perspectives, found root causes, and designed a holistic solution. This is THE skill needed in the AI age, and it made all the difference.",
```

**Issue Type:** Jargon in social proof  
**Target:** Benefit-focused testimonials  
**Recommendation:** Rewrite to focus on outcomes (time saved, revenue increased, errors reduced)

---

## Top 10 Sections Needing Rewrite (Prioritized)

1. **Homepage Hero** (`components/home/enhanced-hero.tsx:103-106`)
   - **Issue:** Verbose, unclear value prop
   - **Priority:** Critical (first impression)
   - **Action:** Simplify to benefit-first, single CTA

2. **Pricing Page Trial Length** (`app/pricing/page.tsx:103`)
   - **Issue:** Says "14-day" but should be "30-day"
   - **Priority:** Critical (conversion blocker)
   - **Action:** Update all instances to "30-day"

3. **Features Page Headline** (`app/features/page.tsx:182`)
   - **Issue:** "Systems Thinking + AI" jargon-heavy
   - **Priority:** High (consideration stage)
   - **Action:** Simplify to benefit-focused

4. **Systems Thinking Page** (`app/systems-thinking/page.tsx`)
   - **Issue:** Entire page is jargon, should be gated
   - **Priority:** High (giving away value)
   - **Action:** Gate 80% behind paid, simplify teaser

5. **About Page Mission** (`app/about/page.tsx:35-56`)
   - **Issue:** Academic tone, jargon-heavy
   - **Priority:** Medium (credibility but not conversion-critical)
   - **Action:** Simplify to 2-3 benefit-focused paragraphs

6. **FAQ Answers** (`components/home/faq.tsx`)
   - **Issue:** Too verbose, mixes services
   - **Priority:** Medium (reduces friction)
   - **Action:** Shorten to 1-2 sentences each

7. **RSS News Description** (`app/rss-news/page.tsx:67-69`)
   - **Issue:** Jargon in free feature
   - **Priority:** Medium (should be simple)
   - **Action:** Remove jargon, clarify free vs paid

8. **Testimonials** (`components/home/testimonials.tsx:32-33`)
   - **Issue:** Jargon in social proof
   - **Priority:** Medium (social proof important)
   - **Action:** Rewrite to focus on outcomes

9. **Conversion CTA** (`components/home/conversion-cta.tsx:73-78`)
   - **Issue:** Mentions "14-day" trial
   - **Priority:** High (conversion-critical)
   - **Action:** Update to "30-day"

10. **Signup Page** (`app/signup/page.tsx:24`)
    - **Issue:** Says "14-day free trial"
    - **Priority:** Critical (conversion page)
    - **Action:** Update to "30-day"

---

## Clarity & Benefit Mapping

### Homepage
- **What it's trying to make visitor believe:** "We build custom AI platforms and offer a SaaS product"
- **Main benefit in one sentence:** "Save 10+ hours per week with AI automation"
- **Is this obvious?** ❌ No - too much information, unclear value

### Pricing Page
- **What it's trying to make visitor believe:** "Affordable automation starting at $49/month"
- **Main benefit in one sentence:** "Get unlimited automations for less than competitors charge for 5"
- **Is this obvious?** ⚠️ Partially - pricing is clear but trial length inconsistent

### Features Page
- **What it's trying to make visitor believe:** "Systems thinking + AI is powerful"
- **Main benefit in one sentence:** "Automate workflows and make better decisions"
- **Is this obvious?** ❌ No - too much jargon, unclear practical benefits

### Systems Thinking Page
- **What it's trying to make visitor believe:** "Systems thinking is a critical skill"
- **Main benefit in one sentence:** "Learn to solve problems more effectively"
- **Is this obvious?** ❌ No - entire page is educational, not benefit-focused

---

## Recommendations Summary

1. **Simplify language:** Replace "systems thinking" jargon with benefit-focused copy
2. **Shorten paragraphs:** Max 2-3 sentences, Grade 7-9 reading level
3. **Gate educational content:** Move detailed frameworks/templates behind paid
4. **Standardize trial:** Update all "14-day" references to "30-day"
5. **Focus CTAs:** Single primary action: "Start 30-Day Free Trial"
6. **Clarify value prop:** Separate consultancy from platform messaging
7. **Add content gating:** Implement feature flags for free vs paid content
8. **Simplify testimonials:** Focus on outcomes, not methodology

---

## Next Steps

See `docs/funnel_strategy.md` for Phase 2: Funnel + segmentation strategy.
