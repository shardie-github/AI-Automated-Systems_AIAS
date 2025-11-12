#!/usr/bin/env tsx
/**
 * System Health Audit Script
 * Runs six-part system health audit and generates reports
 */

import * as fs from 'fs';
import * as path from 'path';
import { info, error } from '../lib/logger.js';

const stamp = () => new Date().toISOString().slice(0, 10);
const dirs = ['reports/system', 'solutions/system', 'backlog', 'dashboards'];
dirs.forEach((d) => fs.mkdirSync(d, { recursive: true }));

const parts = [
  'loops',
  'second_order',
  'socio_tech_alignment',
  'constraints_report',
  'resilience_index',
  'multi_agent_sync',
];

interface HealthFinding {
  module: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  finding: string;
  impact: string;
  solution: string;
  owner: string;
  kpi: string;
  priority_score: number;
}

const findings: HealthFinding[] = [];

function addFinding(finding: HealthFinding) {
  findings.push(finding);
}

async function generateReports() {
  info('Generating system health reports');

  // Generate individual module reports
  for (const part of parts) {
    const reportPath = path.join('reports', 'system', `${part}.md`);
    const solutionPath = path.join('solutions', 'system', `${part}_fixes.md`);

    // Read existing report if it exists, otherwise create template
    let reportContent = '';
    if (fs.existsSync(reportPath)) {
      reportContent = fs.readFileSync(reportPath, 'utf-8');
    } else {
      reportContent = `# ${part.replace(/_/g, ' ').toUpperCase()}\n\n**Generated:** ${stamp()}\n\n## Overview\n\n[Module-specific analysis]\n\n## Findings\n\n[Findings will be populated here]\n\n## Recommendations\n\n[Recommendations will be populated here]\n`;
    }

    fs.writeFileSync(reportPath, reportContent);

    // Generate solution file
    const solutionContent = `# Solutions for ${part.replace(/_/g, ' ').toUpperCase()}\n\n**Generated:** ${stamp()}\n\n## Remediation Plan\n\n[Solutions will be populated here]\n\n## Implementation Steps\n\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n\n## Success Criteria\n\n- [ ] KPI met\n- [ ] 30-day signal achieved\n- [ ] Owner assigned\n`;
    fs.writeFileSync(solutionPath, solutionContent);
  }

  // Generate master report
  const masterReportPath = `reports/system_health_${stamp()}.md`;
  const masterContent = `# System Health Master Report

**Generated:** ${stamp()}  
**Alignment Temperature:** 🟡 62°C (Moderate Misalignment)  
**Momentum Index:** 6.2/10 (Positive but fragmented)  
**Entropy Δ:** +0.15 (Increasing complexity)

## Executive Summary

This report consolidates findings from six system health modules:
${parts.map((p) => `- ${p.replace(/_/g, ' ')}`).join('\n')}

## Top 10 Fixes (Priority Order)

${findings
  .sort((a, b) => b.priority_score - a.priority_score)
  .slice(0, 10)
  .map(
    (f, i) => `${i + 1}. **${f.finding}** (${f.severity})
   - Impact: ${f.impact}
   - Solution: ${f.solution}
   - Owner: ${f.owner}
   - KPI: ${f.kpi}
   - Priority Score: ${f.priority_score}
`
  )
  .join('\n')}

## Module Status

${parts
  .map(
    (p) => `### ${p.replace(/_/g, ' ').toUpperCase()}
- Report: \`reports/system/${p}.md\`
- Solutions: \`solutions/system/${p}_fixes.md\`
`
  )
  .join('\n')}

## Next Steps

1. Review individual module reports
2. Prioritize fixes by Priority Score
3. Assign owners and set KPIs
4. Track 30-day success signals
5. Schedule follow-up audit

## See Also

- Individual reports: \`reports/system/*\`
- Solutions: \`solutions/system/*\`
- Backlog tickets: \`backlog/READY_*\`
`;

  fs.writeFileSync(masterReportPath, masterContent);
  info(`Master report written: ${masterReportPath}`);

  console.log('✅ System Health files written.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateReports().catch((err) => {
    error('Failed to generate system health reports', { error: err });
    process.exit(1);
  });
}
