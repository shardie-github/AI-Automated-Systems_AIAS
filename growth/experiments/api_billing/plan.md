# API Billing Experiment Plan

**Experiment ID:** api-billing-001  
**Owner:** Engineering Lead  
**Status:** Ready  
**Priority:** P0

## Hypothesis

Usage-based API billing with pricing tiers (Free: 1000 calls, Pro: 10K calls, Enterprise: unlimited) will increase API revenue to $15K/month within 6 months.

## Metrics

### Primary Metrics
- API revenue (target: $1K/month in 30 days, $15K/month in 6 months)
- API calls/day (target: 100+ calls/day in 30 days)
- Conversion rate from free to paid (target: 15%)

### Secondary Metrics
- Customer satisfaction (NPS)
- Churn rate
- Support ticket volume

## Guardrails

- Billing cap: $1000/month per customer without approval
- Rate limiting: 1000 req/min per API key
- Alert on billing anomalies (>2x normal usage)
- Manual review for charges > $500/month

## Rollout Plan

1. **Week 1:** Internal testing, billing logic validation
2. **Week 2:** Beta rollout to 10 customers (50% rollout)
3. **Week 3:** Full rollout (100%)
4. **Week 4:** Monitor and optimize

## Success Criteria

### 30-Day Signal
- API revenue > $1K/month
- 100+ API calls/day
- No billing errors

### 60-Day Signal
- API revenue > $5K/month
- 500+ API calls/day
- Conversion rate > 10%

### 90-Day Signal
- API revenue > $10K/month
- 1000+ API calls/day
- Conversion rate > 15%

## Risk Mitigation

- Grandfather existing users (free tier for 30 days)
- Clear pricing communication
- Support SLA for billing questions
- Easy opt-out process

## Next Steps

1. Implement billing logic
2. Set up usage tracking
3. Create pricing page
4. Launch beta
