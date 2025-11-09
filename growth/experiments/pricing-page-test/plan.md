# Experiment: Pricing Page A/B Test

**Slug:** `pricing-page-test`  
**Status:** Ready to Launch  
**Created:** 2025-01-28  
**Owner:** Growth Team

---

## Hypothesis

**If** we optimize the pricing page with clearer value propositions, social proof, and pricing psychology,  
**Then** more visitors will convert to paid customers or choose higher-tier plans,  
**Because** better presentation increases perceived value and reduces decision friction.

---

## Target Metrics

### Primary Metric
- **Conversion Rate** (target: increase by 15%, from 2% to 2.3%)
- **ARPU** (Average Revenue Per User) (target: increase by 10%)

### Secondary Metrics
- **Time on Pricing Page** (target: increase engagement)
- **Plan Selection Distribution** (target: shift to higher tiers)
- **Bounce Rate** (target: decrease)

---

## Success Threshold

**Minimum Success:** Conversion rate increases by 10% OR ARPU increases by 5%  
**Target Success:** Conversion rate increases by 15% AND ARPU increases by 10%  
**Stretch Goal:** Conversion rate increases by 20% AND ARPU increases by 15%

---

## Sample Size Calculation

**Statistical Significance:** 95% confidence, 80% power  
**Baseline Conversion Rate:** 2%  
**Minimum Detectable Effect:** 0.2% absolute increase (10% relative)  
**Required Sample Size:** ~50,000 visitors per variant (100,000 total)

**Sample Size Heuristic:** Run for 4-6 weeks or until 100,000 visitors reached

---

## Variants

### Variant A (Control)
- Current pricing page
- Standard 3-tier pricing display
- Basic feature comparison

### Variant B (Treatment)
- **Value-focused headlines** ("Start growing today" vs "Pricing")
- **Social proof** (customer count, testimonials)
- **Anchoring** (show annual savings prominently)
- **Urgency** (limited-time offer messaging)
- **Feature highlights** (most popular plan highlighted)
- **Clearer CTAs** (action-oriented button text)

### Variant C (Alternative Treatment - Optional)
- **Simplified pricing** (2 tiers instead of 3)
- **Trial-first approach** (emphasize free trial)
- **Different value props** (focus on outcomes vs features)

---

## Rollout Plan

### Phase 1: 50/50 Split (Week 1-4)
- **Traffic Split:** 50% control, 50% treatment
- **Goal:** Collect statistical significance
- **Success Criteria:** Reach 100,000 visitors total

### Phase 2: Full Rollout (Week 5+)
- **Traffic Split:** 100% treatment (if successful)
- **Goal:** Scale improvements to all visitors
- **Success Criteria:** Maintain improved metrics

---

## Rollback Plan

**Trigger Conditions:**
- Conversion rate decreases by >0.5% absolute
- ARPU decreases by >5%
- Bounce rate increases by >10% absolute

**Rollback Steps:**
1. Immediately switch 100% traffic to control variant
2. Analyze what went wrong
3. Iterate on treatment design
4. Re-test with new variant

---

## Metrics Tracking

### Events to Track
- `pricing_page_viewed` (with variant)
- `pricing_plan_selected` (with plan tier)
- `pricing_cta_clicked` (with variant and plan)
- `pricing_page_bounced` (with time on page)
- `checkout_started` (with plan selected)

### Database Queries
```sql
-- Conversion rate by variant
SELECT 
  variant,
  COUNT(DISTINCT session_id) as visitors,
  COUNT(DISTINCT CASE WHEN checkout_started THEN session_id END) as conversions,
  COUNT(DISTINCT CASE WHEN checkout_started THEN session_id END)::NUMERIC / COUNT(DISTINCT session_id)::NUMERIC as conversion_rate
FROM pricing_page_events
WHERE event_date >= '2025-01-28'
GROUP BY variant;

-- ARPU by variant
SELECT 
  variant,
  AVG(order_amount) as arpu,
  COUNT(*) as orders
FROM orders o
JOIN pricing_page_events p ON o.session_id = p.session_id
WHERE o.created_at >= '2025-01-28'
GROUP BY variant;
```

---

## Dependencies

- **Feature Flag:** `pricing_page_v2` (in flags.json)
- **Database Tables:** `events`, `orders`
- **Frontend Components:** Pricing page components
- **Analytics:** Conversion tracking infrastructure

---

## Financial Impact

### Base Scenario (Month 1)
- **Current Conversion Rate:** 2% of 10,000 visitors = 200 customers
- **Current Revenue:** 200 customers × $50 ARPU = $10,000/month
- **Target Conversion Rate:** 2.3% of 10,000 visitors = 230 customers
- **Target ARPU:** $55 (10% increase)
- **Target Revenue:** 230 customers × $55 ARPU = $12,650/month
- **Revenue Increase:** +$2,650/month
- **Annual Impact:** +$31,800/year

### At Scale (Month 12)
- **Current Conversion Rate:** 2% of 50,000 visitors = 1,000 customers
- **Current Revenue:** 1,000 customers × $50 ARPU = $50,000/month
- **Target Conversion Rate:** 2.3% of 50,000 visitors = 1,150 customers
- **Target ARPU:** $55 (10% increase)
- **Target Revenue:** 1,150 customers × $55 ARPU = $63,250/month
- **Revenue Increase:** +$13,250/month
- **Annual Impact:** +$159,000/year

---

## Timeline

- **Week 1:** Design treatment variants
- **Week 2:** Build and QA treatment variants
- **Week 3-6:** 50/50 split, collect data
- **Week 7:** Analyze results, decide on full rollout
- **Week 8+:** Full rollout (if successful)

---

## Risks

1. **Over-optimization:** Pricing page becomes too salesy
   - **Mitigation:** Monitor bounce rate and user feedback

2. **No significant improvement:** Test shows no effect
   - **Mitigation:** Learn from results, test different approaches

3. **Technical issues:** Variant breaks on certain devices/browsers
   - **Mitigation:** Thorough QA, gradual rollout, rollback plan

---

## Done When

- [ ] Experiment reaches statistical significance (100,000 visitors)
- [ ] Conversion rate increases by at least 10% OR ARPU increases by 5% (minimum success)
- [ ] No negative impact on other metrics
- [ ] Results documented and shared with team
- [ ] Decision made on full rollout or iteration

---

**Last Updated:** 2025-01-28  
**Next Review:** Weekly during experiment
