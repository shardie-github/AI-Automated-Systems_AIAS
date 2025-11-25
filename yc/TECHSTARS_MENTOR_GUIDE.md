# Techstars Mentor Guide — AIAS Platform

**Last Updated:** 2025-01-29  
**Purpose:** Quick onboarding for Techstars mentors to understand the product, metrics, and how they can help

---

## 1-Page Problem/Solution Summary

### The Problem
Canadian small and medium businesses (SMBs) waste **10-30 hours per week** on repetitive manual tasks (order processing, lead qualification, proposal writing). They can't afford enterprise automation tools ($150-500/month), and existing solutions like Zapier are too expensive ($50/month for just 5 automations) or too complex.

### The Solution
AIAS Platform is an enterprise-grade automation platform built specifically for Canadian SMBs:
- **Visual workflow builders** — drag, drop, connect (no coding)
- **Pre-built templates** — Shopify order automation, lead qualification, proposal generation
- **Canadian-first integrations** — Shopify, Wave Accounting, RBC, TD, Interac (20+ integrations)
- **Affordable pricing** — $49/month starter plan (vs. $150-500 competitors)
- **Enterprise security** — SOC 2, GDPR, PIPEDA compliance built-in

### Target Market
- **Beachhead:** Canadian e-commerce SMBs (Shopify store owners) — 100K+ stores in Canada
- **Expansion:** Independent consultants, real estate agents, other SMBs
- **Market Size:** 500K+ Canadian SMBs

---

## Key Metrics Definitions & Current Values

### Usage Metrics
- **DAU (Daily Active Users):** Users who performed any action in last 24 hours
  - *Current:* [Tracked via `user_activations.last_active_at`]
  - *Target:* 100+ DAU by end of Q1
  
- **WAU (Weekly Active Users):** Users active in last 7 days
  - *Current:* [Tracked via `pmf_metrics_snapshots.weekly_active_users`]
  - *Target:* 500+ WAU by end of Q1

- **MAU (Monthly Active Users):** Users active in last 30 days
  - *Current:* [Tracked via `pmf_metrics_snapshots.monthly_active_users`]
  - *Target:* 2,000+ MAU by end of Q1

### Activation Metrics
- **Activation Rate:** % of signups who create their first workflow within 7 days
  - *Definition:* User creates and executes at least one workflow
  - *Current:* [Tracked via `user_activations.first_workflow_created_at`]
  - *Target:* 40%+ activation rate

- **Time-to-Activation:** Average days from signup to first workflow execution
  - *Current:* [Calculated from signup_date to first_workflow_created_at]
  - *Target:* < 2 days

### Revenue Metrics
- **MRR (Monthly Recurring Revenue):** Total monthly subscription revenue
  - *Current:* [Query Stripe subscriptions]
  - *Target:* $10K MRR by end of Q1

- **ARPU (Average Revenue Per User):** MRR / Paying Customers
  - *Current:* [Calculated from Stripe data]
  - *Target:* $49/month (Starter plan)

- **Paying Customers:** Users with active paid subscriptions
  - *Current:* [Query Stripe active subscriptions]
  - *Target:* 200+ paying customers by end of Q1

### Growth Metrics
- **Signups:** New user registrations per week
  - *Current:* [Tracked via `profiles.created_at`]
  - *Target:* 50+ signups/week

- **Conversion Rate (Free → Paid):** % of free users who upgrade to paid
  - *Current:* [Tracked via Stripe checkout events]
  - *Target:* 10%+ conversion rate

- **CAC (Customer Acquisition Cost):** Marketing spend / new customers
  - *Current:* [Tracked via UTM parameters and marketing spend]
  - *Target:* < $75 CAC

- **LTV:CAC Ratio:** Lifetime Value / Customer Acquisition Cost
  - *Current:* [Calculated from ARPU, churn, and CAC]
  - *Target:* 3:1 or better

### Retention Metrics
- **Monthly Churn Rate:** % of paying customers who cancel per month
  - *Current:* [Tracked via Stripe subscription cancellations]
  - *Target:* < 5% monthly churn

