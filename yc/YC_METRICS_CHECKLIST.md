# YC Metrics Checklist — AIAS Platform

**Generated:** 2025-01-29  
**Status:** Draft — Founders to validate actual metrics

---

## Overview

This document maps YC's metrics expectations to what's currently instrumented in the AIAS Platform codebase. For each metric, we note:
- Whether it's instrumented today
- Where it's instrumented (files/paths)
- If not instrumented, how to add it with minimal changes

**Key Principle:** YC partners want founders to know their numbers cold. Every metric should be:
1. **Defined** (what does "activation" mean?)
2. **Measured** (where is the data?)
3. **Tracked** (dashboard or report)
4. **Acted Upon** (what do you do when it changes?)

---

## A. USAGE METRICS

### 1. Daily Active Users (DAU)

**Definition:**  
Number of unique users who performed any action (workflow execution, page view, API call) in the last 24 hours.

**Current Status:** ✅ **INSTRUMENTED**

**Where:**
- `lib/analytics/metrics.ts` - `getAllActivationMetrics()` includes `uniqueActiveUsers`
- `supabase/migrations/20250128000000_pmf_analytics.sql` - `user_activations` table tracks `last_active_at`
- `lib/telemetry/track.ts` - Tracks `user_active` events

**How It's Calculated:**
```sql
SELECT COUNT(DISTINCT user_id) 
FROM user_activations 
WHERE last_active_at >= NOW() - '1 day'::INTERVAL;
```

**YC Interview Answer:**  
"We track DAU as users who performed any action in the last 24 hours. Currently at [X] DAU, growing [Y]% week-over-week."

**TODO:**
- [ ] Add DAU to admin dashboard (`app/admin/metrics/page.tsx`)
- [ ] Create daily DAU report (email or Slack)
- [ ] Track DAU trends (7-day, 30-day moving averages)

---

### 2. Weekly Active Users (WAU)

**Definition:**  
Number of unique users who performed any action in the last 7 days.

**Current Status:** ✅ **INSTRUMENTED**

**Where:**
- `supabase/migrations/20250128000000_pmf_analytics.sql` - `pmf_metrics_snapshots` table includes `weekly_active_users`
- Calculated in `update_pmf_metrics_snapshot()` function

**How It's Calculated:**
```sql
SELECT COUNT(DISTINCT user_id) 
FROM user_activations 
WHERE last_active_at >= NOW() - '7 days'::INTERVAL;
```

**YC Interview Answer:**  
"We track WAU as users active in the last 7 days. Currently at [X] WAU, with [Y]% weekly retention."

**TODO:**
- [ ] Add WAU to admin dashboard
- [ ] Track WAU/MAU ratio (engagement metric)
- [ ] Compare WAU growth vs. signups (activation quality)

---

### 3. Monthly Active Users (MAU)

**Definition:**  
Number of unique users who performed any action in the last 30 days.

**Current Status:** ✅ **INSTRUMENTED**

**Where:**
- `supabase/migrations/20250128000000_pmf_analytics.sql` - `pmf_metrics_snapshots` table includes `monthly_active_users`
- Calculated in `update_pmf_metrics_snapshot()` function

**How It's Calculated:**
```sql
SELECT COUNT(DISTINCT user_id) 
FROM user_activations 
WHERE last_active_at >= NOW() - '30 days'::INTERVAL;
```

**YC Interview Answer:**  
"We track MAU as users active in the last 30 days. Currently at [X] MAU, growing [Y]% month-over-month."

**TODO:**
- [ ] Add MAU to admin dashboard
- [ ] Track MAU growth rate (MoM %)
- [ ] Compare MAU to total signups (activation rate)

---

### 4. Activation Rate

**Definition:**  
Percentage of signups who complete "activation" (create their first workflow).

**Current Status:** ✅ **INSTRUMENTED**

**Where:**
- `lib/analytics/metrics.ts` - `calculateActivationRate()` function
- `supabase/migrations/20250128000000_pmf_analytics.sql` - `calculate_activation_rate()` SQL function
- `user_activations` table tracks `first_workflow_created_at`

