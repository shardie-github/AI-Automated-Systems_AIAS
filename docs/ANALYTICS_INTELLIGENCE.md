# 📊 MASTER OMEGA PRIME — ANALYTICS & INTELLIGENCE LAYER

**Generated:** 2025-01-29  
**Agent:** MASTER OMEGA PRIME  
**Status:** PHASE 8 COMPLETE

---

## NORTH STAR METRIC

### Primary Metric
**Monthly Active Organizations (MAO)**

**Definition:** Unique organizations that have at least one successful automation run in the past 30 days.

**Why:** 
- Aligns with product value (automation usage)
- Predicts retention and expansion
- Correlates with revenue

**Target:** 1,000 MAO by Month 6

---

## ACTIVATION METRIC

### Definition
**Time to First Value (TTFV)**

**Stages:**
1. Signup → First Integration Connected (Target: < 5 minutes)
2. First Integration → First Workflow Created (Target: < 10 minutes)
3. First Workflow → First Successful Run (Target: < 24 hours)

**Overall TTFV Target:** < 30 minutes from signup to first value

**Tracking:**
- Event: `user.signup`
- Event: `integration.connected`
- Event: `workflow.created`
- Event: `workflow.first_run`

---

## RETENTION METRIC

### Definition
**Monthly Active User Rate (MAUR)**

**Formula:** (Users active in Month N) / (Users who signed up in Month N-1)

**Targets:**
- Day 1 Retention: > 60%
- Day 7 Retention: > 40%
- Day 30 Retention: > 25%
- Month 2 Retention: > 20%

**Cohort Tracking:**
- Track by signup month
- Segment by plan (Free, Starter, Pro, Enterprise)
- Segment by acquisition channel

---

## ENGAGEMENT METRIC

### Definition
**Workflow Activity Score (WAS)**

**Formula:** (Number of workflows × Frequency × Success rate) / Time period

**Components:**
- Number of active workflows
- Average runs per workflow per week
- Success rate (% of runs that complete successfully)
- Time period (weekly, monthly)

**Target:** WAS > 10 (indicating healthy engagement)

**Tracking:**
- Event: `workflow.run.started`
- Event: `workflow.run.completed`
- Event: `workflow.run.failed`
- Event: `workflow.created`
- Event: `workflow.deleted`

---

## COHORT TRACKING

### Cohorts to Track

#### 1. Signup Cohort
- **Grouping:** Month of signup
- **Metrics:** Retention, activation, conversion
- **Purpose:** Understand long-term user behavior

#### 2. Plan Cohort
- **Grouping:** Initial plan (Free, Starter, Pro, Enterprise)
- **Metrics:** Upgrade rate, churn rate, LTV
- **Purpose:** Understand plan-specific behavior

#### 3. Channel Cohort
- **Grouping:** Acquisition channel (SEO, Paid, Referral, etc.)
- **Metrics:** CAC, LTV, retention
- **Purpose:** Optimize acquisition channels

#### 4. Integration Cohort
- **Grouping:** First integration connected (Shopify, Wave, Gmail, etc.)
- **Metrics:** Activation rate, retention, expansion
- **Purpose:** Understand integration-specific behavior

---

## FUNNEL INSTRUMENTATION

### Funnel Stages

#### Stage 1: Awareness
- **Events:** `page.view`, `blog.view`, `video.view`
- **Conversion:** Awareness → Consideration
- **Target:** 5% conversion rate

#### Stage 2: Consideration
- **Events:** `pricing.view`, `features.view`, `demo.request`
- **Conversion:** Consideration → Signup
- **Target:** 10% conversion rate

#### Stage 3: Signup
- **Events:** `user.signup`, `email.verified`
- **Conversion:** Signup → Activation
- **Target:** 60% activation rate

#### Stage 4: Activation
- **Events:** `integration.connected`, `workflow.created`, `workflow.first_run`
- **Conversion:** Activation → Retention
- **Target:** 40% retention rate (Day 7)