- **Retention Rate (30-day):** % of users active 30 days after signup
  - *Current:* [Tracked via `user_activations.last_active_at`]
  - *Target:* 50%+ retention

---

## Weekly Experiment Cadence

### Experiment Process
1. **Hypothesis:** "We believe [X] will [Y] for [Z]"
2. **Test:** Run experiment (A/B test, feature test, channel test)
3. **Measure:** Track key metrics (conversion, activation, retention)
4. **Learn:** Document results and decide: scale, iterate, or kill

### Current Experiments Running
- **Experiment 1:** A/B test onboarding flow (control vs. optimized)
  - *Status:* Planned
  - *Metrics:* Activation rate, time-to-activation
  - *Timeline:* 2 weeks

- **Experiment 2:** Test referral rewards (XP vs. credits vs. commission)
  - *Status:* Planned
  - *Metrics:* Referral rate, referral conversions
  - *Timeline:* 2 weeks

- **Experiment 3:** Test pricing page copy (features vs. benefits vs. social proof)
  - *Status:* Planned
  - *Metrics:* Conversion rate (free → paid)
  - *Timeline:* 2 weeks

### Weekly Experiment Goal
- **Target:** 2 experiments per week
- **Format:** 1 growth experiment + 1 product experiment
- **Documentation:** All experiments documented in `yc/EXPERIMENT_CADENCE.md`

---

## Top 3 Questions Mentors Can Help With

### 1. Distribution & Growth
**Question:** "How do we scale user acquisition beyond Shopify App Store and SEO?"

**What We Need:**
- Advice on which channels to prioritize (paid ads, partnerships, content marketing)
- Introductions to potential partners (Shopify, Wave Accounting, Canadian business associations)
- Feedback on growth experiments and which ones to double down on

**Current Status:**
- Shopify App Store: Planned (not yet listed)
- SEO: Partially implemented (blog exists, need SEO landing pages)
- Referrals: Implemented (referral system exists)
- Paid Ads: Not yet tested

---

### 2. Product-Market Fit & Activation
**Question:** "How do we improve activation rate and reduce time-to-value?"

**What We Need:**
- Feedback on onboarding flow (is it too complex? too simple?)
- Advice on "aha moment" design (when do users realize value?)
- Ideas for reducing friction in workflow creation

**Current Status:**
- Onboarding wizard exists (5 steps)
- Activation tracking implemented
- Need to optimize for faster time-to-value

---

### 3. Unit Economics & Pricing
**Question:** "Are our unit economics sustainable? Should we adjust pricing?"

**What We Need:**
- Validation that $49/month pricing is right for Canadian SMBs
- Advice on pricing strategy (freemium vs. free trial vs. paid-only)
- Feedback on LTV:CAC targets and whether 3:1 is realistic

**Current Status:**
- Pricing: $0 (Free), $49 (Starter), $149 (Pro)
- Unit economics: Not yet validated (need real customer data)
- CAC: Not yet calculated (need marketing spend tracking)

---

## How to Use This Guide

1. **First Meeting:** Read this 1-page summary
2. **Weekly Updates:** Check `yc/TECHSTARS_WEEKLY_UPDATE.md` for latest metrics and experiments
3. **Deep Dives:** See `yc/YC_GAP_ANALYSIS.md` for detailed gaps and TODOs
4. **Questions:** Use the "Top 3 Questions" section to guide discussions

---

## Key Resources

- **Product Overview:** `yc/YC_PRODUCT_OVERVIEW.md`
- **Problem & Users:** `yc/YC_PROBLEM_USERS.md`
- **Market Vision:** `yc/YC_MARKET_VISION.md`
- **Distribution Plan:** `yc/YC_DISTRIBUTION_PLAN.md`
- **Metrics Checklist:** `yc/YC_METRICS_CHECKLIST.md`
- **Gap Analysis:** `yc/YC_GAP_ANALYSIS.md`

---

## Contact

- **Founders:** [TODO: Add founder contact info]
- **Slack:** [TODO: Add Techstars Slack channel]
- **Email:** support@aias-platform.com
