# Orchestrator Quick Start

## Quick Commands

```bash
# Run full orchestrator cycle
npm run orchestrator

# Run hourly (uptime check only)
npm run orchestrator:hourly

# Run daily (full cycle)
npm run orchestrator:daily
```

## Environment Setup

Required environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your-org
GITHUB_REPO=your-repo
```

Optional:

```bash
ORCHESTRATOR_BUDGET=75
ORCHESTRATOR_RELIABILITY_THRESHOLD=99.9
ORCHESTRATOR_AUTO_PR=true
RELIABILITY_ALERT_WEBHOOK=https://your-webhook-url
```

## What It Does

1. **Dependency Health** - Checks for outdated/vulnerable packages
2. **Cost Forecasting** - Predicts infrastructure costs
3. **Security Audit** - Scans for secrets, licenses, TLS, RLS, GDPR
4. **Uptime Monitoring** - Checks health endpoints every 6h
5. **Dashboard Generation** - Creates `/admin/reliability` and `/admin/compliance`

## Outputs

- `cost_forecast.json` - Cost projections
- `reliability_trends.json` - Performance trends
- `/admin/reliability.json` - Dashboard data
- `/admin/compliance.json` - Compliance status
- `SECURITY_COMPLIANCE_REPORT.md` - Security audit report
- `/security/sbom.json` - Software Bill of Materials

## Dashboards

- **Reliability**: `/admin/reliability`
- **Compliance**: `/admin/compliance`

## Auto-PRs

Safe fixes (patch/minor updates) are automatically PR'd with label `security-auto`.

Major/breaking changes create issues requiring manual approval.

## Success Criteria

- ✅ ≥ 99.9% uptime
- ✅ No high-severity vulnerabilities > 48h
- ✅ Cost forecast accuracy ±10%
- ✅ GDPR/SOC 2/ISO 27001 compliance

---

For detailed documentation, see [ORCHESTRATOR_README.md](./ORCHESTRATOR_README.md)
