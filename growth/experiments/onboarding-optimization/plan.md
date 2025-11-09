# Experiment: Onboarding Flow Optimization

**Slug:** `onboarding-optimization`  
**Status:** Ready to Launch  
**Created:** 2025-01-28  
**Owner:** Growth Team

---

## Hypothesis

**If** we improve the onboarding flow with clearer instructions, progress indicators, and value demonstration,  
**Then** new users will have higher activation rates and lower refund rates,  
**Because** they'll better understand the product value and how to use it effectively.

---

## Target Metrics

### Primary Metric
- **Refund Rate** (target: reduce from 5% to 3%)

### Secondary Metrics
- **Day 1 Activation Rate** (target: increase from 40% to 55%)
- **Day 7 Retention Rate** (target: increase from 60% to 70%)
- **Time to First Value** (target: reduce from 15 minutes to 8 minutes)

---

## Success Threshold

**Minimum Success:** Refund rate reduces by 20% (from 5% to 4%)  
**Target Success:** Refund rate reduces by 40% (from 5% to 3%)  
**Stretch Goal:** Refund rate reduces by 50% (from 5% to 2.5%)

---

## Sample Size Calculation

**Statistical Significance:** 95% confidence, 80% power  
**Baseline Refund Rate:** 5%  
**Minimum Detectable Effect:** 1% absolute reduction (20% relative)  
**Required Sample Size:** ~3,800 users per variant (7,600 total)

**Sample Size Heuristic:** Run for 4-6 weeks or until 7,600 users reached

---

## Variants

### Variant A (Control)
- Current onboarding flow
- No changes

### Variant B (Treatment)
- **Progress indicator** showing onboarding steps
- **Interactive tutorial** with tooltips
- **Value demonstration** within first 3 steps
- **Success metrics** shown after completion
- **Onboarding checklist** with clear completion criteria

---

## Rollout Plan

### Phase 1: Soft Launch (Week 1)
- **Traffic Split:** 10% treatment, 90% control
- **Goal:** Validate technical implementation
- **Success Criteria:** No critical bugs, metrics tracking works

### Phase 2: 50/50 Split (Week 2-4)
- **Traffic Split:** 50% treatment, 50% control
- **Goal:** Collect statistical significance
- **Success Criteria:** Reach 7,600 users total

### Phase 3: Full Rollout (Week 5+)
- **Traffic Split:** 100% treatment (if successful)
- **Goal:** Scale improvements to all users
- **Success Criteria:** Maintain improved metrics

---

## Rollback Plan

**Trigger Conditions:**
- Refund rate increases by >1% absolute
- Critical bugs affecting >5% of users
- Day 1 activation rate decreases by >10% absolute

**Rollback Steps:**
1. Immediately switch 100% traffic to control variant
2. Investigate root cause
3. Fix issues before re-launching
4. Document learnings

---

## Metrics Tracking

### Events to Track
- `onboarding_started`
- `onboarding_step_completed` (with step number)
- `onboarding_completed`
- `onboarding_abandoned` (with last step)
- `first_value_achieved` (with time to value)
- `refund_requested` (with time since signup)

### Database Queries
```sql
-- Refund rate by variant
SELECT 
  variant,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE refunded = true) as refunded_users,
  COUNT(*) FILTER (WHERE refunded = true)::NUMERIC / COUNT(*)::NUMERIC as refund_rate
FROM onboarding_experiment_users
WHERE experiment_slug = 'onboarding-optimization'
GROUP BY variant;

-- Day 1 activation rate
SELECT 
  variant,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE day_1_active = true) as day_1_active_users,
  COUNT(*) FILTER (WHERE day_1_active = true)::NUMERIC / COUNT(*)::NUMERIC as day_1_activation_rate
FROM onboarding_experiment_users
WHERE experiment_slug = 'onboarding-optimization'
GROUP BY variant;
```

---

## Dependencies

- **Feature Flag:** `onboarding_optimization_v2` (in flags.json)
- **Database Tables:** `experiments`, `events`, `orders`
- **Frontend Components:** Onboarding flow components
- **Analytics:** Event tracking infrastructure

---

## Financial Impact

### Base Scenario (Month 1)
- **Current Refund Rate:** 5% of $50K revenue = $2,500/month refunds
- **Target Refund Rate:** 3% of $50K revenue = $1,500/month refunds
- **Net Revenue Improvement:** +$1,000/month
- **Annual Impact:** +$12,000/year

### At Scale (Month 12)
- **Current Refund Rate:** 0.8% of $325K revenue = $2,600/month refunds
- **Target Refund Rate:** 0.5% of $325K revenue = $1,625/month refunds
- **Net Revenue Improvement:** +$975/month
- **Annual Impact:** +$11,700/year

---

## Timeline

- **Week 1:** Design and build treatment variant
- **Week 2:** QA and soft launch (10% traffic)
- **Week 3-5:** 50/50 split, collect data
- **Week 6:** Analyze results, decide on full rollout
- **Week 7+:** Full rollout (if successful)

---

## Risks

1. **Onboarding becomes too long:** Users abandon before completion
   - **Mitigation:** Monitor abandonment rate, optimize step count

2. **Technical issues:** Bugs in new flow
   - **Mitigation:** Thorough QA, gradual rollout, rollback plan

3. **No significant improvement:** Experiment shows no effect
   - **Mitigation:** Learn from results, iterate on hypothesis

---

## Done When

- [ ] Experiment reaches statistical significance (7,600 users)
- [ ] Refund rate reduces by at least 20% (minimum success)
- [ ] Day 1 activation rate improves or stays neutral
- [ ] No critical bugs or user complaints
- [ ] Results documented and shared with team
- [ ] Decision made on full rollout or iteration

---

**Last Updated:** 2025-01-28  
**Next Review:** Weekly during experiment
