# Sprint Quick Reference — February 2025

**Sprint Period:** February 1 - March 1, 2025 (30 days)  
**Sprint Goal:** User Activation & Onboarding MVP  
**Status:** Active

---

## Sprint Goal

> By the end of this 30-day sprint, a new user can reliably sign up, complete a 5-step onboarding flow, connect their first integration (Shopify or Wave Accounting), create their first workflow from a pre-built template, and see it execute successfully. We can measure activation rate (target >60%), time-to-activation (target <24 hours), and Day 7 retention (target >40%).

---

## Success Criteria

### Must-Have (P0)
- ✅ Onboarding flow complete (5 steps, <10 minutes)
- ✅ Shopify OAuth integration working
- ✅ Wave OAuth integration working
- ✅ Workflow creation from templates working
- ✅ Activation funnel events instrumented
- ✅ Metrics dashboard MVP showing activation rate, time-to-activation, Day 7 retention
- ✅ At least 5 users complete onboarding and provide feedback
- ✅ Activation rate >60%

---

## Week-by-Week Summary

### Week 1: Foundations & Onboarding Flow
**Goal:** Database schema deployed, onboarding flow renders, OAuth integrations work, telemetry events fire.

**Key Deliverables:**
- Database schema (integrations, workflows, templates)
- Onboarding flow skeleton (5 steps)
- Shopify OAuth integration
- Wave OAuth integration
- Telemetry events (`user_signed_up`, `integration_connected`)
- Error tracking (Sentry)

**Checkpoint:** Can demo onboarding flow with OAuth integrations

---

### Week 2: Workflow Templates & Creation Flow
**Goal:** Template library displays, user can create workflow, workflow execution engine runs successfully.

**Key Deliverables:**
- Template library (5+ templates)
- Workflow creation API
- Workflow execution engine
- Workflow creation UI
- First user demo completed

**Checkpoint:** Can demo complete flow: onboarding → workflow creation → execution

---

### Week 3: Activation Funnel Instrumentation & Metrics Dashboard
**Goal:** All activation funnel events tracked, metrics dashboard displays key metrics, error tracking working.

**Key Deliverables:**
- Complete activation funnel instrumentation
- Metrics dashboard MVP
- Metrics calculation queries
- 5 user testing sessions completed

**Checkpoint:** Can answer "Are we improving?" with data

---

### Week 4: Polish, Performance & User Testing
**Goal:** All features polished, performance targets met, user testing validates improvements, activation rate >60% achieved.

**Key Deliverables:**
- Onboarding flow polish
- Performance optimization
- Accessibility improvements
- Final user testing
- Sprint retrospective

**Checkpoint:** Sprint goal achieved, ready for next sprint

---

## Critical Path Tasks

### Week 1 (Must Complete)
1. Database schema migration (`supabase/migrations/[timestamp]_onboarding_schema.sql`)
2. Shopify OAuth integration (`app/api/integrations/shopify/route.ts`)
3. Wave OAuth integration (`app/api/integrations/wave/route.ts`)
4. Onboarding flow skeleton (`app/onboarding/page.tsx`)
5. Telemetry events (`lib/telemetry/track.ts`)

### Week 2 (Must Complete)
1. Workflow execution engine (`lib/workflows/executor.ts`)
2. Template system (`lib/workflows/templates.ts`)
3. Workflow creation API (`app/api/workflows/route.ts`)
4. Template library UI (`app/onboarding/select-template/page.tsx`)

### Week 3 (Must Complete)
1. Metrics dashboard (`app/admin/metrics/page.tsx`)
2. Metrics calculation queries (`lib/analytics/metrics.ts`)
3. Complete activation funnel instrumentation
4. User testing sessions (5 users)

### Week 4 (Must Complete)
1. Performance optimization
2. Accessibility improvements
3. Final user testing
4. Sprint retrospective

---

## First 72 Hours Action Plan

### Day 1 (Feb 1)
- [ ] Database schema migration
- [ ] Error tracking setup (Sentry)
- [ ] `user_signed_up` event instrumentation
- [ ] Onboarding flow skeleton
- [ ] Environment variable sync fix

