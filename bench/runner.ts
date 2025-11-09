/**
 * Microbenchmark Runner
 * Provides a simple benchmarking harness for performance-critical functions
 */

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
  memoryUsed?: number;
}

export interface BenchmarkOptions {
  iterations?: number;
  warmup?: number;
  timeout?: number;
}

const DEFAULT_OPTIONS: Required<BenchmarkOptions> = {
  iterations: 1000,
  warmup: 10,
  timeout: 5000,
};

/**
 * Run a benchmark on a function
 */
export async function benchmark<T>(
  name: string,
  fn: () => T | Promise<T>,
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const times: number[] = [];

  // Warmup
  for (let i = 0; i < opts.warmup; i++) {
    await fn();
  }

  // Measure memory before (if available)
  const memoryBefore = typeof process !== "undefined" && process.memoryUsage
    ? process.memoryUsage().heapUsed
    : undefined;

  // Benchmark
  const startTime = performance.now();
  let iterations = 0;

  while (iterations < opts.iterations) {
    const iterStart = performance.now();
    await fn();
    const iterEnd = performance.now();
    times.push(iterEnd - iterStart);

    iterations++;

    // Check timeout
    if (performance.now() - startTime > opts.timeout) {
      break;
    }
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;

  // Measure memory after (if available)
  const memoryAfter = typeof process !== "undefined" && process.memoryUsage
    ? process.memoryUsage().heapUsed
    : undefined;

  // Calculate statistics
  const sortedTimes = [...times].sort((a, b) => a - b);
  const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = sortedTimes[0];
  const maxTime = sortedTimes[sortedTimes.length - 1];
  const opsPerSecond = (iterations / totalTime) * 1000;

  return {
    name,
    iterations,
    totalTime,
    averageTime,
    minTime,
    maxTime,
    opsPerSecond,
    memoryUsed: memoryAfter && memoryBefore ? memoryAfter - memoryBefore : undefined,
  };
}

/**
 * Compare multiple benchmarks
 */
export async function compare(
  benchmarks: Array<{ name: string; fn: () => unknown | Promise<unknown> }>,
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  for (const bench of benchmarks) {
    const result = await benchmark(bench.name, bench.fn, options);
    results.push(result);
  }

  return results;
}

/**
 * Format benchmark result for display
 */
export function formatResult(result: BenchmarkResult): string {
  const lines = [
    `\n${result.name}:`,
    `  Iterations: ${result.iterations}`,
    `  Total Time: ${result.totalTime.toFixed(2)}ms`,
    `  Average Time: ${result.averageTime.toFixed(4)}ms`,
    `  Min Time: ${result.minTime.toFixed(4)}ms`,
    `  Max Time: ${result.maxTime.toFixed(4)}ms`,
    `  Ops/Second: ${result.opsPerSecond.toFixed(2)}`,
  ];

  if (result.memoryUsed !== undefined) {
    lines.push(`  Memory Used: ${(result.memoryUsed / 1024 / 1024).toFixed(2)}MB`);
  }

  return lines.join("\n");
}

/**
 * Run benchmarks and print results
 */
export async function runBenchmarks(
  benchmarks: Array<{ name: string; fn: () => unknown | Promise<unknown> }>,
  options: BenchmarkOptions = {}
): Promise<void> {
  console.log("Running benchmarks...\n");

  const results = await compare(benchmarks, options);

  for (const result of results) {
    console.log(formatResult(result));
  }

  // Find fastest
  const fastest = results.reduce((a, b) =>
    a.averageTime < b.averageTime ? a : b
  );

  console.log(`\nFastest: ${fastest.name} (${fastest.averageTime.toFixed(4)}ms avg)`);
}
