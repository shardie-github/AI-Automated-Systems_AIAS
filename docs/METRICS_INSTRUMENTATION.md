# Metrics Instrumentation Checklist

**Last Updated:** 2025-01-29  
**Status:** In Progress

---

## Overview

This document tracks which metrics from `docs/METRICS_AND_FORECASTS.md` are actually instrumented in code.

**Legend:**
- ✅ Instrumented - Code exists, events fire, metrics tracked
- ⚠️ Partial - Code exists but not fully instrumented
- ❌ Not Instrumented - No code exists

---

## ACTIVATION METRICS

### Activation Rate
**Definition:** Percentage of signups that activate (connect integration + create workflow) within 7 days.

**Status:** ❌ Not Instrumented

**What's Needed:**
- [ ] Telemetry event: `user_signed_up` (fires on signup)
- [ ] Telemetry event: `integration_connected` (fires when user connects integration)
- [ ] Telemetry event: `workflow_created` (fires when user creates workflow)
- [ ] Telemetry event: `user_activated` (fires when user activates)
- [ ] Database query: Count users with `user_activated` event within 7 days of signup
- [ ] Dashboard: Activation rate calculation and display

**Code Locations:**
- Signup: `app/api/auth/` (need to add event)
- Integration connect: `app/api/integrations/` (need to add event)
- Workflow create: `app/api/workflows/` (need to add event)
- Activation: `lib/telemetry/track.ts` (need to add event)

---

### Time-to-Activation
**Definition:** Median time from signup to activation.

**Status:** ❌ Not Instrumented

**What's Needed:**
- [ ] Track `user_signed_up` timestamp
- [ ] Track `user_activated` timestamp
- [ ] Calculate time difference
- [ ] Dashboard: Time-to-activation distribution chart

**Code Locations:**
- Same as Activation Rate above

---

### Activation Funnel
**Definition:** Conversion rates at each stage (signup → integration → workflow → activation).

**Status:** ❌ Not Instrumented

**What's Needed:**
- [ ] All events from Activation Rate above
- [ ] Funnel calculation: Count users at each stage
- [ ] Dashboard: Funnel visualization

**Code Locations:**
- Same as Activation Rate above

---

## RETENTION METRICS

### Day 1 Retention
**Definition:** Percentage of users who return on Day 1 after signup.

**Status:** ❌ Not Instrumented

**What's Needed:**
- [ ] Telemetry event: `user_active` (fires on login or action)
- [ ] Database query: Count users active on Day 1 after signup
- [ ] Dashboard: Day 1 retention chart

**Code Locations:**
- User activity: `lib/telemetry/track.ts` (need to add `user_active` event)
- Login: `app/api/auth/` (need to add event)

---

### Day 7 Retention
**Definition:** Percentage of users who return on Day 7 after signup.

**Status:** ❌ Not Instrumented

**What's Needed:**
- [ ] Same as Day 1 Retention
- [ ] Database query: Count users active on Day 7 after signup
- [ ] Dashboard: Day 7 retention chart

**Code Locations:**
- Same as Day 1 Retention

---

### Day 30 Retention
**Definition:** Percentage of users who return on Day 30 after signup.

**Status:** ❌ Not Instrumented

**What's Needed:**
- [ ] Same as Day 1 Retention
- [ ] Database query: Count users active on Day 30 after signup
- [ ] Dashboard: Day 30 retention chart

**Code Locations:**
- Same as Day 1 Retention

---

## REVENUE METRICS

### Monthly Recurring Revenue (MRR)
**Definition:** Total recurring revenue per month.

**Status:** ⚠️ Partial

**What's Needed:**
- [ ] Stripe webhook: Track subscription events (`subscription.created`, `subscription.updated`, `subscription.canceled`)
- [ ] Database: Store subscription data
- [ ] Dashboard: MRR calculation and display

**Code Locations:**
- Stripe webhook: `app/api/stripe/webhook/route.ts` (exists, need to verify tracking)
- Database: `supabase/migrations/` (need to verify schema)

---

### Customer Lifetime Value (LTV)
**Definition:** Average revenue per customer over lifetime.