**PR:** "feat: onboarding schema and error tracking setup"

### Day 2 (Feb 2)
- [ ] Shopify OAuth integration
- [ ] Wave OAuth integration

**PR:** "feat: Shopify and Wave OAuth integrations"

### Day 3 (Feb 3)
- [ ] Onboarding flow integration
- [ ] `integration_connected` event instrumentation
- [ ] Template system foundation
- [ ] Internal dogfooding session

**PR:** "feat: onboarding flow integration and template system"

---

## 7-Day Improvement Checklist

### Safety (Priority 1)
1. Fix environment variable sync (Quick Win)
2. Integrate error tracking (Sentry) (Deep Work)
3. Add database backup verification (Quick Win)
4. Add input validation to API routes (Deep Work)

### Clarity (Priority 2)
5. Update sprint goal document (Quick Win)
6. Document sprint retrospective (Quick Win)
7. Create product decision records (Quick Win)
8. Update metrics instrumentation checklist (Quick Win)

### Leverage (Priority 3)
9. Instrument activation funnel events (Deep Work)
10. Build metrics dashboard MVP (Deep Work)
11. Add test coverage for critical paths (Deep Work)
12. Set up performance monitoring (Deep Work)

---

## Key Metrics to Track

### Activation Metrics
- **Activation Rate:** >60% (connect integration + create workflow within 7 days)
- **Time-to-Activation:** <24 hours (median)
- **Activation Funnel:** Signup → Integration → Workflow → Activation

### Retention Metrics
- **Day 7 Retention:** >40%
- **Day 1 Retention:** >60%

### Product Metrics
- **Workflows Created:** Average 1+ per user
- **Workflow Execution Success Rate:** >95%

---

## Risk Mitigation

### Risk 1: OAuth Integration Complexity
- **Mitigation:** Start with Shopify (well-documented), then Wave
- **Contingency:** Simplify OAuth flow if needed

### Risk 2: Workflow Execution Engine Complexity
- **Mitigation:** Start with simple templates, use existing workflow API
- **Contingency:** Simplify execution engine if needed

### Risk 3: Activation Rate <60%
- **Mitigation:** Improve onboarding UX, add tooltips, reduce friction
- **Contingency:** Extend sprint by 1 week or adjust target to 50%

### Risk 4: Metrics Dashboard Takes Too Long
- **Mitigation:** Start with simple dashboard (3 metrics), iterate
- **Contingency:** Defer to next sprint if needed

---

## Daily Standup Questions

1. What did I complete yesterday?
2. What am I working on today?
3. Are there any blockers?
4. Are we on track for this week's checkpoint?

---

## Weekly Checkpoint Questions

1. Did we complete this week's deliverables?
2. Can we demo this week's progress?
3. Are we on track for the sprint goal?
4. What risks or blockers do we see?
5. What adjustments do we need to make?

---

## Sprint Retrospective Template

### What Went Well
- [ ] List 3-5 things that went well

### What Didn't Go Well
- [ ] List 3-5 things that didn't go well

### What We Learned
- [ ] List 3-5 key learnings

### Action Items for Next Sprint
- [ ] List 3-5 action items

### Metrics Review
- [ ] Activation rate: ___% (target >60%)
- [ ] Time-to-activation: ___ hours (target <24 hours)
- [ ] Day 7 retention: ___% (target >40%)

---

## Quick Links

- **Full Sprint Review:** `docs/SPRINT_REVIEW_AND_PLANNING_2025_02.md`
- **Sprint Goal:** `docs/SPRINT_N+1_GOAL.md`
- **Sprint Backlog:** `docs/SPRINT_BACKLOG.md` (needs update)
- **Metrics Framework:** `docs/METRICS_AND_FORECASTS.md`
- **Metrics Instrumentation:** `docs/METRICS_INSTRUMENTATION.md`

---

**Last Updated:** 2025-02-01  
**Next Review:** End of Week 1 (2025-02-07)
