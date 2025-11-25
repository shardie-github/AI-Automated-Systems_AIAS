# YC Metrics Dashboard Sketch — AIAS Platform

**Generated:** 2025-01-29  
**Status:** Proposal — Founders to implement

---

## Overview

This document describes what a basic metrics dashboard should show for YC prep. Founders should have these numbers handy during the interview and be able to explain trends and changes.

**Key Principle:** YC partners want to see that founders know their numbers cold. The dashboard should make it easy to:
1. See current values
2. Understand trends
3. Identify problems
4. Take action

---

## Dashboard Layout

### Section 1: North Star Metric (Top of Dashboard)

**Display:**
```
┌─────────────────────────────────────────────────────────┐
│  Monthly Active Organizations (MAO)                    │
│  ─────────────────────────────────────────────────────  │
│  1,234 organizations                                    │
│  ↑ 23% MoM growth                                       │
│  ─────────────────────────────────────────────────────  │
│  [Last 30 days chart]                                   │
└─────────────────────────────────────────────────────────┘
```

**Why:**  
YC partners ask "What's your north star metric?" This should be the first thing they see.

**Data Source:**
- `pmf_metrics_snapshots.monthly_active_users` (or organizations if multi-tenant)

---

### Section 2: Growth Metrics (Top Row)

**Display:**
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Signups      │  │ Activations  │  │ Paying       │  │ MRR           │
│ ──────────── │  │ ──────────── │  │ ──────────── │  │ ────────────  │
│ 234 this week│  │ 89 (38%)      │  │ 12 (13%)     │  │ $588          │
│ ↑ 15% WoW    │  │ ↑ 5% WoW      │  │ ↑ 20% WoW    │  │ ↑ 18% MoM     │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**Why:**  
Shows growth trajectory. YC partners want to see consistent growth.

**Data Sources:**
- Signups: `telemetry_events` (type: `user_signed_up`)
- Activations: `user_activations` (first_workflow_created_at)
- Paying: `subscriptions` (status: `active`)
- MRR: `subscriptions` (sum of active subscription amounts)

---

### Section 3: Activation Funnel (Middle Section)

**Display:**
```
┌─────────────────────────────────────────────────────────┐
│  Activation Funnel                                      │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  Visitors ──[2.5%]──> Signups ──[38%]──> Activated ──[13%]──> Paying │
│    10,000         250             95             12              │
│                                                          │
│  [Funnel visualization chart]                            │
│                                                          │
│  Drop-off Points:                                        │
│  • Visitor → Signup: 97.5% drop-off (need better CTA)  │
│  • Signup → Activation: 62% drop-off (need better onboarding) │
│  • Activation → Paying: 87% drop-off (need pricing optimization) │
└─────────────────────────────────────────────────────────┘
```

**Why:**  
Shows where users drop off. YC partners want to see that founders understand their funnel and are optimizing it.

**Data Sources:**
- Visitors: Page view tracking (need to add)
- Signups: `telemetry_events` (type: `user_signed_up`)
- Activated: `user_activations` (first_workflow_created_at IS NOT NULL)
- Paying: `subscriptions` (status: `active`)

---

### Section 4: Retention Metrics (Middle Section)

**Display:**
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Day 7        │  │ Day 30       │  │ Churn Rate   │  │ LTV          │
│ Retention    │  │ Retention    │  │              │  │              │
│ ──────────── │  │ ──────────── │  │ ──────────── │  │ ──────────── │
│ 42%          │  │ 25%          │  │ 4.2%/month   │  │ $588         │
│ ↑ 2% WoW     │  │ ↑ 3% MoM     │  │ ↓ 0.5% MoM   │  │ ↑ $50 MoM    │
│              │  │              │  │              │  │              │
│ [Cohort chart]│  │ [Cohort chart]│  │ [Trend chart]│  │ [Trend chart]│
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**Why:**  
Shows product-market fit. High retention = good PMF. Low churn = sustainable business.

