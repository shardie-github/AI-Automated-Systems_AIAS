# Lean Startup Hypotheses — AIAS Platform

**Last Updated:** 2025-01-29  
**Purpose:** Document explicit hypotheses for problem, customer segment, solution, revenue model, and growth channel

---

## Hypothesis Format

**Format:** "We believe [X] will [Y] for [Z]. We'll know we're right when [metric]."

---

## Core Hypotheses

### Hypothesis 1: Problem Hypothesis

**Statement:** "We believe Canadian SMBs waste 10-30 hours/week on repetitive manual tasks (order processing, lead qualification, proposal writing) and would pay $49/month to automate them. We'll know we're right when 80%+ of customer interviews confirm the problem exists and 50%+ are willing to pay $49/month."

**Validation Status:** Partially Validated
**Evidence:** Personas defined, market research done
**Confidence:** Medium

**Test Methods:**
1. Customer interviews (20 interviews)
2. Surveys (100+ responses)
3. Market research (TAM/SAM/SOM)

**Success Criteria:**
- 80%+ confirm problem exists
- Average time wasted: 10+ hours/week
- 50%+ willing to pay $49/month

---

### Hypothesis 2: Customer Segment Hypothesis

**Statement:** "We believe Canadian e-commerce SMBs (Shopify store owners) are the best initial customer segment because they have the clearest pain point (manual order processing) and highest willingness to pay ($49/month). We'll know we're right when 40%+ of Shopify store owners activate (create first workflow) within 7 days of signup."

**Validation Status:** Not Validated
**Evidence:** Persona defined (Sarah Chen), no validation data
**Confidence:** Low

**Test Methods:**
1. Target Shopify store owners for signups
2. Measure activation rate (signup → first workflow)
3. Compare activation rate vs. other segments

**Success Criteria:**
- 40%+ activation rate for Shopify store owners
- Higher activation rate than other segments
- 50%+ willing to pay $49/month

---

### Hypothesis 3: Solution Hypothesis

**Statement:** "We believe visual workflow builders solve the problem by allowing users to automate tasks without coding. We'll know we're right when 70%+ of beta testers successfully create and execute their first workflow within 2 days of signup."

**Validation Status:** Not Validated
**Evidence:** Workflow builder exists, no beta testing data
**Confidence:** Low

**Test Methods:**
1. Concierge MVP (manually execute workflows for 10 customers)
2. Beta testing (invite 50 users to try product)
3. Prototype testing (show workflow builder to potential users)

**Success Criteria:**
- 70%+ successfully create workflows
- Average time-to-activation: < 2 days
- 80%+ get value (time saved)

---

### Hypothesis 4: Revenue Model Hypothesis

**Statement:** "We believe $49/month subscription pricing is the right model because it's affordable for SMBs ($49 vs. $150-500 competitors) and provides predictable revenue. We'll know we're right when 10%+ of free users convert to paid within 30 days of signup."

**Validation Status:** Not Validated
**Evidence:** Pricing exists, no conversion data
**Confidence:** Low

**Test Methods:**
1. Pricing tests (show pricing on landing page)
2. Conversion tracking (free → paid)
3. Willingness to pay interviews

**Success Criteria:**
- 10%+ conversion rate (free → paid)
- Average ARPU: $49/month
- LTV:CAC ratio: 3:1+

---

### Hypothesis 5: Growth Channel Hypothesis

**Statement:** "We believe Shopify App Store is the best initial growth channel because it reaches 100K+ Shopify stores in Canada with high intent (users searching for automation). We'll know we're right when Shopify App Store drives 100+ installs/month with 20%+ activation rate."

**Validation Status:** Not Validated
**Evidence:** Shopify integration exists, app not yet listed
**Confidence:** Low

**Test Methods:**
1. Submit app to Shopify App Store
2. Track installs and activations
3. Compare performance vs. other channels

**Success Criteria:**
- 100+ installs/month from Shopify App Store
- 20%+ activation rate (installs → activated)
- Lower CAC than other channels

---

## Feature-to-Hypothesis Mapping

### Feature: Onboarding Flow
- **Tests Hypothesis:** Solution Hypothesis (users can get started quickly)
- **Validation Status:** Not Validated
- **Metrics:** Activation rate, time-to-activation

### Feature: Workflow Builder
- **Tests Hypothesis:** Solution Hypothesis (users can automate tasks without coding)
- **Validation Status:** Not Validated
- **Metrics:** Workflow creation rate, workflow execution rate

### Feature: Canadian Integrations
- **Tests Hypothesis:** Customer Segment Hypothesis (Shopify store owners need Canadian integrations)
- **Validation Status:** Not Validated
- **Metrics:** Integration usage rate, activation rate

### Feature: Pricing Tiers
- **Tests Hypothesis:** Revenue Model Hypothesis ($49/month is right price)
- **Validation Status:** Not Validated
- **Metrics:** Conversion rate (free → paid), ARPU

### Feature: Referral System
- **Tests Hypothesis:** Growth Channel Hypothesis (referrals drive growth)
- **Validation Status:** Not Validated
- **Metrics:** Referral rate, referral conversions

---

## Hypothesis Validation Status

| Hypothesis | Status | Evidence | Confidence | Next Steps |
|------------|--------|----------|------------|------------|
| Problem | Partially Validated | Personas, market research | Medium | Run 20 interviews |
| Customer Segment | Not Validated | Persona defined | Low | Target Shopify store owners |
| Solution | Not Validated | Workflow builder exists | Low | Run concierge MVP |
| Revenue Model | Not Validated | Pricing exists | Low | Run pricing tests |
| Growth Channel | Not Validated | Shopify integration exists | Low | Submit to Shopify App Store |

---

## Next Steps

1. **Run Customer Interviews:** Validate problem hypothesis (20 interviews)
2. **Target Shopify Store Owners:** Validate customer segment hypothesis
3. **Run Concierge MVP:** Validate solution hypothesis (10 customers)
4. **Run Pricing Tests:** Validate revenue model hypothesis
5. **Submit to Shopify App Store:** Validate growth channel hypothesis

---

## Resources

- **Feature Map:** `yc/LEAN_STARTUP_FEATURE_MAP.md`
- **Validation Board:** `yc/LEAN_STARTUP_VALIDATION_BOARD.md`
- **Learnings:** `yc/LEAN_STARTUP_LEARNINGS.md`
- **Experiments:** `yc/LEAN_STARTUP_EXPERIMENTS.md`
