# Feature Validation Checklist

**Last Updated:** 2025-03-01  
**Sprint:** March 2025 (Sprint N+2)  
**Status:** In Progress

---

## Overview

This checklist tracks the validation status of features required for the sprint goal: "User Activation & Onboarding MVP".

**Validation Status Legend:**
- ✅ **Working** - Feature exists, tested, and works end-to-end
- ⚠️ **Partial** - Feature exists but has issues or incomplete
- ❌ **Not Working** - Feature exists but broken
- ❓ **Unknown** - Feature status unclear, needs testing
- ➖ **Missing** - Feature doesn't exist

---

## Sprint Goal Features

### 1. Onboarding Flow (5-Step Wizard)

**Status:** ❓ **Unknown**

**Required Steps:**
1. Welcome screen
2. Connect integration (Shopify or Wave)
3. Create workflow from template
4. See results
5. Explore

**Files to Check:**
- `app/onboarding/page.tsx`
- `components/onboarding/OnboardingWizard.tsx`

**Manual Test Steps:**
1. Navigate to `/onboarding`
2. Complete all 5 steps
3. Verify progress tracking works
4. Verify navigation between steps works
5. Verify data persists between steps

**Telemetry Events:**
- `onboarding_started` - Fires when user starts onboarding
- `onboarding_step_completed` - Fires when user completes each step
- `onboarding_completed` - Fires when user completes all steps

**Validation Results:**
- [ ] Feature exists in code
- [ ] All 5 steps render
- [ ] Progress tracking works
- [ ] Navigation works
- [ ] Data persists
- [ ] Telemetry events fire
- [ ] Tested with 1+ users

**Issues Found:**
- _Document issues here_

**Action Items:**
- _Document action items here_

---

### 2. Shopify OAuth Integration

**Status:** ❓ **Unknown**

**Required Functionality:**
- OAuth flow initiates
- User can authorize Shopify
- Tokens stored securely
- Token refresh works
- Connection status displays

**Files to Check:**
- `app/api/integrations/shopify/route.ts`
- `lib/integrations/shopify.ts`
- `components/integrations/ShopifyCard.tsx`

**Manual Test Steps:**
1. Navigate to integrations page
2. Click "Connect Shopify"
3. Complete OAuth flow
4. Verify tokens stored in database
5. Verify connection status displays
6. Test token refresh

**Telemetry Events:**
- `integration_connect_started` - Fires when user starts OAuth flow
- `integration_connected` - Fires when OAuth succeeds
- `integration_connect_failed` - Fires when OAuth fails

**Validation Results:**
- [ ] Feature exists in code
- [ ] OAuth flow works
- [ ] Tokens stored securely
- [ ] Token refresh works
- [ ] Connection status displays
- [ ] Error handling works
- [ ] Telemetry events fire
- [ ] Tested with 1+ users

**Issues Found:**
- _Document issues here_

**Action Items:**
- _Document action items here_

---

### 3. Wave Accounting OAuth Integration

**Status:** ❓ **Unknown**

**Required Functionality:**
- OAuth flow initiates
- User can authorize Wave
- Tokens stored securely
- Token refresh works
- Connection status displays

**Files to Check:**
- `app/api/integrations/wave/route.ts`
- `lib/integrations/wave.ts`
- `components/integrations/WaveCard.tsx`

**Manual Test Steps:**
1. Navigate to integrations page
2. Click "Connect Wave"
3. Complete OAuth flow
4. Verify tokens stored in database
5. Verify connection status displays
6. Test token refresh

**Telemetry Events:**
- `integration_connect_started` - Fires when user starts OAuth flow
- `integration_connected` - Fires when OAuth succeeds
- `integration_connect_failed` - Fires when OAuth fails

**Validation Results:**
- [ ] Feature exists in code
- [ ] OAuth flow works
- [ ] Tokens stored securely
- [ ] Token refresh works
- [ ] Connection status displays
- [ ] Error handling works
- [ ] Telemetry events fire
- [ ] Tested with 1+ users

**Issues Found:**
- _Document issues here_

**Action Items:**
- _Document action items here_

---

### 4. Workflow Template Library

**Status:** ❓ **Unknown**

