# Autonomous Reliability, Financial, and Security Orchestrator

## Overview

The Orchestrator is an autonomous system that monitors, analyzes, forecasts, and hardens the Hardonia full-stack environment (Vercel × Supabase × Expo × GitHub). It operates on a **verify → analyze → forecast → harden → report** cycle.

## Core Principles

- ✅ **Never exposes secrets** - All secret scanning is done without printing values
- ✅ **Never breaks builds** - All changes go through safe PRs
- ✅ **Never modifies user data** - Read-only analysis and safe automated fixes only
- ✅ **Safe mode by default** - Simulate → Log → PR workflow

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Orchestrator                          │
│              (Main Coordination Layer)                   │
└─────────────────────────────────────────────────────────┘
         │         │         │         │         │
         ▼         ▼         ▼         ▼         ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │Dependency│ │  Cost  │ │Security│ │ Uptime │ │Dashboard│
    │  Health │ │Forecast│ │ Auditor │ │Monitor │ │Generator│
    └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

## Modules

### 1. Dependency Health Checker
- Runs `pnpm outdated --json`, `npm audit --json`, `expo doctor`
- Detects outdated/vulnerable packages
- Groups by service (root, apps, packages)
- Identifies safe patch/minor updates
- Validates lockfile consistency

### 2. Cost Forecaster
- Collects metrics from Vercel, Supabase, Expo, GitHub Actions
- Computes rolling averages
- Predicts cost overruns
- Generates `cost_forecast.json` and `reliability_trends.json`

### 3. Security Auditor
- **Secret Auditing**: Scans .env and config files (never prints values)
- **SBOM Generation**: Creates CycloneDX SBOM at `/security/sbom.json`
- **License Checking**: Flags GPL and non-commercial licenses
- **TLS/CORS Audit**: Verifies HTTPS enforcement and CORS headers
- **RLS Validation**: Checks Row Level Security on all Supabase tables
- **GDPR Checks**: Validates data anonymization and retention policies
- **SOC 2 Readiness**: Validates audit logs and change control

### 4. Uptime Monitor
- Pings `/api/health` endpoints every 6 hours
- Records latency in `metrics_log`
- Creates GitHub issues for downtime > 2 minutes
- Triages recurring errors (> 3 occurrences)

### 5. Dashboard Generator
- Generates `/admin/reliability.json` and `/admin/reliability.md`
- Aggregates data from all modules
- Auto-refreshes post-deploy

### 6. PR Automation
- Creates safe PRs for patch/minor dependency updates
- Labels: `security-auto`, `dependencies`, `automated`
- Major/breaking changes → Issues + draft PRs requiring approval

## Usage

### Run Full Cycle
```bash
npm run orchestrator
# or
npm run orchestrator:run
```

### Scheduled Runs
```bash
# Hourly (uptime check only)
npm run orchestrator:hourly

# Daily (full cycle)
npm run orchestrator:daily
```

### Programmatic Usage
```typescript
import { Orchestrator } from './ai/orchestrator';

const orchestrator = new Orchestrator({
  budget: 75,
  reliabilityThreshold: 99.9,
  enableAutoPR: true
});

await orchestrator.run();
```

## Configuration

### Environment Variables

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your-org
GITHUB_REPO=your-repo

# Optional
ORCHESTRATOR_BUDGET=75                    # Monthly budget in USD
ORCHESTRATOR_RELIABILITY_THRESHOLD=99.9    # Target uptime %
ORCHESTRATOR_AUTO_PR=true                 # Enable auto-PRs
ORCHESTRATOR_AUTO_FIX=true                # Enable auto-fixes
RELIABILITY_ALERT_WEBHOOK=https://...     # Webhook for alerts
VERCEL_PROJECT_ID=your_project_id         # For Vercel metrics
```

## Outputs

### Per Cycle
- `dependency-report.json` - Dependency health analysis
- `cost_forecast.json` - Cost projections
- `reliability_trends.json` - Performance trends
- `/admin/reliability.json` - Dashboard data
- `/admin/reliability.md` - Human-readable dashboard
- `/admin/compliance.json` - Compliance status
- `SECURITY_COMPLIANCE_REPORT.md` - Full security audit
- `/security/sbom.json` - Software Bill of Materials
- `/compliance/audits/YYYY-MM-DD/orchestrator_report_N.json` - Cycle reports

### Database Tables
- `orchestrator_reports` - Full cycle reports
- `dependency_reports` - Dependency health snapshots
- `cost_forecasts` - Cost predictions
- `security_audits` - Security audit results
- `metrics_log` - Uptime and performance metrics

## Dashboards

### Reliability Dashboard
Access at `/admin/reliability`:
- Uptime metrics and trends
- Performance (latency, error rate, throughput)
- Dependency health
- Cost forecasts
- Security status
- Recommendations

### Compliance Dashboard
Access at `/admin/compliance`:
- Secrets status
- License compliance
- TLS/RLS enforcement
- GDPR compliance
- Issue summary

## Auto-PR Policy

### Safe Auto-PR (No Approval Required)
- Patch/minor dependency updates
- Non-breaking security fixes
- Configuration optimizations

### Requires Manual Approval
- Major version updates
- Breaking changes
- Infrastructure changes
- Cost-impacting changes

## Success Criteria

- ✅ All services ≥ 99.9% uptime
- ✅ No high-severity vulnerabilities open > 48 hours
- ✅ Monthly cost forecast within ±10% accuracy
- ✅ GDPR / SOC 2 / ISO 27001 hygiene met
- ✅ Security & performance dashboards auto-refresh

## Guardrails

1. **Never expose secrets** - All secret detection is pattern-based, values are never logged
2. **Skip breaking upgrades** - Only patch/minor updates in auto-PRs
3. **Safe mode default** - All changes go through PR review
4. **Audit retention** - Last 3 audit snapshots retained for rollback

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Orchestrator Daily Run
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
  workflow_dispatch:

jobs:
  orchestrator:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: npm run orchestrator:daily
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_OWNER: ${{ github.repository_owner }}
          GITHUB_REPO: ${{ github.event.repository.name }}
```

## Troubleshooting

### Orchestrator fails to connect to Supabase
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check network connectivity
- Verify RLS policies allow service role access

### Auto-PR creation fails
- Verify `GITHUB_TOKEN` has repo write permissions
- Check branch protection rules
- Ensure `ORCHESTRATOR_AUTO_PR=true`

### Missing metrics
- Verify services are properly instrumented
- Check `metrics_log` table exists
- Review module-specific error logs

## Extensions

### Optional Integrations
- **OpenTelemetry** → Grafana dashboards
- **AI Anomaly Detection** → Z-score/Prophet for proactive alerts
- **Slack/Discord** → Real-time alerts for regressions
- **Weekly Digest** → Email/Google Sheets summary

## License

MIT

---

*Last Updated: January 24, 2025*
*Version: 1.0.0*