**How It's Calculated:**
```typescript
// From lib/analytics/metrics.ts
const signupCount = signups.length;
const activationCount = activations.length;
return (activationCount / signupCount) * 100;
```

**YC Interview Answer:**  
"We define activation as creating your first workflow. Our activation rate is [X]%, which means [Y]% of signups become active users. Our target is 40%+ (industry benchmark)."

**Current Target:** 40%+ (industry benchmark for SaaS)

**TODO:**
- [ ] Add activation rate to admin dashboard
- [ ] Track activation rate by cohort (signup date)
- [ ] Identify drop-off points (signup → integration → workflow)
- [ ] A/B test onboarding flows to improve activation

---

### 5. Time to Activation

**Definition:**  
Median time from signup to first workflow creation (in hours).

**Current Status:** ✅ **INSTRUMENTED**

**Where:**
- `lib/analytics/metrics.ts` - `calculateTimeToActivation()` function
- `supabase/migrations/20250128000000_pmf_analytics.sql` - `user_activations` table tracks `time_to_activation_hours`

**How It's Calculated:**
```typescript
// Median time from signup to first workflow
const activationTimes = activations.map(a => {
  const signupTime = signup.created_at;
  const activationTime = activation.created_at;
  return activationTime - signupTime;
});
return median(activationTimes);
```

**YC Interview Answer:**  
"Our median time to activation is [X] hours. We're targeting <24 hours (users should see value quickly)."

**Current Target:** <24 hours (quick time-to-value)

**TODO:**
- [ ] Add time-to-activation to admin dashboard
- [ ] Track by user segment (e-commerce vs. consultant vs. real estate)
- [ ] Identify bottlenecks (signup → integration → workflow)
- [ ] Optimize onboarding to reduce time-to-activation

---

### 6. Retention (Day 7, Day 30)

**Definition:**  
Percentage of users who signed up N days ago and are still active today.

**Current Status:** ✅ **INSTRUMENTED**

**Where:**
- `lib/analytics/metrics.ts` - `calculateDay7Retention()` function
- `supabase/migrations/20250128000000_pmf_analytics.sql` - `calculate_retention_rate()` SQL function
- `pmf_metrics_snapshots` table tracks `seven_day_retention` and `thirty_day_retention`

**How It's Calculated:**
```sql
-- Day 7 retention
SELECT COUNT(*) FROM user_activations
WHERE signup_date >= NOW() - '14 days'::INTERVAL
  AND signup_date < NOW() - '7 days'::INTERVAL
  AND last_active_at >= NOW() - '7 days'::INTERVAL;
```

**YC Interview Answer:**  
"Our Day 7 retention is [X]%, Day 30 retention is [Y]%. Industry benchmark is 40%+ Day 7, 20%+ Day 30 for SaaS."

**Current Targets:**
- Day 7: 40%+ (industry benchmark)
- Day 30: 20%+ (industry benchmark)

**TODO:**
- [ ] Add retention metrics to admin dashboard
- [ ] Track retention by cohort (signup date)
- [ ] Identify retention drivers (what makes users stick?)
- [ ] A/B test features to improve retention

---

### 7. Engagement (Workflows per User, Executions per User)

**Definition:**  
- Workflows per User: Average number of workflows created per active user
- Executions per User: Average number of workflow executions per active user

**Current Status:** ✅ **PARTIALLY INSTRUMENTED**

**Where:**
- `supabase/migrations/20250128000000_pmf_analytics.sql` - `user_activations` table tracks `workflows_created`
- `pmf_metrics_snapshots` table tracks `workflows_per_user`
- `lib/analytics/metrics.ts` - `getFunnelMetrics()` includes `workflows` count

**Missing:**
- Workflow executions tracking (how many times workflows run)
- Executions per user metric

**How It's Calculated:**
```sql
-- Workflows per user
SELECT AVG(workflows_created) 
FROM user_activations 
WHERE signup_date >= NOW() - '30 days'::INTERVAL;
```

**YC Interview Answer:**  
"Our average user creates [X] workflows and executes [Y] workflows per month. Power users (>5 workflows) have [Z]% higher retention."