#### Stage 5: Retention
- **Events:** `workflow.run`, `feature.used`, `login`
- **Conversion:** Retention → Expansion
- **Target:** 25% expansion rate

#### Stage 6: Expansion
- **Events:** `plan.upgrade`, `integration.added`, `workflow.added`
- **Conversion:** Expansion → Advocacy
- **Target:** 15% advocacy rate

---

## ANOMALY DETECTION LOGIC

### Anomaly Types

#### 1. Usage Anomalies
- **Trigger:** Sudden drop in workflow runs (> 50% decrease)
- **Action:** Alert support team, check for issues
- **Threshold:** 3 standard deviations from baseline

#### 2. Error Anomalies
- **Trigger:** Spike in error rate (> 10% of runs failing)
- **Action:** Alert engineering team, investigate root cause
- **Threshold:** 2x average error rate

#### 3. Conversion Anomalies
- **Trigger:** Drop in conversion rate (> 20% decrease)
- **Action:** Alert marketing team, investigate funnel
- **Threshold:** 2 standard deviations from baseline

#### 4. Retention Anomalies
- **Trigger:** Drop in retention rate (> 15% decrease)
- **Action:** Alert product team, investigate user experience
- **Threshold:** 2 standard deviations from baseline

### Detection Algorithm

```typescript
function detectAnomaly(current: number, baseline: number, threshold: number): boolean {
  const deviation = Math.abs(current - baseline) / baseline;
  return deviation > threshold;
}
```

---

## AUTOMATED INSIGHTS GENERATOR

### Insight Types

#### 1. Performance Insights
- **Format:** "Your workflows ran [X] times this week, saving you [Y] hours."
- **Frequency:** Weekly
- **Channel:** Email, in-app notification

#### 2. Optimization Insights
- **Format:** "You could save [X] more hours by automating [task]."
- **Frequency:** Monthly
- **Channel:** In-app suggestion, email

#### 3. Comparison Insights
- **Format:** "You're in the top [X]% of users for [metric]."
- **Frequency:** Monthly
- **Channel:** In-app badge, email

#### 4. Trend Insights
- **Format:** "Your automation usage increased [X]% this month."
- **Frequency:** Monthly
- **Channel:** Email report, dashboard

### Insight Generation Logic

```typescript
function generateInsight(userId: string, metric: string, period: string): Insight {
  const userData = getUserData(userId, period);
  const benchmark = getBenchmark(metric);
  const trend = calculateTrend(userData);
  
  return {
    type: determineInsightType(trend, benchmark),
    message: formatMessage(trend, benchmark),
    action: suggestAction(trend, benchmark),
  };
}
```

---

## DASHBOARDS

### Dashboard 1: Executive Dashboard (Supabase SQL)

```sql
-- Monthly Active Organizations
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(DISTINCT org_id) as mao
FROM workflow_runs
WHERE created_at >= NOW() - INTERVAL '6 months'
GROUP BY month
ORDER BY month DESC;

-- Activation Rate
SELECT 
  DATE_TRUNC('month', u.created_at) as signup_month,
  COUNT(DISTINCT u.id) as signups,
  COUNT(DISTINCT CASE WHEN w.created_at IS NOT NULL THEN u.id END) as activated,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN w.created_at IS NOT NULL THEN u.id END) / COUNT(DISTINCT u.id), 2) as activation_rate
FROM users u
LEFT JOIN workflows w ON w.user_id = u.id
WHERE u.created_at >= NOW() - INTERVAL '6 months'
GROUP BY signup_month
ORDER BY signup_month DESC;

-- Retention Rate (Day 7)
SELECT 
  DATE_TRUNC('month', u.created_at) as signup_month,
  COUNT(DISTINCT u.id) as signups,
  COUNT(DISTINCT CASE WHEN wr.created_at >= u.created_at + INTERVAL '7 days' THEN u.id END) as retained_day7,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN wr.created_at >= u.created_at + INTERVAL '7 days' THEN u.id END) / COUNT(DISTINCT u.id), 2) as retention_rate_day7
FROM users u
LEFT JOIN workflow_runs wr ON wr.user_id = u.id
WHERE u.created_at >= NOW() - INTERVAL '6 months'
GROUP BY signup_month
ORDER BY signup_month DESC;

-- Revenue Metrics
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(DISTINCT org_id) as paying_orgs,
  SUM(amount) as mrr,
  AVG(amount) as arpu
FROM subscriptions
WHERE status = 'active'
  AND created_at >= NOW() - INTERVAL '6 months'
GROUP BY month
ORDER BY month DESC;
```

