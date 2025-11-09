# Experiment: Email Win-Back Campaign

**Slug:** `email-winback`  
**Status:** Ready to Launch  
**Created:** 2025-01-28  
**Owner:** Growth Team

---

## Hypothesis

**If** we send targeted win-back emails to at-risk or churned customers with personalized offers,  
**Then** we'll reduce churn and increase customer lifetime value,  
**Because** timely intervention and incentives can re-engage customers before they fully churn.

---

## Target Metrics

### Primary Metric
- **Churn Rate** (target: reduce by 20%, from 5% to 4%)
- **LTV** (target: increase by 15%, from $200 to $230)

### Secondary Metrics
- **Win-Back Rate** (target: 10% of emailed customers reactivate)
- **Email Open Rate** (target: >25%)
- **Email Click Rate** (target: >5%)

---

## Success Threshold

**Minimum Success:** Churn rate reduces by 10% (from 5% to 4.5%) OR LTV increases by 5%  
**Target Success:** Churn rate reduces by 20% (from 5% to 4%) AND LTV increases by 15%  
**Stretch Goal:** Churn rate reduces by 30% (from 5% to 3.5%) AND LTV increases by 20%

---

## Sample Size Calculation

**Statistical Significance:** 95% confidence, 80% power  
**Baseline Churn Rate:** 5%  
**Minimum Detectable Effect:** 0.5% absolute reduction (10% relative)  
**Required Sample Size:** ~3,000 customers per variant (6,000 total)

**Sample Size Heuristic:** Run for 8-12 weeks or until 6,000 customers in experiment

---

## Campaign Design

### Segmentation

#### Segment 1: At-Risk Customers (No activity in 14 days)
- **Trigger:** Last activity 14 days ago
- **Email:** "We miss you! Here's what's new"
- **Offer:** 20% discount on next month

#### Segment 2: Churned Customers (Cancelled in last 30 days)
- **Trigger:** Cancelled subscription 7-30 days ago
- **Email:** "Come back! We've improved"
- **Offer:** 30% discount for 3 months

#### Segment 3: Low Engagement (Logged in <3 times in last 30 days)
- **Trigger:** Low engagement score
- **Email:** "Get the most out of [Product]"
- **Offer:** Free onboarding session

### Variants

#### Variant A (Control)
- No win-back emails
- Natural churn rate

#### Variant B (Treatment)
- Win-back emails sent based on segmentation
- Track open, click, and reactivation rates

---

## Rollout Plan

### Phase 1: Soft Launch (Week 1-2)
- **Audience:** 10% of at-risk customers
- **Goal:** Validate email content and offers
- **Success Criteria:** >20% open rate, >3% click rate

### Phase 2: Full Launch (Week 3-12)
- **Audience:** All segments, 50/50 split
- **Goal:** Measure churn and LTV impact
- **Success Criteria:** Reach 6,000 customers total

### Phase 3: Optimization (Week 13+)
- **Goal:** Optimize email content and timing
- **Success Criteria:** Maintain or improve win-back rate

---

## Rollback Plan

**Trigger Conditions:**
- Churn rate increases (emails annoy customers)
- Unsubscribe rate >5%
- Customer complaints about email frequency (>10/week)

**Rollback Steps:**
1. Pause email sends immediately
2. Analyze what went wrong
3. Adjust email frequency/content
4. Re-test with new approach

---

## Metrics Tracking

### Events to Track
- `winback_email_sent` (with segment and variant)
- `winback_email_opened`
- `winback_email_clicked`
- `winback_offer_redeemed`
- `winback_customer_reactivated`
- `winback_customer_churned` (despite email)

### Database Queries
```sql
-- Churn rate by variant
SELECT 
  variant,
  COUNT(DISTINCT user_id) as total_customers,
  COUNT(DISTINCT CASE WHEN churned THEN user_id END) as churned_customers,
  COUNT(DISTINCT CASE WHEN churned THEN user_id END)::NUMERIC / COUNT(DISTINCT user_id)::NUMERIC as churn_rate
FROM winback_experiment_customers
WHERE experiment_slug = 'email-winback'
GROUP BY variant;

-- LTV by variant
SELECT 
  variant,
  AVG(ltv) as avg_ltv,
  COUNT(*) as customers
FROM customer_ltv c
JOIN winback_experiment_customers w ON c.user_id = w.user_id
WHERE w.experiment_slug = 'email-winback'
GROUP BY variant;
```

---

## Dependencies

- **Feature Flag:** `email_winback_enabled` (in flags.json)
- **Database Tables:** `customers`, `events`, `orders`
- **Email Service:** SendGrid/Mailchimp/Resend integration
- **Segmentation Logic:** Customer scoring system

---

## Financial Impact

### Base Scenario (Month 1)
- **Current Churn Rate:** 5% of 1,000 customers = 50 churned/month
- **Current LTV:** $200
- **Lost Revenue:** 50 × $200 = $10,000/month
- **Target Churn Rate:** 4% of 1,000 customers = 40 churned/month
- **Saved Customers:** 10 customers/month
- **Revenue Retained:** 10 × $200 = $2,000/month
- **Campaign Cost:** ~$200/month (email service)
- **Net Value:** +$1,800/month
- **Annual Impact:** +$21,600/year

### At Scale (Month 12)
- **Current Churn Rate:** 5% of 5,000 customers = 250 churned/month
- **Current LTV:** $420 (from financial model)
- **Lost Revenue:** 250 × $420 = $105,000/month
- **Target Churn Rate:** 4% of 5,000 customers = 200 churned/month
- **Saved Customers:** 50 customers/month
- **Revenue Retained:** 50 × $420 = $21,000/month
- **Campaign Cost:** ~$500/month (email service)
- **Net Value:** +$20,500/month
- **Annual Impact:** +$246,000/year

---

## Timeline

- **Week 1:** Design email templates and segmentation logic
- **Week 2:** Build email automation and tracking
- **Week 3:** Soft launch with 10% of at-risk customers
- **Week 4-11:** Full launch, 50/50 split
- **Week 12:** Analyze results, optimize campaign
- **Week 13+:** Scale and optimize

---

## Risks

1. **Email fatigue:** Too many emails annoy customers
   - **Mitigation:** Limit email frequency, allow easy unsubscribe

2. **Low engagement:** Emails don't get opened/clicked
   - **Mitigation:** A/B test subject lines and content

3. **Offer costs too much:** Discounts erode margins
   - **Mitigation:** Monitor offer redemption and ROI, adjust offers

---

## Done When

- [ ] Experiment reaches statistical significance (6,000 customers)
- [ ] Churn rate reduces by at least 10% OR LTV increases by 5% (minimum success)
- [ ] Win-back rate >5% of emailed customers
- [ ] Campaign ROI positive (retained revenue > campaign costs)
- [ ] No significant unsubscribe spike
- [ ] Results documented and campaign optimized

---

**Last Updated:** 2025-01-28  
**Next Review:** Weekly during experiment