**TODO:**
- [ ] Track workflow executions (`workflow_executions` table exists, need to count)
- [ ] Add executions per user metric
- [ ] Identify power users (>5 workflows) and their retention
- [ ] Track engagement trends (workflows per user over time)

---

## B. GROWTH & ACQUISITION

### 8. Signups (Total, New Signups per Day/Week/Month)

**Definition:**  
Total number of user signups and new signups per period.

**Current Status:** ✅ **INSTRUMENTED**

**Where:**
- `lib/analytics/metrics.ts` - `getFunnelMetrics()` includes `signups`
- `supabase/migrations/20250128000000_pmf_analytics.sql` - `user_activations` table tracks `signup_date`
- `lib/telemetry/track.ts` - Tracks `user_signed_up` events

**How It's Calculated:**
```typescript
// From lib/analytics/metrics.ts
const signups = await supabase
  .from("telemetry_events")
  .select("user_id")
  .eq("type", "user_signed_up")
  .gte("created_at", startDate.toISOString());
```

**YC Interview Answer:**  
"We have [X] total signups, with [Y] new signups this week. Our signup growth rate is [Z]% week-over-week."

**TODO:**
- [ ] Add signup trends to admin dashboard (daily, weekly, monthly)
- [ ] Track signups by channel (Shopify App Store, SEO, referrals)
- [ ] Identify signup drop-off points (visitor → signup → activation)

---

### 9. Conversion Funnel (Visitor → Signup → Activation → Paying)

**Definition:**  
Conversion rates at each stage of the funnel:
- Visitor → Signup: % of visitors who sign up
- Signup → Activation: % of signups who activate (create workflow)
- Activation → Paying: % of activated users who become paying customers

**Current Status:** ✅ **PARTIALLY INSTRUMENTED**

**Where:**
- `lib/analytics/metrics.ts` - `getFunnelMetrics()` tracks signups, integrations, workflows, activations
- `supabase/migrations/20250128000000_pmf_analytics.sql` - `conversion_events` table tracks funnel events
- `lib/analytics/conversion-tracking.ts` - Tracks conversion events

**Missing:**
- Visitor tracking (need to add page view tracking)
- Paying customer tracking (need to link activations to subscriptions)

**How It's Calculated:**
```typescript
// From lib/analytics/metrics.ts
const funnel = {
  signups: signupCount,
  integrations: integrationCount,
  workflows: workflowCount,
  activations: activationCount,
};
```

**YC Interview Answer:**  
"Our funnel: [X]% visitor → signup, [Y]% signup → activation, [Z]% activation → paying. Our biggest drop-off is at [stage], so we're focusing on [improvement]."

**Current Targets:**
- Visitor → Signup: 2-5% (industry benchmark)
- Signup → Activation: 40%+ (industry benchmark)
- Activation → Paying: 10-20% (SaaS benchmark)

**TODO:**
- [ ] Add page view tracking (visitor → signup conversion)
- [ ] Link activations to subscriptions (activation → paying conversion)
- [ ] Create funnel visualization in admin dashboard
- [ ] Identify drop-off points and optimize

---

### 10. Acquisition Channels

**Definition:**  
Where users come from (Shopify App Store, SEO, referrals, paid ads, etc.).

**Current Status:** ⚠️ **PARTIALLY INSTRUMENTED**

**Where:**
- `components/gamification/ReferralWidget.tsx` - Referral tracking exists
- `supabase/migrations/20250128000000_pmf_analytics.sql` - `affiliate_clicks` table tracks affiliate clicks

**Missing:**
- UTM parameter tracking (source, medium, campaign)
- Channel attribution (first touch, last touch)
- Channel-specific conversion rates

**How It Should Work:**
```typescript
// Track UTM parameters on signup
const signupEvent = {
  type: "user_signed_up",
  properties: {
    source: urlParams.get("utm_source"), // "shopify", "google", "referral"
    medium: urlParams.get("utm_medium"), // "app_store", "organic", "social"
    campaign: urlParams.get("utm_campaign"), // "launch", "black_friday"
  },
};
```

