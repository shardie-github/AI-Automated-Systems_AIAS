# Sprint Quick Start Guide

**Current Sprint:** User Activation & Onboarding MVP  
**Sprint Period:** 2025-01-31 to 2025-03-01 (30 days)  
**Last Updated:** 2025-01-30

---

## 🎯 Sprint Goal

> **By the end of this 30-day sprint, a new user can reliably sign up, complete a 5-step onboarding flow, connect their first integration (Shopify or Wave Accounting), create their first workflow from a pre-built template, and see it execute successfully. We can measure activation rate (target >60%), time-to-activation (target <24 hours), and Day 7 retention (target >40%).**

---

## 📊 Sprint Health: Last 30 Days

**Overall Score: 2.8/5** (Adequate but Fragile)

| Dimension | Score | Status |
|-----------|-------|--------|
| Product Clarity | 3/5 | Adequate but Fragile |
| Architecture & Code Quality | 4/5 | Strong and Compounding |
| Execution Velocity | 2/5 | Very Weak / Chaotic |
| Reliability & Observability | 3/5 | Adequate but Fragile |
| Learning & Validation | 2/5 | Very Weak / Chaotic |

**Key Finding:** Strong foundational work completed, but sprint goal (marketplace MVP) not achieved. No user-facing features shipped.

---

## 🚀 First 72 Hours Action Plan

### Day 1: Foundation Setup
- [ ] Create sprint branch: `feature/onboarding-sprint-week-1`
- [ ] Create GitHub project board with Week 1 tasks
- [ ] Design database schema for onboarding and integrations
- [ ] Create migration file: `supabase/migrations/[timestamp]_onboarding_schema.sql`
- [ ] Set up environment variables (Shopify, Wave OAuth)
- [ ] Create onboarding API endpoints skeleton
- [ ] **PR #1:** Database schema

### Day 2: OAuth Integration & Onboarding UI
- [ ] Complete Shopify OAuth integration
- [ ] Complete Wave Accounting OAuth integration
- [ ] Create onboarding page (`app/onboarding/page.tsx`)
- [ ] Create onboarding wizard component
- [ ] Create step indicator component
- [ ] Create integration connection component
- [ ] **PR #2:** Onboarding API & OAuth

### Day 3: Complete Onboarding Flow & Telemetry
- [ ] Complete onboarding wizard (all 5 steps)
- [ ] Add telemetry tracking (onboarding events)
- [ ] End-to-end testing
- [ ] Error handling improvements
- [ ] UI polish
- [ ] **PR #3:** Complete onboarding flow

**End of Day 3:** Should have 3 PRs open, onboarding flow functional, OAuth integrations working.

---

## 📅 Week-by-Week Overview

### Week 1: Foundations & Onboarding Flow
**Goal:** Complete onboarding flow skeleton and integration connection infrastructure.

**Key Deliverables:**
- Database schema for onboarding and integrations
- Onboarding API endpoints
- Shopify OAuth integration
- Wave OAuth integration
- Onboarding page and wizard UI

**Checkpoint:** Can demo onboarding flow with OAuth integrations

---

### Week 2: Workflow Templates & Creation Flow
**Goal:** Complete workflow template library and creation flow.

**Key Deliverables:**
- Workflow template database schema
- Template API endpoints
- Workflow creation API
- Workflow execution engine
- Template library UI
- Workflow creation wizard

**Checkpoint:** Can demo complete flow: onboarding → workflow creation → execution

---

### Week 3: Activation Funnel Instrumentation & Metrics Dashboard
**Goal:** Instrument activation funnel and build metrics dashboard MVP.

**Key Deliverables:**
- Activation funnel instrumentation (all events tracked)
- Metrics calculation functions
- Metrics API endpoints
- Metrics dashboard UI
- Error tracking integration (Sentry)
- Performance monitoring setup

**Checkpoint:** Can answer "Are we improving?" with data

---

### Week 4: Polish, Performance & User Testing
**Goal:** Final UX polish, performance optimization, and user validation.

**Key Deliverables:**
- Mobile responsiveness
- Accessibility improvements
- Performance optimizations
- User satisfaction survey
- Documentation
- Sprint retrospective

**Checkpoint:** Sprint goal achieved, ready for next sprint

---

## 🔑 Key Documents

- **[Sprint Review & Planning](./SPRINT_REVIEW_AND_PLANNING.md)** - Complete sprint review and planning document
- **[Sprint Goal](./SPRINT_N+1_GOAL.md)** - Detailed sprint goal and success criteria
- **[Sprint Backlog](./SPRINT_BACKLOG.md)** - Detailed task backlog (update for this sprint)
- **[Product Decisions](./decisions/)** - Architecture Decision Records
- **[Sprint Learnings](./sprint-learnings/)** - Feedback and validation results

---

## ⚠️ Critical Actions (Next 7 Days)

### Safety (Errors, Data, Reliability)
1. **Fix environment variable sync** ⏱️ Quick Win (≤1 hour)
2. **Integrate error tracking (Sentry)** ⏱️ Deep Work (≥3 hours)
3. **Add database backup verification** ⏱️ Quick Win (≤1 hour)
4. **Add input validation to all API routes** ⏱️ Deep Work (≥3 hours)

### Clarity (Docs, Decision Records)
5. **Create sprint goal alignment document** ⏱️ Quick Win (≤1 hour) ✅ Done
6. **Document sprint retrospective** ⏱️ Quick Win (≤1 hour)
7. **Create product decision records** ⏱️ Quick Win (≤1 hour) ✅ Done

### Leverage (Instrumentation, Automation)
8. **Instrument activation funnel events** ⏱️ Deep Work (≥3 hours)
9. **Build metrics dashboard MVP** ⏱️ Deep Work (≥3 hours)
10. **Add test coverage for critical paths** ⏱️ Deep Work (≥3 hours)

See [Sprint Review & Planning](./SPRINT_REVIEW_AND_PLANNING.md#g-7-day-improvement-checklist) for full 7-day checklist.

---

## 📈 Success Metrics

### Weekly Metrics Dashboard
- **Week 1:** Onboarding completion rate, OAuth success rate
- **Week 2:** Workflow creation rate, workflow execution success rate
- **Week 3:** Activation rate, time-to-activation, Day 7 retention
- **Week 4:** Final activation rate, user satisfaction, performance metrics

### Sprint Goal Success Criteria
- ✅ Activation rate >60%
- ✅ Time-to-activation <24 hours (median)
- ✅ Day 7 retention >40%
- ✅ Onboarding completion rate >80%
- ✅ Integration connection success rate >95%

---

## 🎯 Next Steps

1. **Read:** [Sprint Review & Planning](./SPRINT_REVIEW_AND_PLANNING.md) for complete context
2. **Review:** [Sprint Goal](./SPRINT_N+1_GOAL.md) for detailed success criteria
3. **Execute:** [First 72 Hours Action Plan](#-first-72-hours-action-plan)
4. **Track:** Use GitHub project board for task tracking
5. **Review:** Weekly checkpoints (end of each week)

---

**Questions?** See [Sprint Review & Planning](./SPRINT_REVIEW_AND_PLANNING.md) for detailed answers.

**Last Updated:** 2025-01-30
