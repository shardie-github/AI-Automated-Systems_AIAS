# Sprint Quick Reference — March 2025

**Sprint:** March 1-31, 2025 (30 days)  
**Sprint Goal:** User Activation & Onboarding MVP  
**Status:** Active

---

## Sprint Goal

> **By the end of this 30-day sprint, a new user can reliably sign up, complete a validated 5-step onboarding flow, connect their first integration (Shopify or Wave Accounting) via working OAuth flows, create their first workflow from a pre-built template, and see it execute successfully. We can measure activation rate (target >60%), time-to-activation (target <24 hours), and Day 7 retention (target >40%) through instrumented telemetry events.**

---

## Success Criteria

### Must Achieve
1. ✅ Onboarding flow validated and working (5-step wizard)
2. ✅ Shopify & Wave OAuth integrations working
3. ✅ Workflow templates & creation working
4. ✅ Activation funnel events instrumented (`user_signed_up`, `integration_connected`, `workflow_created`, `user_activated`)
5. ✅ Metrics dashboard shows activation rate, time-to-activation, Day 7 retention
6. ✅ 5+ users tested onboarding and provided feedback
7. ✅ Activation rate >60% (measured via events)
8. ✅ Time-to-activation <24 hours (measured via events)

---

## Week-by-Week Focus

### Week 1: Validate & Instrument
- **Focus:** Validate features work, instrument activation events, fix critical gaps
- **Key Deliverables:** Feature validation complete, events instrumented, env vars synced, error tracking working

### Week 2: Complete & Test
- **Focus:** Complete missing features, fix broken features, first user testing
- **Key Deliverables:** All features working, workflow engine complete, 3-5 users tested

### Week 3: Dashboard & Monitor
- **Focus:** Build metrics dashboard, set up performance monitoring, more user testing
- **Key Deliverables:** Dashboard shows metrics, performance monitoring working, 5 users tested

### Week 4: Polish & Retro
- **Focus:** Polish features, optimize performance, validate sprint goal, retrospective
- **Key Deliverables:** Features polished, performance targets met, activation rate >60%, retrospective complete

---

## Critical Actions (First 72 Hours)

### Day 1
1. Create feature validation checklist
2. Validate onboarding flow
3. Validate integration OAuth flows
4. Fix environment variable sync
5. Create sprint execution status dashboard

### Day 2
1. Instrument `user_signed_up` event
2. Instrument `integration_connected` event
3. Set up error tracking (Sentry)
4. Fix any broken features from Day 1

### Day 3
1. Instrument `workflow_created` event
2. Instrument `user_activated` event
3. Validate workflow templates system
4. Complete any missing workflow features

---

## Key Documents

- **Sprint Review & Planning:** `docs/SPRINT_REVIEW_AND_PLANNING_2025_03.md`
- **Feature Validation:** `docs/FEATURE_VALIDATION_CHECKLIST.md`
- **Execution Status:** `docs/SPRINT_EXECUTION_STATUS.md`
- **User Feedback Template:** `docs/sprint-learnings/USER_FEEDBACK_TEMPLATE.md`
- **Metrics Instrumentation:** `docs/METRICS_INSTRUMENTATION.md`
- **Sprint Goal:** `docs/SPRINT_N+1_GOAL.md`

---

## Daily Checkpoint Questions

**Week 1:**
- Can we measure activation today?
- Do onboarding and integrations work?
- Are environment variables synced?
- Is error tracking working?

**Week 2:**
- Can users complete onboarding?
- Can users connect integrations?
- Can users create workflows?
- Have we tested with users?

**Week 3:**
- Can we see metrics in dashboard?
- Are we improving?
- What did users say?
- Are we on track?

**Week 4:**
- Did we achieve sprint goal?
- What did we learn?
- What should we do differently?
- Are we ready for next sprint?

---

## Risk Register

### High Priority
1. **Features may not work** - Validate in Week 1
2. **Activation events not instrumented** - Instrument in Week 1
3. **Environment variables not synced** - Fix in Week 1

### Medium Priority
4. **User testing not conducted** - Schedule in Week 2-3
5. **Metrics dashboard not built** - Build in Week 3

---

## Quick Links

- [Feature Validation Checklist](FEATURE_VALIDATION_CHECKLIST.md)
- [Sprint Execution Status](SPRINT_EXECUTION_STATUS.md)
- [User Feedback Template](sprint-learnings/USER_FEEDBACK_TEMPLATE.md)
- [Metrics Instrumentation](METRICS_INSTRUMENTATION.md)
- [Full Sprint Plan](SPRINT_REVIEW_AND_PLANNING_2025_03.md)

---

**Last Updated:** 2025-03-01  
**Next Update:** Daily during sprint