**YC Interview Answer:**  
"Our top channels are: [X]% Shopify App Store, [Y]% SEO, [Z]% referrals. Our CAC is lowest for [channel] at $[amount], highest for [channel] at $[amount]."

**TODO:**
- [ ] Add UTM parameter tracking to signup flow
- [ ] Track channel attribution (first touch, last touch)
- [ ] Calculate CAC by channel
- [ ] Add channel breakdown to admin dashboard

---

## C. REVENUE & UNIT ECONOMICS

### 11. Monthly Recurring Revenue (MRR)

**Definition:**  
Total monthly subscription revenue from all active subscriptions.

**Current Status:** ⚠️ **PARTIALLY INSTRUMENTED**

**Where:**
- `src/lib/analytics.ts` - `AnalyticsService.getRevenueMetrics()` includes MRR calculation
- `app/api/stripe/*` - Stripe integration exists
- `supabase/migrations/*` - Need to verify subscriptions table exists

**Missing:**
- Actual MRR tracking in database
- MRR growth rate (MoM %)
- MRR by plan (Free, Starter, Pro)

**How It Should Work:**
```typescript
// From src/lib/analytics.ts (exists but needs validation)
const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
const mrr = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);
```

**YC Interview Answer:**  
"Our MRR is $[X], growing [Y]% month-over-month. We have [Z] paying customers at an average ARPU of $[amount]."

**Current Targets:**
- MRR Growth: 20%+ MoM (early stage)
- ARPU: $49/month (Starter plan average)

**TODO:**
- [ ] Verify subscriptions table exists and tracks MRR
- [ ] Add MRR tracking to admin dashboard
- [ ] Track MRR by plan (Free, Starter, Pro)
- [ ] Calculate MRR growth rate (MoM %)

---

### 12. Annual Recurring Revenue (ARR)

**Definition:**  
MRR × 12 (annualized recurring revenue).

**Current Status:** ⚠️ **PARTIALLY INSTRUMENTED**

**Where:**
- `src/lib/analytics.ts` - `AnalyticsService.getRevenueMetrics()` includes ARR calculation

**How It's Calculated:**
```typescript
// From src/lib/analytics.ts
const arr = mrr * 12;
```

**YC Interview Answer:**  
"Our ARR is $[X] (MRR × 12). We're targeting $[Y] ARR by [date]."

**TODO:**
- [ ] Add ARR to admin dashboard
- [ ] Track ARR growth rate (YoY %)
- [ ] Project ARR based on current growth rate

---

### 13. Average Revenue Per User (ARPU)

**Definition:**  
MRR / Number of paying customers.

**Current Status:** ⚠️ **PARTIALLY INSTRUMENTED**

**Where:**
- `src/lib/analytics.ts` - Can calculate from MRR and customer count

**How It's Calculated:**
```typescript
const arpu = mrr / payingCustomers.length;
```

**YC Interview Answer:**  
"Our ARPU is $[X]/month. This includes [Y]% Starter ($49) and [Z]% Pro ($149) customers."

**Current Targets:**
- ARPU: $49/month (weighted average of Starter and Pro)

**TODO:**
- [ ] Add ARPU to admin dashboard
- [ ] Track ARPU trends (increasing = upselling, decreasing = churn)
- [ ] Calculate ARPU by cohort (signup date)

---

### 14. Customer Acquisition Cost (CAC)

**Definition:**  
Total marketing and sales spend / Number of new customers acquired.

**Current Status:** ❌ **NOT INSTRUMENTED**

**Where:**
- Need to track marketing spend (ads, content, tools)
- Need to track sales spend (salaries, tools)
- Need to track new customers by channel

**How It Should Work:**
```typescript
// Track marketing spend by channel
const marketingSpend = {
  shopify_app_store: 500, // Paid ads
  seo: 0, // Organic (time cost)
  referrals: 0, // Organic
  paid_ads: 2000, // Google, Facebook ads
};

// Track new customers by channel
const newCustomers = {
  shopify_app_store: 10,
  seo: 50,
  referrals: 20,
  paid_ads: 40,
};

// Calculate CAC by channel
const cacByChannel = {
  shopify_app_store: 500 / 10 = $50,
  seo: 0 / 50 = $0,
  referrals: 0 / 20 = $0,
  paid_ads: 2000 / 40 = $50,
};
```

