# 500 Global Growth Experiments — AIAS Platform

**Last Updated:** 2025-01-29  
**Goal:** Run 3 growth experiments per week to accelerate growth

---

## Experiment 1: A/B Test Onboarding Flow

### Hypothesis
"We believe optimizing the onboarding flow (reducing steps, adding progress indicators) will increase activation rate from [current]% to 40%+ for new users. We'll know we're right when activation rate increases to 40%+."

### Test Design
- **Control:** Current 5-step onboarding wizard
- **Variant:** Optimized 3-step onboarding with progress indicators
- **Sample Size:** 100+ users per variant
- **Duration:** 2 weeks

### Metrics
- **Primary:** Activation rate (% who create first workflow)
- **Secondary:** Time-to-activation (days from signup to first workflow)
- **Secondary:** Drop-off rate (where users exit onboarding)

### Implementation
- **Files to Modify:**
  - `app/onboarding/page.tsx` — Add A/B test assignment
  - `components/onboarding/wizard.tsx` — Create optimized variant
  - `app/api/leads/ab-test/assign/route.ts` — Use existing A/B test API

### Results
- **Status:** [TODO: Update after experiment]
- **Activation Rate (Control):** [TODO]
- **Activation Rate (Variant):** [TODO]
- **Statistical Significance:** [TODO]
- **Winner:** [TODO]

### Learnings
- [TODO: Document learnings]

### Next Steps
- [TODO: Scale/Iterate/Kill based on results]

---

## Experiment 2: Test Referral Rewards

### Hypothesis
"We believe offering commission-based referral rewards (vs. XP or credits) will increase referral rate from 5% to 15% for existing users. We'll know we're right when referral rate increases to 15%+."

### Test Design
- **Variant A:** XP rewards (gamification) — Current
- **Variant B:** Credits rewards (platform credits)
- **Variant C:** Commission rewards (revenue share)
- **Sample Size:** 50+ users per variant
- **Duration:** 2 weeks

### Metrics
- **Primary:** Referral rate (% of users who refer friends)
- **Secondary:** Referral signups (number of signups from referrals)
- **Secondary:** Referral conversions (referral signups → paying customers)

### Implementation
- **Files to Modify:**
  - `components/gamification/ReferralWidget.tsx` — Add reward variants
  - `app/api/referrals/invite/route.ts` — Create invite API endpoint
  - `supabase/migrations/*` — Add referral rewards tracking

### Results
- **Status:** [TODO: Update after experiment]
- **Referral Rate (Variant A):** [TODO]
- **Referral Rate (Variant B):** [TODO]
- **Referral Rate (Variant C):** [TODO]
- **Statistical Significance:** [TODO]
- **Winner:** [TODO]

### Learnings
- [TODO: Document learnings]

### Next Steps
- [TODO: Scale/Iterate/Kill based on results]

---

## Experiment 3: Test Pricing Page Copy

### Hypothesis
"We believe emphasizing benefits and social proof (vs. features) on the pricing page will increase conversion rate (free → paid) from [current]% to 10%+ for free users. We'll know we're right when conversion rate increases to 10%+."

### Test Design
- **Control:** Current pricing page (features-focused)
- **Variant A:** Benefits-focused copy ("Save 10+ hours/week")
- **Variant B:** Social proof-focused copy ("Join 1,000+ Canadian businesses")
- **Sample Size:** 200+ visitors per variant
- **Duration:** 2 weeks

### Metrics
- **Primary:** Conversion rate (free → paid)
- **Secondary:** Click-through rate (pricing page → checkout)
- **Secondary:** Time on pricing page

### Implementation
- **Files to Modify:**
  - `app/pricing/page.tsx` — Add A/B test assignment
  - Create variant components for benefits and social proof

### Results
- **Status:** [TODO: Update after experiment]
- **Conversion Rate (Control):** [TODO]
- **Conversion Rate (Variant A):** [TODO]
- **Conversion Rate (Variant B):** [TODO]
- **Statistical Significance:** [TODO]
- **Winner:** [TODO]

### Learnings
- [TODO: Document learnings]

### Next Steps
- [TODO: Scale/Iterate/Kill based on results]

---

## Experiment 4: Add Viral Invite Flow

### Hypothesis
"We believe adding a viral invite flow after onboarding completion will increase referral rate from 5% to 15% for new users. We'll know we're right when referral rate increases to 15%+."

### Test Design
- **Control:** No invite prompt after onboarding
- **Variant:** Invite prompt after onboarding completion ("Invite 3 friends to unlock Pro features")
- **Sample Size:** 100+ users per variant
- **Duration:** 2 weeks

