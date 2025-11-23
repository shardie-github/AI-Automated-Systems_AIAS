# Lead Generation System Documentation

## Overview

The Lead Generation System is a comprehensive, autopilot-enabled platform for capturing, scoring, nurturing, and converting leads at scale. It provides end-to-end automation for lead generation workflows with built-in analytics, cost optimization, and ROI tracking.

## Architecture

### Core Components

1. **Lead Capture** (`lib/lead-generation/lead-capture.ts`)
   - Automated lead capture with validation
   - Duplicate detection
   - Data enrichment
   - Initial scoring

2. **Lead Scoring** (`lib/lead-generation/lead-scoring.ts`)
   - Multi-factor scoring (demographic, behavioral, engagement, fit)
   - Automated qualification
   - Priority assignment
   - Recommendations generation

3. **Lead Nurturing** (`lib/lead-generation/lead-nurturing.ts`)
   - Email sequence automation
   - Workflow-based nurturing
   - Conditional step execution
   - Engagement tracking

4. **CRM Integration** (`lib/lead-generation/crm-integration.ts`)
   - Multi-provider support (Salesforce, HubSpot, Pipedrive, Custom)
   - Circuit breaker protection
   - Batch synchronization
   - Sync logging

5. **Conversion Tracking** (`lib/lead-generation/conversion-tracking.ts`)
   - Multi-touch attribution
   - Conversion event tracking
   - ROI calculation
   - Performance analytics

6. **A/B Testing** (`lib/lead-generation/ab-testing.ts`)
   - Variation assignment
   - Statistical significance calculation
   - Conversion tracking per variation
   - Winner determination

7. **Cost Optimization** (`lib/lead-generation/cost-optimization.ts`)
   - Cost tracking by source/campaign
   - Cost per lead/conversion analysis
   - Optimization recommendations
   - Trend analysis

8. **ROI Tracking** (`lib/lead-generation/roi-tracking.ts`)
   - Comprehensive ROI metrics
   - Revenue attribution
   - LTV/CAC calculation
   - Payback period analysis

9. **Autopilot Workflows** (`lib/lead-generation/autopilot-workflows.ts`)
   - Event-driven automation
   - Conditional workflow execution
   - Multi-action support
   - Execution logging

10. **Growth Analytics** (`app/api/leads/growth-analytics/route.ts`)
    - Unified dashboard API
    - Comprehensive metrics
    - Performance insights
    - Growth rate calculation

## API Endpoints

### Lead Capture
- `POST /api/leads/capture` - Capture a new lead
- `POST /api/leads/score` - Score an existing lead

### Conversions
- `POST /api/leads/conversions` - Track a conversion
- `GET /api/leads/conversions/stats` - Get conversion statistics

### CRM Integration
- `POST /api/leads/crm/sync` - Sync lead to CRM

### A/B Testing
- `POST /api/leads/ab-test/assign` - Assign visitor to variation
- `GET /api/leads/ab-test/results` - Get test results

### Analytics
- `GET /api/leads/costs/analyze` - Cost analysis
- `GET /api/leads/roi` - ROI metrics
- `GET /api/leads/growth-analytics` - Comprehensive growth dashboard

### Workflows
- `POST /api/leads/workflows` - Create workflow
- `GET /api/leads/workflows` - List workflows

## Usage Examples

### Capturing a Lead

```typescript
import { leadCaptureService } from '@/lib/lead-generation/lead-capture';

const result = await leadCaptureService.captureLead({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  company: 'Acme Corp',
  source: 'website',
  campaign: 'summer-2024',
}, tenantId);

if (result.success) {
  console.log(`Lead captured: ${result.leadId}`);
  console.log(`Score: ${result.score}`);
  console.log(`Qualified: ${result.qualified}`);
}
```

### Scoring a Lead

```typescript
import { leadScoringService } from '@/lib/lead-generation/lead-scoring';

const score = await leadScoringService.calculateScore(leadId, tenantId);

console.log(`Total Score: ${score.total}`);
console.log(`Qualified: ${score.qualified}`);
console.log(`Priority: ${score.priority}`);
console.log(`Recommendations:`, score.recommendations);
```

### Starting Nurturing Sequence

```typescript
import { leadNurturingService } from '@/lib/lead-generation/lead-nurturing';

await leadNurturingService.startNurturingSequence(
  leadId,
  sequenceId,
  tenantId
);
```

### Syncing to CRM

