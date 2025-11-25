# Experiment Cadence — AIAS Platform

**Last Updated:** 2025-01-29  
**Goal:** Run 2 experiments per week (1 growth + 1 product)

---

## Experiment Process

### 1. Hypothesis
Format: "We believe [X] will [Y] for [Z]. We'll know we're right when [metric]."

Example:
- "We believe adding a viral invite flow after onboarding will increase referral rate from 5% to 15% for new users. We'll know we're right when referral rate increases to 15%+."

### 2. Test
- Define experiment type (A/B test, feature test, channel test)
- Set up tracking and instrumentation
- Run experiment for sufficient sample size (typically 1-2 weeks)

### 3. Measure
- Track key metrics (conversion, activation, retention, revenue)
- Calculate statistical significance (if A/B test)
- Document results and learnings

### 4. Learn
- Decide: **Scale** (if successful), **Iterate** (if partially successful), or **Kill** (if unsuccessful)
- Document learnings and next steps
- Share results with team and mentors

---

## Current Experiments

### Experiment 1: A/B Test Onboarding Flow
**Status:** Planned  
**Start Date:** [TODO: Set start date]  
**Duration:** 2 weeks

**Hypothesis:**
"We believe optimizing the onboarding flow (reducing steps, adding progress indicators) will increase activation rate from [current]% to 40%+ for new users. We'll know we're right when activation rate increases to 40%+."

**Test:**
- **Control:** Current 5-step onboarding wizard
- **Variant:** Optimized 3-step onboarding with progress indicators
- **Sample Size:** 100+ users per variant

**Metrics:**
- Activation rate (% who create first workflow)
- Time-to-activation (days from signup to first workflow)
- Drop-off rate (where users exit onboarding)

**Results:**
- [TODO: Document results after experiment]

**Learnings:**
- [TODO: Document learnings]

---

### Experiment 2: Test Referral Rewards
**Status:** Planned  
**Start Date:** [TODO: Set start date]  
**Duration:** 2 weeks

**Hypothesis:**
"We believe offering commission-based referral rewards (vs. XP or credits) will increase referral rate from 5% to 15% for existing users. We'll know we're right when referral rate increases to 15%+."

**Test:**
- **Variant A:** XP rewards (gamification)
- **Variant B:** Credits rewards (platform credits)
- **Variant C:** Commission rewards (revenue share)
- **Sample Size:** 50+ users per variant

**Metrics:**
- Referral rate (% of users who refer friends)
- Referral signups (number of signups from referrals)
- Referral conversions (referral signups → paying customers)

**Results:**
- [TODO: Document results after experiment]

**Learnings:**
- [TODO: Document learnings]

---

### Experiment 3: Test Pricing Page Copy
**Status:** Planned  
**Start Date:** [TODO: Set start date]  
**Duration:** 2 weeks

**Hypothesis:**
"We believe emphasizing benefits and social proof (vs. features) on the pricing page will increase conversion rate (free → paid) from [current]% to 10%+ for free users. We'll know we're right when conversion rate increases to 10%+."

**Test:**
- **Control:** Current pricing page (features-focused)
- **Variant A:** Benefits-focused copy ("Save 10+ hours/week")
- **Variant B:** Social proof-focused copy ("Join 1,000+ Canadian businesses")
- **Sample Size:** 200+ visitors per variant

**Metrics:**
- Conversion rate (free → paid)
- Click-through rate (pricing page → checkout)
- Time on pricing page

**Results:**
- [TODO: Document results after experiment]

**Learnings:**
- [TODO: Document learnings]

---

## Experiment Backlog

### Growth Experiments
1. **SEO Landing Pages:** Create 5-10 SEO-optimized landing pages for high-intent keywords
2. **Viral Invite Flow:** Add invite prompt after onboarding completion
3. **Embeddable Widget:** Build embeddable workflow preview widget
4. **Shopify App Store:** Submit app to Shopify App Store and track installs

### Product Experiments
1. **Onboarding "Aha Moment":** Define and optimize the moment users realize value
2. **In-Product Education:** Add tooltips and guided tours
3. **Usage-Based Upgrade Triggers:** Show upgrade prompts when users approach limits
4. **Share/Invite Prominence:** Make referral system more prominent in product

---

## Experiment Tracking

### Weekly Experiment Log

| Week | Growth Experiment | Product Experiment | Status | Results |
|------|------------------|-------------------|--------|---------|
| Week 1 | [TODO] | [TODO] | Planned | - |
| Week 2 | [TODO] | [TODO] | Planned | - |
| Week 3 | [TODO] | [TODO] | Planned | - |
| Week 4 | [TODO] | [TODO] | Planned | - |

---

## Experiment Templates

### A/B Test Template
```
**Experiment Name:** [Name]
**Hypothesis:** [Hypothesis]
**Test:**
- Control: [Description]
- Variant: [Description]
- Sample Size: [Number]
**Metrics:** [List metrics]
**Results:** [Results after experiment]
**Learnings:** [What we learned]
**Next Steps:** [Scale/Iterate/Kill]
```

### Feature Test Template
```
**Experiment Name:** [Name]
**Hypothesis:** [Hypothesis]
**Feature:** [Description of feature]
**Metrics:** [List metrics]
**Results:** [Results after experiment]
**Learnings:** [What we learned]
**Next Steps:** [Keep/Remove/Iterate]
```

### Channel Test Template
```
**Experiment Name:** [Name]
**Hypothesis:** [Hypothesis]
**Channel:** [Description of channel]
**Budget:** [Budget allocated]
**Metrics:** [List metrics]
**Results:** [Results after experiment]
**Learnings:** [What we learned]
**Next Steps:** [Scale/Stop/Iterate]
```

---

## Success Criteria

### Experiment Success Metrics
- **Activation Rate:** Increase from [current]% to 40%+
- **Conversion Rate:** Increase from [current]% to 10%+
- **Referral Rate:** Increase from 5% to 15%+
- **Time-to-Activation:** Reduce from [current] days to < 2 days

### Statistical Significance
- **Sample Size:** Minimum 100 users per variant (for A/B tests)
- **Confidence Level:** 95% confidence interval
- **Duration:** Minimum 1 week, typically 2 weeks

---

## Resources

- **Experiment Dashboard:** `app/admin/growth-experiments/page.tsx`
- **A/B Testing API:** `app/api/leads/ab-test/`
- **Metrics Tracking:** `lib/analytics/metrics.ts`
- **Experiment Documentation:** This file