**Status:** ❌ Not Instrumented

**What's Needed:**
- [ ] Track customer signup date
- [ ] Track customer revenue over time
- [ ] Calculate LTV: Sum of all revenue / number of customers
- [ ] Dashboard: LTV chart

**Code Locations:**
- Revenue tracking: `app/api/stripe/webhook/route.ts` (need to add LTV calculation)

---

### Churn Rate
**Definition:** Percentage of customers who cancel per month.

**Status:** ⚠️ Partial

**What's Needed:**
- [ ] Stripe webhook: Track `subscription.canceled` events
- [ ] Database: Store cancellation dates
- [ ] Dashboard: Churn rate calculation and display

**Code Locations:**
- Stripe webhook: `app/api/stripe/webhook/route.ts` (exists, need to verify tracking)

---

## PRODUCT METRICS

### Monthly Active Organizations (MAO)
**Definition:** Organizations that have run at least one automation in the past 30 days.

**Status:** ❌ Not Instrumented

**What's Needed:**
- [ ] Telemetry event: `automation_run` (fires when automation executes)
- [ ] Database query: Count distinct organizations with `automation_run` in past 30 days
- [ ] Dashboard: MAO count and trend chart

**Code Locations:**
- Automation execution: `app/api/workflows/` or `supabase/functions/workflows-api/` (need to add event)

---

### Workflows Created
**Definition:** Total number of workflows created.

**Status:** ❌ Not Instrumented

**What's Needed:**
- [ ] Telemetry event: `workflow_created` (fires when workflow created)
- [ ] Database query: Count workflows created
- [ ] Dashboard: Workflows created count and trend

**Code Locations:**
- Workflow creation: `app/api/workflows/` (need to add event)

---

### Automations Run
**Definition:** Total number of automations executed.

**Status:** ❌ Not Instrumented

**What's Needed:**
- [ ] Telemetry event: `automation_run` (fires when automation executes)
- [ ] Database query: Count automations run
- [ ] Dashboard: Automations run count and trend

**Code Locations:**
- Automation execution: `app/api/workflows/` or `supabase/functions/workflows-api/` (need to add event)

---

## IMPLEMENTATION PRIORITY

### P0: Critical (Block Measurement)
1. ✅ Activation Rate - Blocks understanding user value
2. ✅ Day 7 Retention - Blocks understanding retention
3. ✅ MAO - North Star metric, must track

### P1: Important (Enable Optimization)
4. ⚠️ MRR - Revenue tracking
5. ⚠️ Churn Rate - Retention tracking
6. ⚠️ Time-to-Activation - Onboarding optimization

### P2: Nice-to-Have (Future)
7. ❌ Day 1/30 Retention - Can calculate from Day 7 data
8. ❌ LTV - Can calculate from MRR/churn data
9. ❌ Workflows Created - Lower priority than MAO

---

## QUICK WINS (Can Implement in <1 Hour Each)

1. **Add `user_signed_up` event** - Add to signup API route
2. **Add `user_active` event** - Add to login API route
3. **Add `workflow_created` event** - Add to workflow creation API route
4. **Add `integration_connected` event** - Add to integration API route

---

## DASHBOARD REQUIREMENTS

### Metrics Dashboard MVP
**Location:** `app/admin/metrics/page.tsx`

**Must Show:**
- [ ] Activation Rate (current + trend)
- [ ] Day 7 Retention (current + trend)
- [ ] MAO (current + trend)
- [ ] MRR (current + trend)

**Nice-to-Have:**
- [ ] Activation Funnel (visualization)
- [ ] Time-to-Activation (distribution)
- [ ] Churn Rate (current + trend)

---

## NEXT STEPS

1. **Week 1:** Instrument P0 metrics (Activation Rate, Day 7 Retention, MAO)
2. **Week 2:** Build metrics dashboard MVP
3. **Week 3:** Instrument P1 metrics (MRR, Churn Rate)
4. **Week 4:** Polish dashboard, add visualizations

---

**Last Updated:** 2025-01-29  
**Next Review:** End of Week 1