**Data Sources:**
- Day 7 Retention: `pmf_metrics_snapshots.seven_day_retention`
- Day 30 Retention: `pmf_metrics_snapshots.thirty_day_retention`
- Churn Rate: `subscriptions` (status: `canceled` / total)
- LTV: ARPU × (1 / Monthly Churn Rate)

---

### Section 5: Engagement Metrics (Middle Section)

**Display:**
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ DAU          │  │ WAU          │  │ MAU          │  │ Workflows/   │
│              │  │              │  │              │  │ User         │
│ ──────────── │  │ ──────────── │  │ ──────────── │  │ ──────────── │
│ 456          │  │ 1,123        │  │ 1,234        │  │ 2.3          │
│ ↑ 12% WoW    │  │ ↑ 18% WoW    │  │ ↑ 23% MoM    │  │ ↑ 0.2 MoM    │
│              │  │              │  │              │  │              │
│ WAU/MAU: 91% │  │ [Trend chart]│  │ [Trend chart]│  │ [Trend chart]│
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**Why:**  
Shows how engaged users are. High DAU/MAU ratio = engaged users.

**Data Sources:**
- DAU: `user_activations` (last_active_at >= NOW() - '1 day')
- WAU: `pmf_metrics_snapshots.weekly_active_users`
- MAU: `pmf_metrics_snapshots.monthly_active_users`
- Workflows/User: `pmf_metrics_snapshots.workflows_per_user`

---

### Section 6: Unit Economics (Bottom Section)

**Display:**
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ARPU         │  │ CAC          │  │ LTV:CAC      │  │ Gross        │
│              │  │              │  │              │  │ Margin       │
│ ──────────── │  │ ──────────── │  │ ──────────── │  │ ──────────── │
│ $49/month    │  │ $75          │  │ 7.8:1        │  │ 82%          │
│ ↑ $2 MoM     │  │ ↓ $5 MoM     │  │ ↑ 0.5 MoM   │  │ ↑ 2% MoM     │
│              │  │              │  │              │  │              │
│ [Trend chart]│  │ [By channel] │  │ [Target: 3:1]│  │ [Target: 80%]│
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**Why:**  
Shows business sustainability. LTV:CAC > 3:1 = sustainable. Gross margin > 80% = scalable.

**Data Sources:**
- ARPU: MRR / Paying Customers
- CAC: Marketing Spend / New Customers (need to track)
- LTV:CAC: LTV / CAC
- Gross Margin: (Revenue - COGS) / Revenue × 100 (need to track COGS)

---

### Section 7: Acquisition Channels (Bottom Section)

**Display:**
```
┌─────────────────────────────────────────────────────────┐
│  Acquisition Channels                                    │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  Channel          Signups    CAC      Conversion        │
│  ─────────────────────────────────────────────────────  │
│  Shopify App      120        $50      12%               │
│  SEO               80        $0       8%                 │
│  Referrals         30        $0       15%               │
│  Paid Ads          20        $100     5%                 │
│                                                          │
│  [Channel breakdown chart]                               │
└─────────────────────────────────────────────────────────┘
```

**Why:**  
Shows where users come from and which channels are most efficient. YC partners want to see scalable acquisition channels.

**Data Sources:**
- Signups by Channel: UTM parameter tracking (need to add)
- CAC by Channel: Marketing Spend / New Customers by Channel
- Conversion by Channel: Signups → Paying by Channel

---

### Section 8: Product-Market Fit Indicators (Bottom Section)

**Display:**
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ NPS           │  │ Time to      │  │ Activation   │  │ Power Users  │
│               │  │ Activation   │  │ Rate         │  │ (>5 workflows)│
│ ──────────── │  │ ──────────── │  │ ──────────── │  │ ──────────── │
│ 52            │  │ 18 hours     │  │ 38%          │  │ 15%          │
│ ↑ 5 MoM       │  │ ↓ 2 hours    │  │ ↑ 3% MoM     │  │ ↑ 2% MoM     │
│               │  │              │  │              │  │              │
│ [Target: 50+] │  │ [Target: <24h]│  │ [Target: 40%+]│  │ [Retention: 65%]│
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**Why:**  
Shows product-market fit. High NPS, fast activation, high activation rate = good PMF.