```typescript
import { crmIntegrationService } from '@/lib/lead-generation/crm-integration';

const result = await crmIntegrationService.syncLeadToCRM(
  leadId,
  {
    provider: 'hubspot',
    apiKey: 'your-api-key',
  },
  tenantId
);

if (result.success) {
  console.log(`Synced to CRM: ${result.crmId}`);
}
```

### Tracking Conversion

```typescript
import { conversionTrackingService } from '@/lib/lead-generation/conversion-tracking';

await conversionTrackingService.trackConversion({
  leadId,
  type: 'purchase',
  value: 999.99,
  currency: 'USD',
}, tenantId);
```

### Creating Autopilot Workflow

```typescript
import { autopilotWorkflowService } from '@/lib/lead-generation/autopilot-workflows';

const workflowId = await autopilotWorkflowService.createWorkflow({
  name: 'Qualified Lead Workflow',
  trigger: 'lead_qualified',
  actions: [
    {
      type: 'assign_to_sales',
      config: { teamId: 'sales-team-1' },
    },
    {
      type: 'sync_crm',
      config: {
        provider: 'hubspot',
        apiKey: process.env.HUBSPOT_API_KEY,
      },
    },
  ],
  enabled: true,
}, tenantId);
```

### A/B Testing

```typescript
import { abTestingService } from '@/lib/lead-generation/ab-testing';

// Assign variation
const variationId = await abTestingService.assignVariation(
  testId,
  visitorId,
  tenantId
);

// Track conversion
await abTestingService.trackConversion(
  testId,
  visitorId,
  'signup',
  0,
  tenantId
);

// Get results
const results = await abTestingService.getTestResults(testId, tenantId);
console.log(`Winner: ${results.winner}`);
console.log(`Confidence: ${results.confidence}%`);
```

## Database Schema

The system uses the following key tables:

- `leads` - Main leads table
- `lead_activities` - Lead activity tracking
- `email_interactions` - Email engagement
- `lead_sessions` - Website session tracking
- `email_queue` - Email sending queue
- `nurturing_sequences` - Nurturing sequence definitions
- `nurturing_schedule` - Scheduled nurturing steps
- `conversions` - Conversion events
- `marketing_costs` - Marketing spend tracking
- `roi_tracking` - ROI calculations
- `ab_tests` - A/B test definitions
- `ab_test_assignments` - Visitor variation assignments
- `autopilot_workflows` - Workflow definitions
- `workflow_executions` - Workflow execution logs

See `supabase/migrations/20250131000000_lead_generation_tables.sql` for complete schema.

## Autopilot Features

### Event Triggers

- `lead_captured` - When a new lead is captured
- `lead_scored` - When a lead is scored
- `lead_qualified` - When a lead qualifies (score >= 70)
- `lead_unqualified` - When a lead doesn't qualify
- `conversion` - When a lead converts
- `schedule` - Scheduled workflows

### Available Actions

- `send_email` - Send email template
- `assign_to_sales` - Assign to sales team/user
- `sync_crm` - Sync to CRM system
- `start_nurturing` - Start nurturing sequence
- `update_score` - Recalculate lead score
- `notify` - Send notification

## Cost Optimization

The system tracks costs by:
- Source (e.g., Google Ads, Facebook)
- Campaign (e.g., summer-2024)
- Type (advertising, content, event, tool, other)

It provides:
- Cost per lead (CPL)
- Cost per conversion (CPC)
- ROI by source/campaign
- Optimization recommendations

## ROI Tracking

Key metrics tracked:
- Total Revenue
- Total Cost
- ROI (%)
- ROAS (Return on Ad Spend)
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- LTV:CAC Ratio
- Payback Period

## Best Practices

1. **Lead Scoring**: Regularly review and adjust scoring weights based on conversion data
2. **Nurturing**: Test different email sequences and timing
3. **A/B Testing**: Run tests with sufficient sample sizes for statistical significance
4. **Cost Tracking**: Record all marketing costs for accurate ROI calculation
5. **CRM Sync**: Sync qualified leads immediately for faster sales response
6. **Workflows**: Start with simple workflows and add complexity gradually
7. **Analytics**: Review growth analytics weekly to identify trends and opportunities

## Security

- All endpoints support tenant isolation
- RLS policies enforce data access control
- API keys stored securely (not in code)
- Circuit breakers protect external integrations
- Input validation on all endpoints

## Performance

- Caching for duplicate detection
- Batch operations for bulk processing
- Indexed database queries
- Async workflow execution
- Distributed rate limiting

## Monitoring

- Structured logging for all operations
- Error tracking and alerting
- Performance metrics
- Workflow execution logs
- Conversion funnel analytics
