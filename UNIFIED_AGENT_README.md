# Unified Hardonia Background + Composer Agent

> **Enterprise-grade autonomous DevOps, FinOps, SecOps, and KnowledgeOps layer**

## 🎯 Overview

The Unified Hardonia Agent operates as a continuous intelligence layer across all Hardonia-linked repositories. It provides:

- **Self-Awareness**: Detects repository type and applies contextual intelligence
- **Self-Maintenance**: Auto-updates documentation, dependencies, and tests
- **Self-Optimization**: Continuously benchmarks performance, cost, reliability
- **Self-Protection**: Enforces security hygiene, secret safety, compliance
- **Self-Documentation**: Maintains living READMEs, CHANGELOGs, dashboards

## 🚀 Quick Start

### 1. Configuration

The agent configuration is stored in `.cursor/config/master-agent.json`. It auto-detects:

- Repository type (Next.js webapp, Expo mobile, Supabase backend, library)
- Technology stack
- Package manager
- Deployment platform

### 2. Run Manually

```bash
# Run full agent cycle
npm run agent:unified

# Or use the alias
npm run agent:run
```

### 3. Automated Runs

The agent runs automatically via GitHub Actions:

- **Every 12 hours** (scheduled)
- **On push** to main/develop branches
- **On workflow_dispatch** (manual trigger)

## 📊 Generated Artifacts

The agent generates the following artifacts:

| File | Purpose | Location |
|------|---------|----------|
| `reliability.json` | Live uptime & latency snapshot | `/app/admin/reliability.json` |
| `reliability.md` | Human-readable reliability report | `/app/admin/reliability.md` |
| `compliance.json` | Security & privacy baseline | `/app/admin/compliance.json` |
| `sbom.json` | Software Bill of Materials | `/security/sbom.json` |
| `intent-log.md` | Commit reasoning trail | `/docs/intent-log.md` |
| `current-sprint.md` | Auto sprint summary | `/roadmap/current-sprint.md` |
| `next-steps.md` | Self-reflection & recommendations | `/auto/next-steps.md` |

## 🧩 Core Behaviors

### 1️⃣ Repository Context Detection

The agent automatically detects:

- **WebApp Mode**: Next.js optimization, Vercel audit
- **Mobile Mode**: Expo EAS management (if applicable)
- **Backend Mode**: Supabase edge validation, schema sync
- **Library Mode**: Type definitions, semantic versioning

### 2️⃣ Reliability & Performance Agent

- Monitors latency, build time, payload size, error frequency
- Stores snapshots in Supabase `metrics_log`
- Generates `/app/admin/reliability.json` + `.md`
- Predicts regressions and auto-PRs performance fixes

### 3️⃣ Cost & Efficiency Agent

- Pulls usage metrics from Vercel, Supabase, Expo
- Projects monthly spend → flags overruns > 10%
- Suggests caching, query pooling, function consolidation

### 4️⃣ Security & Compliance Agent

- Builds SBOM (`/security/sbom.json`) and runs license scan
- Detects outdated/vulnerable packages (`npm audit`, `pnpm outdated`)
- Verifies: HTTPS, RLS, CORS, MFA policies
- Generates `/app/admin/compliance.json`

### 5️⃣ Documentation & Knowledge Agent

- Updates README, CHANGELOG, `/docs/architecture.md` after PR merge
- Auto-diagrams module dependencies (future: `.cursor/diagrams/architecture.svg`)
- Appends intent logs for each commit in `/docs/intent-log.md`

### 6️⃣ Planning & Roadmap Agent

- Extracts TODOs / FIXMEs → clusters into Epics
- Generates `/roadmap/current-sprint.md`
- Suggests sprint planning based on priorities

### 7️⃣ Observability & Telemetry Layer

- Maintains `/api/metrics` endpoint for runtime health
- Logs telemetry via browser beacon & Supabase storage
- Triggers alerts on three consecutive regressions

### 8️⃣ Auto-Improvement & Reflection Loop

Every 24 hours:

- Summarizes changes since last commit
- Proposes optimizations in `/auto/next-steps.md`
- Self-evaluates success vs previous run
- Commits with message: "autonomous improvement cycle"

## 🔧 Configuration

### Environment Variables

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_REF=your-project-ref

# Optional
GITHUB_TOKEN=your-github-token
GITHUB_OWNER=your-org
GITHUB_REPO=your-repo
VERCEL_TOKEN=your-vercel-token
VERCEL_PROJECT_ID=your-vercel-project-id
```

### Master Agent Config

Edit `.cursor/config/master-agent.json` to customize:

```json
{
  "agentMode": "hardonia-global",
  "autoRun": true,
  "repoType": "nextjs-webapp",
  "modules": {
    "reliability": { "enabled": true, "interval": "hourly" },
    "cost": { "enabled": true, "budget": 75 },
    "security": { "enabled": true, "interval": "daily" }
  }
}
```

## 📈 Dashboard Access

View generated artifacts via:

- **Reliability Dashboard**: `/admin/reliability`
- **Compliance Dashboard**: `/admin/compliance`
- **Metrics Dashboard**: `/admin/metrics`

## 🔒 Safety & Guardrails

- ✅ Never exposes secret values
- ✅ Skips major upgrades unless CI passes
- ✅ Always prefers PR → human merge over direct push
- ✅ Retains last 3 audit snapshots
- ✅ Default mode: Confirm → Log → Auto-PR

## 🧠 Learning & Continuity

The agent:

- Compares all repos nightly
- Detects reusable code patterns
- Suggests repo unification when duplication ≥ 30%
- Maintains `.cursor/agent-discoveries.md` (knowledge ledger)

## 📚 Integration with Existing Systems

The Unified Agent integrates with:

- **Orchestrator** (`ai/orchestrator.ts`): Uses for reliability, cost, security checks
- **Admin Dashboards**: Reads generated JSON artifacts
- **GitHub Actions**: Runs on schedule and on push
- **Supabase**: Stores metrics and reports

## 🚀 Future Enhancements

- [ ] OpenTelemetry traces → Grafana
- [ ] AI anomaly detector (Prophet/z-score) for predictive scaling
- [ ] Slack/Discord webhooks for alerts
- [ ] Weekly digest → Google Sheets → Hardonia Ops workspace
- [ ] Architecture diagram generation (`.cursor/diagrams/architecture.svg`)

## 📝 Example Output

After running, you'll see:

```
🤖 Unified Hardonia Agent Starting...
📦 Repository Type: nextjs-webapp
🔧 Stack: {"frontend":"Next.js 14","backend":"Supabase","deployment":"Vercel"}
📅 Last Commit: abc12345 (2024-01-15T10:30:00Z)

🔄 [1/6] Running orchestrator...
📊 [2/6] Generating reliability artifacts...
🔒 [3/6] Generating compliance artifacts...
📋 [4/6] Generating SBOM...
📝 [5/6] Updating intent log...
🗺️  [6/6] Generating roadmap and auto-improvement...

✅ Unified Agent cycle completed successfully!
```

## 🤝 Contributing

The agent is designed to be self-improving. To contribute:

1. Review `/auto/next-steps.md` for recommendations
2. Check `/docs/intent-log.md` for recent changes
3. Submit PRs for agent improvements
4. The agent will auto-update its own documentation

---

**Built with ❤️ by the Hardonia Team**

For questions or issues, see `/docs/intent-log.md` or check the GitHub Actions logs.