**Data Sources:**
- NPS: `pmf_metrics_snapshots.nps`
- Time to Activation: `pmf_metrics_snapshots.time_to_activation_hours`
- Activation Rate: `pmf_metrics_snapshots.activation_rate`
- Power Users: `user_activations` (workflows_created > 5)

---

## Implementation Recommendations

### 1. Use Existing Admin Dashboard

**Current:** `app/admin/metrics/page.tsx` exists but focuses on performance metrics.

**Action:**  
Extend this dashboard to include business metrics:
- Add business metrics API endpoint (`app/api/admin/metrics/route.ts`)
- Update dashboard UI to show business metrics
- Add charts using Recharts (already in dependencies)

---

### 2. Create Metrics API Endpoint

**File:** `app/api/admin/metrics/route.ts`

**Functionality:**
- Aggregate metrics from database
- Calculate trends (WoW, MoM %)
- Return JSON for dashboard

**Example Response:**
```json
{
  "northStar": {
    "value": 1234,
    "growth": 23,
    "period": "MoM"
  },
  "growth": {
    "signups": { "value": 234, "growth": 15, "period": "WoW" },
    "activations": { "value": 89, "growth": 5, "period": "WoW" },
    "paying": { "value": 12, "growth": 20, "period": "WoW" },
    "mrr": { "value": 588, "growth": 18, "period": "MoM" }
  },
  "funnel": {
    "visitors": 10000,
    "signups": 250,
    "activated": 95,
    "paying": 12
  },
  "retention": {
    "day7": 42,
    "day30": 25,
    "churnRate": 4.2,
    "ltv": 588
  }
}
```

---

### 3. Add Charts

**Library:** Recharts (already in dependencies: `recharts: ^2.10.3`)

**Charts Needed:**
- Line charts for trends (DAU, WAU, MAU, MRR)
- Funnel chart for conversion funnel
- Cohort chart for retention
- Bar charts for channel breakdown

---

### 4. Set Up Alerts

**For Critical Metrics:**
- MRR drops >10% MoM
- Churn rate increases >2% MoM
- Activation rate drops >5% MoM
- NPS drops >10 points

**Implementation:**
- Cron job (Supabase Edge Function) runs daily
- Checks metrics against thresholds
- Sends email/Slack alert if threshold breached

---

## YC Interview Usage

### How to Use This Dashboard in Interview

1. **Have Dashboard Open:**  
   Show dashboard on laptop/tablet during interview

2. **Know Your Numbers:**  
   Be able to recite current values without looking:
   - "Our MRR is $588, growing 18% month-over-month"
   - "Our activation rate is 38%, above the 40% target"
   - "Our LTV:CAC is 7.8:1, well above the 3:1 benchmark"

3. **Explain Trends:**  
   Be ready to explain why metrics changed:
   - "MRR grew 18% because we improved activation rate from 35% to 38%"
   - "Churn dropped 0.5% because we added onboarding improvements"

4. **Identify Problems:**  
   Show you're proactive:
   - "Our biggest drop-off is at signup → activation (62%), so we're A/B testing onboarding flows"
   - "CAC is highest for paid ads ($100), so we're focusing on SEO and referrals"

---

## TODO: Founders to Implement

- [ ] Extend `app/admin/metrics/page.tsx` to include business metrics
- [ ] Create `app/api/admin/metrics/route.ts` API endpoint
- [ ] Add charts using Recharts
- [ ] Set up daily metrics alerts
- [ ] Add UTM parameter tracking (acquisition channels)
- [ ] Track marketing spend (CAC calculation)
- [ ] Track COGS (gross margin calculation)
- [ ] Test dashboard with real data
- [ ] Prepare YC interview answers for each metric

---

## See Also

- `YC_METRICS_CHECKLIST.md` - Detailed metrics definitions and instrumentation status
- `YC_INTERVIEW_CHEATSHEET.md` - How to present metrics in interview
