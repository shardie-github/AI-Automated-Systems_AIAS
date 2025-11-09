#!/usr/bin/env node

/**
 * Benchmark Trend Analysis
 * Analyzes benchmark results over time to detect regressions
 */

const fs = require("fs");
const path = require("path");

const BENCHMARK_DIR = path.join(__dirname, "..", "bench", "results");
const TREND_FILE = path.join(BENCHMARK_DIR, "trends.json");

// Ensure benchmark results directory exists
if (!fs.existsSync(BENCHMARK_DIR)) {
  fs.mkdirSync(BENCHMARK_DIR, { recursive: true });
}

/**
 * Load benchmark results from file
 */
function loadResults(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Save benchmark results to file
 */
function saveResults(filePath, results) {
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
}

/**
 * Load trend data
 */
function loadTrends() {
  if (!fs.existsSync(TREND_FILE)) {
    return [];
  }
  return loadResults(TREND_FILE);
}

/**
 * Save trend data
 */
function saveTrends(trends) {
  saveResults(TREND_FILE, trends);
}

/**
 * Analyze trends and detect regressions
 */
function analyzeTrends(currentResults, threshold = 0.1) {
  const trends = loadTrends();
  const regressions = [];

  for (const result of currentResults) {
    const previous = trends.find((t) => t.name === result.name);
    if (!previous) {
      continue;
    }

    const change = (result.averageTime - previous.averageTime) / previous.averageTime;
    if (change > threshold) {
      regressions.push({
        name: result.name,
        previous: previous.averageTime,
        current: result.averageTime,
        change: change * 100,
        threshold: threshold * 100,
      });
    }
  }

  return regressions;
}

/**
 * Add current results to trends
 */
function addToTrends(currentResults) {
  const trends = loadTrends();
  const timestamp = new Date().toISOString();

  for (const result of currentResults) {
    const existing = trends.find((t) => t.name === result.name);
    if (existing) {
      existing.history = existing.history || [];
      existing.history.push({
        timestamp,
        averageTime: result.averageTime,
        opsPerSecond: result.opsPerSecond,
      });
      existing.latest = {
        timestamp,
        ...result,
      };
    } else {
      trends.push({
        name: result.name,
        latest: {
          timestamp,
          ...result,
        },
        history: [
          {
            timestamp,
            averageTime: result.averageTime,
            opsPerSecond: result.opsPerSecond,
          },
        ],
      });
    }
  }

  saveTrends(trends);
  return trends;
}

/**
 * Generate trend report
 */
function generateReport(currentResults) {
  const trends = addToTrends(currentResults);
  const regressions = analyzeTrends(currentResults);

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalBenchmarks: currentResults.length,
      regressions: regressions.length,
    },
    regressions,
    trends: trends.map((t) => ({
      name: t.name,
      latest: t.latest.averageTime,
      trend: t.history.length > 1 ? "improving" : "stable",
    })),
  };

  return report;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "analyze") {
    const resultsFile = args[1] || path.join(BENCHMARK_DIR, "latest.json");
    const currentResults = loadResults(resultsFile);

    if (!currentResults) {
      console.error("No benchmark results found. Run benchmarks first.");
      process.exit(1);
    }

    const report = generateReport(currentResults);
    console.log(JSON.stringify(report, null, 2));

    if (report.regressions.length > 0) {
      console.error("\n⚠️  Performance regressions detected!");
      process.exit(1);
    }
  } else if (command === "trends") {
    const trends = loadTrends();
    console.log(JSON.stringify(trends, null, 2));
  } else {
    console.log("Usage:");
    console.log("  node bench-trend.js analyze [results-file]");
    console.log("  node bench-trend.js trends");
  }
}

module.exports = {
  loadTrends,
  saveTrends,
  analyzeTrends,
  addToTrends,
  generateReport,
};