### Metrics
- **Primary:** Referral rate (% of users who invite friends)
- **Secondary:** Invite completion rate (% who complete invite flow)
- **Secondary:** Referral signups (number of signups from invites)

### Implementation
- **Files to Modify:**
  - `app/onboarding/complete/page.tsx` — Add invite prompt
  - `components/plg/share-invite.tsx` — Create invite component
  - `app/api/referrals/invite/route.ts` — Create invite API endpoint

### Results
- **Status:** [TODO: Update after experiment]
- **Referral Rate (Control):** [TODO]
- **Referral Rate (Variant):** [TODO]
- **Statistical Significance:** [TODO]
- **Winner:** [TODO]

### Learnings
- [TODO: Document learnings]

### Next Steps
- [TODO: Scale/Iterate/Kill based on results]

---

## Experiment 5: SEO Landing Pages

### Hypothesis
"We believe creating SEO-optimized landing pages for high-intent keywords will increase organic traffic from [current] to 1,000+ visitors/month. We'll know we're right when organic traffic increases to 1,000+ visitors/month."

### Test Design
- **Control:** Current blog-only SEO strategy
- **Variant:** 5-10 SEO-optimized landing pages for high-intent keywords
- **Keywords:** "Shopify automation Canada", "Canadian business automation", "Wave Accounting integration"
- **Duration:** 4 weeks (SEO takes time to rank)

### Metrics
- **Primary:** Organic search traffic (Google Analytics)
- **Secondary:** Keyword rankings
- **Secondary:** Conversion rate (organic → signup → paying)

### Implementation
- **Files to Create:**
  - `app/seo/shopify-automation-canada/page.tsx`
  - `app/seo/canadian-business-automation/page.tsx`
  - `app/seo/wave-accounting-integration/page.tsx`
  - [More landing pages...]

### Results
- **Status:** [TODO: Update after experiment]
- **Organic Traffic (Before):** [TODO]
- **Organic Traffic (After):** [TODO]
- **Keyword Rankings:** [TODO]

### Learnings
- [TODO: Document learnings]

### Next Steps
- [TODO: Scale/Iterate/Kill based on results]

---

## Experiment 6: Embeddable Widget

### Hypothesis
"We believe creating an embeddable workflow preview widget will increase signups from embeds by 10+ per month. We'll know we're right when embed signups increase to 10+ per month."

### Test Design
- **Control:** No embeddable widget
- **Variant:** Embeddable workflow preview widget
- **Sample Size:** 50+ embeds
- **Duration:** 4 weeks

### Metrics
- **Primary:** Embed signups (signups from embeds)
- **Secondary:** Embed views
- **Secondary:** Embed conversion rate (views → signups)

### Implementation
- **Files to Create:**
  - `components/embeds/workflow-preview.tsx` — Create embeddable widget
  - `app/api/embeds/[id]/route.ts` — Create embed API endpoint

### Results
- **Status:** [TODO: Update after experiment]
- **Embed Signups:** [TODO]
- **Embed Views:** [TODO]
- **Conversion Rate:** [TODO]

### Learnings
- [TODO: Document learnings]

### Next Steps
- [TODO: Scale/Iterate/Kill based on results]

---

## Experiment Tracking

### Weekly Experiment Log

| Week | Experiment 1 | Experiment 2 | Experiment 3 | Status |
|------|-------------|-------------|-------------|--------|
| Week 1 | Onboarding A/B | Referral Rewards | Pricing Copy | Planned |
| Week 2 | Onboarding A/B | Referral Rewards | Pricing Copy | Running |
| Week 3 | Viral Invite | SEO Landing Pages | Embed Widget | Planned |
| Week 4 | Viral Invite | SEO Landing Pages | Embed Widget | Running |

---

## Experiment Success Criteria

### Activation Experiments
- **Success:** Activation rate increases to 40%+
- **Failure:** Activation rate decreases or stays the same

### Referral Experiments
- **Success:** Referral rate increases to 15%+
- **Failure:** Referral rate decreases or stays the same

### Conversion Experiments
- **Success:** Conversion rate increases to 10%+
- **Failure:** Conversion rate decreases or stays the same

### Traffic Experiments
- **Success:** Organic traffic increases to 1,000+ visitors/month
- **Failure:** Organic traffic decreases or stays the same

---

## Resources

- **Growth Levers Inventory:** `yc/500_GLOBAL_GROWTH_LEVERS.md`
- **Experiment Cadence:** `yc/EXPERIMENT_CADENCE.md`
- **A/B Testing API:** `app/api/leads/ab-test/`
- **Experiment Dashboard:** `app/admin/growth-experiments/page.tsx`