**Required Functionality:**
- Templates display in grid/list
- Template cards show descriptions
- User can select template
- User can configure template

**Files to Check:**
- `app/onboarding/select-template/page.tsx`
- `components/templates/TemplateCard.tsx`
- `lib/workflows/templates.ts`

**Manual Test Steps:**
1. Navigate to template selection page
2. Verify templates display
3. Click on a template
4. Verify template details show
5. Select a template
6. Verify configuration form appears

**Telemetry Events:**
- `template_viewed` - Fires when user views template
- `template_selected` - Fires when user selects template

**Validation Results:**
- [ ] Feature exists in code
- [ ] Templates display
- [ ] Template selection works
- [ ] Configuration form works
- [ ] Telemetry events fire
- [ ] Tested with 1+ users

**Issues Found:**
- _Document issues here_

**Action Items:**
- _Document action items here_

---

### 5. Workflow Creation

**Status:** ❓ **Unknown**

**Required Functionality:**
- User can create workflow from template
- Configuration form validates inputs
- Workflow record created in database
- Success confirmation displays

**Files to Check:**
- `app/api/workflows/route.ts`
- `components/workflows/WorkflowForm.tsx`
- `app/onboarding/create-workflow/page.tsx`

**Manual Test Steps:**
1. Select a template
2. Fill out configuration form
3. Submit workflow creation
4. Verify workflow record created
5. Verify success message displays
6. Test validation (empty fields, invalid inputs)

**Telemetry Events:**
- `workflow_created` - Fires when workflow created successfully
- `workflow_creation_failed` - Fires when workflow creation fails

**Validation Results:**
- [ ] Feature exists in code
- [ ] Workflow creation works
- [ ] Validation works
- [ ] Database record created
- [ ] Success message displays
- [ ] Error handling works
- [ ] Telemetry events fire
- [ ] Tested with 1+ users

**Issues Found:**
- _Document issues here_

**Action Items:**
- _Document action items here_

---

### 6. Workflow Execution

**Status:** ❓ **Unknown**

**Required Functionality:**
- Workflow executes successfully
- Execution results display
- Success/error states handled
- User receives confirmation

**Files to Check:**
- `lib/workflows/executor.ts`
- `components/workflows/ExecutionResults.tsx`
- `app/onboarding/results/page.tsx`

**Manual Test Steps:**
1. Create a workflow
2. Trigger workflow execution
3. Verify execution runs
4. Verify results display
5. Test error scenarios
6. Verify confirmation message

**Telemetry Events:**
- `workflow_executed` - Fires when workflow executes
- `workflow_execution_succeeded` - Fires when execution succeeds
- `workflow_execution_failed` - Fires when execution fails

**Validation Results:**
- [ ] Feature exists in code
- [ ] Workflow execution works
- [ ] Results display correctly
- [ ] Error handling works
- [ ] Confirmation displays
- [ ] Telemetry events fire
- [ ] Tested with 1+ users

**Issues Found:**
- _Document issues here_

**Action Items:**
- _Document action items here_

---

## Activation Funnel Events

### Event Instrumentation Status

**Status:** ❌ **Not Instrumented**

**Required Events:**
1. `user_signed_up` - Fires on signup
2. `integration_connected` - Fires when integration connected
3. `workflow_created` - Fires when workflow created
4. `user_activated` - Fires when user activates (integration + workflow)

**Validation Results:**
- [ ] `user_signed_up` event fires
- [ ] `integration_connected` event fires
- [ ] `workflow_created` event fires
- [ ] `user_activated` event fires
- [ ] Events visible in telemetry logs
- [ ] Can calculate activation rate from events

**Issues Found:**
- _Document issues here_

**Action Items:**
- _Document action items here_

---

## Summary

**Overall Status:** ❓ **Unknown** - Needs validation

**Features Validated:** 0/6
**Events Instrumented:** 0/4

**Critical Blockers:**
- _Document blockers here_

**Next Steps:**
1. Validate onboarding flow
2. Validate integration OAuth flows
3. Validate workflow templates and creation
4. Instrument activation funnel events
5. Test end-to-end flow with users

---

**Last Updated:** 2025-03-01  
**Next Update:** End of Week 1
