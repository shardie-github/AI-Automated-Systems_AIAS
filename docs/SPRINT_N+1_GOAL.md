# Sprint Goal: User Activation & Onboarding MVP

**Sprint Period:** 2025-01-31 to 2025-03-01 (30 days)  
**Sprint Number:** Sprint N+1  
**Status:** Active  
**Last Updated:** 2025-01-30

---

## Sprint Goal Statement

> **By the end of this 30-day sprint, a new user can reliably sign up, complete a 5-step onboarding flow, connect their first integration (Shopify or Wave Accounting), create their first workflow from a pre-built template, and see it execute successfully. We can measure activation rate (target >60%), time-to-activation (target <24 hours), and Day 7 retention (target >40%).**

---

## Success Criteria

### UX/Product Criteria
1. ✅ **Onboarding Flow:** User completes 5-step wizard (welcome → connect integration → create workflow → see results → explore) in <10 minutes
2. ✅ **Integration Connection:** User successfully connects Shopify or Wave Accounting via OAuth flow (<2 minutes)
3. ✅ **Workflow Creation:** User creates first workflow from template library (<5 minutes)
4. ✅ **Workflow Execution:** User sees workflow run successfully and receives confirmation

### Technical Quality/Reliability Criteria
5. ✅ **Integration Reliability:** Shopify and Wave integrations work with retry logic and error handling
6. ✅ **Uptime:** Onboarding and workflow creation endpoints achieve 99%+ uptime
7. ✅ **Data Persistence:** All user data, integrations, and workflows persist correctly in Supabase

### Data/Observability Criteria
8. ✅ **Activation Funnel Instrumentation:** All events tracked (`user_signed_up`, `integration_connected`, `workflow_created`, `user_activated`)
9. ✅ **Metrics Dashboard MVP:** Admin can view activation rate, time-to-activation, Day 7 retention in dashboard

### Learning/Validation Criteria
10. ✅ **User Testing:** At least 5 internal users complete onboarding and provide feedback
11. ✅ **Activation Rate:** Achieve >60% activation rate (connect integration + create workflow within 7 days)
12. ✅ **Time-to-Activation:** Median time-to-activation <24 hours

---

## Weekly Milestones

### Week 1 (Days 1-7): Foundations & Onboarding Flow
**Must Complete:**
- Database schema deployed to Supabase
- Onboarding flow renders with all 5 steps
- Shopify OAuth flow works (can connect and store tokens)
- Wave OAuth flow works (can connect and store tokens)
- Telemetry events fire correctly

**Checkpoint:** Can demo onboarding flow with OAuth integrations

---

### Week 2 (Days 8-14): Workflow Templates & Creation Flow
**Must Complete:**
- Template library displays 5+ templates
- User can select template and configure it
- Workflow creation API creates workflow record
- Workflow execution engine runs workflows successfully
- At least 2 different template types work

**Checkpoint:** Can demo complete flow: onboarding → workflow creation → execution

---

### Week 3 (Days 15-21): Activation Funnel Instrumentation & Metrics Dashboard
**Must Complete:**
- All activation funnel events tracked
- Metrics dashboard displays activation rate, time-to-activation, Day 7 retention
- Error tracking integrated and working
- At least 5 users have completed activation funnel
- Metrics calculations validated

**Checkpoint:** Can answer "Are we improving?" with data

---

### Week 4 (Days 22-30): Polish, Performance & User Testing
**Must Complete:**
- All features polished and tested
- Documentation complete
- Performance targets met (Lighthouse score >90)
- Accessibility audit passed
- User testing completed with >80% success rate
- Activation rate >60% achieved

**Checkpoint:** Sprint goal achieved, ready for next sprint

---

## Decision Log

### Why This Goal vs. Alternatives

**Alternative 1: Complete Marketplace MVP**
- **Why Not:** Last sprint attempted this but execution diverged. Need to establish user activation first before building marketplace.
- **Decision:** Defer to next sprint after activation is proven.

**Alternative 2: Metrics Dashboard Only**
- **Why Not:** Important but doesn't deliver user-facing value. Need to balance internal tools with user value.
- **Decision:** Include metrics dashboard as part of activation sprint (Week 3).

**Alternative 3: Complete OpenAI Integration**
- **Why Not:** Important but activation is more foundational. Can't have AI agents if users don't activate.
- **Decision:** Defer to sprint after activation is proven.

**Why This Goal:**
- **Addresses Critical Gap:** Last sprint delivered no user-facing value. This sprint fixes that.
- **Enables Revenue:** Activation is prerequisite for paid conversion.
- **Builds on Existing Infrastructure:** Uses existing telemetry, API routes, integrations.
- **Clear Success Metrics:** Activation rate, time-to-activation, Day 7 retention are measurable.
- **Risk Mitigation:** Clear scope, existing integrations, straightforward implementation.

---

## Alignment Mechanisms

### Daily Standups
- Review progress against weekly milestones
- Identify blockers early
- Adjust plan if needed

### Weekly Checkpoints
- Demo progress to stakeholders
- Review metrics dashboard
- Collect feedback and adjust

### Sprint Retrospective
- What went well?
- What didn't go well?
- What did we learn?
- What should we do differently next sprint?

---

## Risk Mitigation

### Risk 1: OAuth Integration Complexity
- **Mitigation:** Start with Shopify (well-documented), then Wave. Use existing OAuth libraries.
- **Contingency:** Simplify OAuth flow if needed, defer Wave to next sprint.

### Risk 2: Workflow Execution Engine Complexity
- **Mitigation:** Start with simple templates (Shopify order processing, Wave invoicing). Use existing workflow API.
- **Contingency:** Simplify execution engine if needed, focus on happy path first.

### Risk 3: Activation Rate <60%
- **Mitigation:** Improve onboarding UX, add tooltips, reduce friction. Test with users early.
- **Contingency:** Extend sprint by 1 week if needed, or adjust target to 50% for MVP.

### Risk 4: Metrics Dashboard Takes Too Long
- **Mitigation:** Start with simple dashboard (3 metrics), iterate. Use existing telemetry infrastructure.
- **Contingency:** Defer to next sprint if needed, focus on activation funnel instrumentation first.

---

## Success Metrics Tracking

### Weekly Metrics Dashboard
- **Week 1:** Onboarding completion rate, OAuth success rate
- **Week 2:** Workflow creation rate, workflow execution success rate
- **Week 3:** Activation rate, time-to-activation, Day 7 retention
- **Week 4:** Final activation rate, user satisfaction, performance metrics

### Daily Metrics
- Onboarding starts
- Onboarding completions
- Integration connections
- Workflow creations
- Workflow executions

---

**Document Owner:** Product Lead  
**Review Frequency:** Weekly  
**Next Review:** End of Week 1 (2025-02-07)