**YC Interview Answer:**  
"Our blended CAC is $[X]. By channel: Shopify App Store $[Y], SEO $[Z] (organic), Paid Ads $[amount]. Our LTV:CAC ratio is [ratio]:1 (target: 3:1)."

**Current Targets:**
- CAC: <$100 (for $49/month ARPU)
- LTV:CAC: 3:1 (industry benchmark)

**TODO:**
- [ ] Track marketing spend by channel
- [ ] Track new customers by channel
- [ ] Calculate CAC by channel
- [ ] Add CAC to admin dashboard

---

### 15. Customer Lifetime Value (LTV)

**Definition:**  
ARPU × Average customer lifetime (in months).

**Current Status:** ⚠️ **PARTIALLY INSTRUMENTED**

**Where:**
- `src/lib/analytics.ts` - Can calculate from ARPU and churn rate

**How It's Calculated:**
```typescript
// LTV = ARPU × (1 / Monthly Churn Rate)
const monthlyChurnRate = churnedCustomers / totalCustomers;
const averageLifetimeMonths = 1 / monthlyChurnRate;
const ltv = arpu * averageLifetimeMonths;
```

**YC Interview Answer:**  
"Our LTV is $[X] (ARPU $[Y] × [Z] months average lifetime). Our LTV:CAC ratio is [ratio]:1, which is [good/bad] compared to the 3:1 benchmark."

**Current Targets:**
- LTV: $588+ (assuming 12-month retention for $49/month ARPU)
- LTV:CAC: 3:1 (industry benchmark)

**TODO:**
- [ ] Calculate monthly churn rate
- [ ] Calculate average customer lifetime
- [ ] Calculate LTV
- [ ] Add LTV to admin dashboard

---

### 16. Churn Rate (Monthly)

**Definition:**  
Percentage of customers who cancel their subscription in a given month.

**Current Status:** ⚠️ **PARTIALLY INSTRUMENTED**

**Where:**
- `src/lib/analytics.ts` - `AnalyticsService.getCustomerMetrics()` includes churn calculation
- `supabase/migrations/*` - Need to verify subscriptions table tracks cancellations

**How It's Calculated:**
```typescript
// From src/lib/analytics.ts
const churnedCustomers = subscriptions.filter(s => s.status === 'canceled');
const churnRate = (churnedCustomers.length / totalCustomers) * 100;
```

**YC Interview Answer:**  
"Our monthly churn rate is [X]%. Industry benchmark is 5-7% for SaaS. We're [above/below] benchmark because [reason]."

**Current Targets:**
- Monthly Churn: <5% (industry benchmark for SaaS)

**TODO:**
- [ ] Verify churn tracking in subscriptions table
- [ ] Add churn rate to admin dashboard
- [ ] Track churn by cohort (signup date)
- [ ] Identify churn drivers (why do users cancel?)

---

### 17. Gross Margin

**Definition:**  
(Revenue - Cost of Goods Sold) / Revenue × 100.

**Current Status:** ❌ **NOT INSTRUMENTED**

**Where:**
- Need to track COGS:
  - Infrastructure costs (Supabase, Vercel, Stripe fees)
  - AI API costs (OpenAI, Claude, Gemini)
  - Support costs (if any)

**How It Should Work:**
```typescript
const cogs = {
  infrastructure: 500, // Supabase, Vercel
  ai_apis: 200, // OpenAI, Claude, Gemini
  payment_processing: 100, // Stripe fees (2.9% + $0.30)
  support: 0, // If outsourced
};

const grossMargin = ((revenue - cogs.total) / revenue) * 100;
```

**YC Interview Answer:**  
"Our gross margin is [X]%. Our main costs are infrastructure ([Y]%) and AI APIs ([Z]%). We're targeting 80%+ gross margin (SaaS benchmark)."