### Dashboard 2: Product Dashboard (Google Sheets)

**Columns:**
- Date
- Signups
- Activations
- Active Users
- Workflow Runs
- Error Rate
- Retention (Day 1, 7, 30)
- Conversion Rate (Free → Paid)

**Formulas:**
- Activation Rate: `Activations / Signups`
- Retention Rate: `Retained Users / Signups`
- Conversion Rate: `Paid Users / Signups`

### Dashboard 3: Marketing Dashboard (Vercel Analytics)

**Metrics:**
- Page Views
- Unique Visitors
- Bounce Rate
- Conversion Rate (View → Signup)
- Top Pages
- Traffic Sources
- Geographic Distribution

**Integration:**
- Vercel Analytics API
- Custom event tracking
- Conversion funnel visualization

### Dashboard 4: Ads Dashboard (TikTok + Meta Ads)

**Metrics:**
- Impressions
- Clicks
- CTR
- CPC
- Conversions
- CAC
- ROAS

**Integration:**
- TikTok Ads API
- Meta Ads API
- Custom conversion tracking

---

## METRICS AGGREGATION

### Aggregation Levels

#### Real-Time (Last 1 Hour)
- Current active users
- Workflow runs in progress
- Error rate
- System health

#### Hourly (Last 24 Hours)
- Signups per hour
- Activations per hour
- Workflow runs per hour
- Error rate per hour

#### Daily (Last 30 Days)
- Daily active users
- Daily workflow runs
- Daily revenue
- Daily retention

#### Weekly (Last 12 Weeks)
- Weekly active users
- Weekly retention
- Weekly conversion
- Weekly expansion

#### Monthly (Last 12 Months)
- Monthly active organizations
- Monthly retention
- Monthly revenue
- Monthly growth

### Aggregation Functions

```sql
-- Create aggregation function
CREATE OR REPLACE FUNCTION aggregate_metrics(
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  granularity TEXT
) RETURNS TABLE (
  period TIMESTAMP,
  signups BIGINT,
  activations BIGINT,
  active_users BIGINT,
  workflow_runs BIGINT,
  revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE_TRUNC(granularity, created_at) as period,
    COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN user_id END) as signups,
    COUNT(DISTINCT CASE WHEN event_type = 'activation' THEN user_id END) as activations,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(*) FILTER (WHERE event_type = 'workflow_run') as workflow_runs,
    SUM(amount) FILTER (WHERE event_type = 'revenue') as revenue
  FROM events
  WHERE created_at BETWEEN start_date AND end_date
  GROUP BY period
  ORDER BY period;
END;
$$ LANGUAGE plpgsql;
```

---

## ALERTING SYSTEM

### Alert Rules

#### Critical Alerts (Immediate)
- Error rate > 10%
- System downtime
- Payment processing failure
- Security breach detected

#### Warning Alerts (Within 1 Hour)
- Error rate > 5%
- Retention drop > 15%
- Conversion drop > 20%
- Usage anomaly detected

#### Info Alerts (Daily Summary)
- Daily metrics summary
- Weekly trends
- Monthly reports

### Alert Channels
- Slack (#alerts)
- Email (team@aias-platform.com)
- PagerDuty (critical only)
- In-app notifications

---

**Generated By:** MASTER OMEGA PRIME  
**Next:** Phase 9 — Multi-Product Synergy
