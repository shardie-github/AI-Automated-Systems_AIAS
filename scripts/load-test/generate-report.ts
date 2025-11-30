/**
 * Generate detailed HTML report from load test results
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

interface TestReport {
  config: any;
  summary: any;
  endpointStats: any;
  statusCodeDistribution: any;
  timeline: any[];
  recommendations: string[];
}

function generateHTMLReport(report: TestReport): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Load Test Report - ${new Date().toISOString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; margin-bottom: 20px; }
    h2 { color: #555; margin: 30px 0 15px 0; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metric-value {
      font-size: 2em;
      font-weight: bold;
      color: #3b82f6;
    }
    .metric-label {
      color: #666;
      font-size: 0.9em;
      margin-top: 5px;
    }
    .status-good { color: #10b981; }
    .status-warning { color: #f59e0b; }
    .status-error { color: #ef4444; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
    }
    .recommendations {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
    }
    .recommendations h3 {
      margin-bottom: 10px;
      color: #856404;
    }
    .recommendations ul {
      list-style: none;
      padding-left: 0;
    }
    .recommendations li {
      padding: 5px 0;
      color: #856404;
    }
    .recommendations li:before {
      content: "→ ";
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Load Test Report</h1>
    <p><strong>Test Date:</strong> ${new Date(report.config?.startTime || Date.now()).toLocaleString()}</p>
    <p><strong>Configuration:</strong> ${report.config?.targetUsers || 'N/A'} users, ${report.config?.duration || 'N/A'}s duration</p>

    <h2>Summary</h2>
    <div class="summary-grid">
      <div class="metric-card">
        <div class="metric-value">${report.summary.totalRequests.toLocaleString()}</div>
        <div class="metric-label">Total Requests</div>
      </div>
      <div class="metric-card">
        <div class="metric-value ${report.summary.errorRate < 0.01 ? 'status-good' : report.summary.errorRate < 0.05 ? 'status-warning' : 'status-error'}">
          ${(report.summary.errorRate * 100).toFixed(2)}%
        </div>
        <div class="metric-label">Error Rate</div>
      </div>
      <div class="metric-card">
        <div class="metric-value ${report.summary.averageResponseTime < 500 ? 'status-good' : report.summary.averageResponseTime < 1000 ? 'status-warning' : 'status-error'}">
          ${report.summary.averageResponseTime.toFixed(0)}ms
        </div>
        <div class="metric-label">Avg Response Time</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${report.summary.p95.toFixed(0)}ms</div>
        <div class="metric-label">P95 Latency</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${report.summary.p99.toFixed(0)}ms</div>
        <div class="metric-label">P99 Latency</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${report.summary.requestsPerSecond.toFixed(1)}</div>
        <div class="metric-label">Requests/Second</div>
      </div>
    </div>

    <h2>Endpoint Performance</h2>
    <table>
      <thead>
        <tr>
          <th>Endpoint</th>
          <th>Requests</th>
          <th>Success</th>
          <th>Failures</th>
          <th>Avg Response (ms)</th>
          <th>P50 (ms)</th>
          <th>P95 (ms)</th>
          <th>P99 (ms)</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(report.endpointStats || {}).map(([endpoint, stats]: [string, any]) => `
          <tr>
            <td><code>${endpoint}</code></td>
            <td>${stats.requests}</td>
            <td>${stats.success}</td>
            <td>${stats.failures}</td>
            <td>${stats.avgResponseTime.toFixed(0)}</td>
            <td>${stats.p50.toFixed(0)}</td>
            <td>${stats.p95.toFixed(0)}</td>
            <td>${stats.p99.toFixed(0)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>Status Code Distribution</h2>
    <table>
      <thead>
        <tr>
          <th>Status Code</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(report.statusCodeDistribution || {}).map(([code, count]: [string, any]) => {
          const total = report.summary.totalRequests;
          const percentage = ((count / total) * 100).toFixed(2);
          return `
            <tr>
              <td>${code}</td>
              <td>${count}</td>
              <td>${percentage}%</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    ${report.recommendations && report.recommendations.length > 0 ? `
      <div class="recommendations">
        <h3>💡 Recommendations</h3>
        <ul>
          ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
  </div>
</body>
</html>`;
}

async function main() {
  const reportsDir = join(process.cwd(), 'reports');
  const files = readdirSync(reportsDir)
    .filter(f => f.startsWith('load-test-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('No load test reports found');
    process.exit(1);
  }

  const latestReport = files[0];
  const reportPath = join(reportsDir, latestReport);
  const report: TestReport = JSON.parse(readFileSync(reportPath, 'utf-8'));

  const html = generateHTMLReport(report);
  const htmlPath = join(reportsDir, `load-test-report-${Date.now()}.html`);
  writeFileSync(htmlPath, html);

  console.log(`✅ HTML report generated: ${htmlPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { generateHTMLReport };