**Current Targets:**
- Gross Margin: 80%+ (SaaS benchmark)

**TODO:**
- [ ] Track infrastructure costs (Supabase, Vercel)
- [ ] Track AI API costs (OpenAI, Claude, Gemini)
- [ ] Track payment processing fees (Stripe)
- [ ] Calculate gross margin
- [ ] Add gross margin to admin dashboard

---

## D. PRODUCT-MARKET FIT METRICS

### 18. Net Promoter Score (NPS)

**Definition:**  
Percentage of promoters (score 9-10) minus percentage of detractors (score 0-6).

**Current Status:** ✅ **INSTRUMENTED**

**Where:**
- `supabase/migrations/20250128000000_pmf_analytics.sql` - `nps_surveys` table exists
- `calculate_nps()` SQL function exists

**How It's Calculated:**
```sql
-- From supabase/migrations/20250128000000_pmf_analytics.sql
nps_score := ((promoters / total_responses) - (detractors / total_responses)) * 100;
```

**YC Interview Answer:**  
"Our NPS is [X]. Industry benchmark is 50+ for SaaS. We're [above/below] benchmark because [reason]."

**Current Targets:**
- NPS: 50+ (industry benchmark for SaaS)

**TODO:**
- [ ] Implement NPS survey (in-app or email)
- [ ] Track NPS trends over time
- [ ] Add NPS to admin dashboard
- [ ] Act on NPS feedback (improve product based on feedback)

---

### 19. Workflows per User

**Definition:**  
Average number of workflows created per active user.

**Current Status:** ✅ **INSTRUMENTED**

**Where:**
- `supabase/migrations/20250128000000_pmf_analytics.sql` - `user_activations` table tracks `workflows_created`
- `pmf_metrics_snapshots` table tracks `workflows_per_user`

**How It's Calculated:**
```sql
SELECT AVG(workflows_created) 
FROM user_activations 
WHERE signup_date >= NOW() - '30 days'::INTERVAL;
```

**YC Interview Answer:**  
"Our average user creates [X] workflows. Power users (>5 workflows) have [Y]% higher retention and [Z]% higher LTV."

**Current Targets:**
- Workflows per User: 2-3 (early stage target)

**TODO:**
- [ ] Add workflows per user to admin dashboard
- [ ] Identify power users (>5 workflows) and their characteristics
- [ ] Track workflows per user trends over time

---

## SUMMARY: METRICS READINESS

### ✅ Fully Instrumented (Ready for YC)
- DAU, WAU, MAU
- Activation Rate
- Time to Activation
- Retention (Day 7, Day 30)
- Signups
- NPS
- Workflows per User

### ⚠️ Partially Instrumented (Need Validation)
- Engagement (Workflows per User ✅, Executions per User ❌)
- Conversion Funnel (Signup → Activation ✅, Visitor → Signup ❌, Activation → Paying ❌)
- MRR, ARR, ARPU (code exists, need validation)
- Churn Rate (code exists, need validation)
- LTV (can calculate, need validation)

### ❌ Not Instrumented (Need to Add)
- Acquisition Channels (UTM tracking)
- CAC (marketing spend tracking)
- Gross Margin (COGS tracking)

---

## NEXT STEPS

1. **Validate Existing Metrics**
   - Run queries to verify metrics are accurate
   - Fix any bugs in calculations
   - Add missing data points

2. **Add Missing Metrics**
   - UTM parameter tracking (acquisition channels)
   - Marketing spend tracking (CAC)
   - COGS tracking (gross margin)

3. **Create Metrics Dashboard**
   - Build admin dashboard with all key metrics
   - Add trends and cohort analysis
   - Set up alerts for metric changes

4. **Prepare YC Interview Answers**
   - Document current values for each metric
   - Prepare explanations for trends
   - Identify areas for improvement

---

## See Also

- `YC_METRICS_DASHBOARD_SKETCH.md` - Proposed dashboard design
- `YC_INTERVIEW_CHEATSHEET.md` - How to present metrics in interview
