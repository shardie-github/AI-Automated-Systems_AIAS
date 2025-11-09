/**
 * Example Benchmark
 * Demonstrates how to use the benchmark runner
 */

import { benchmark, compare, formatResult } from "./runner";

// Example function to benchmark
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Example async function
async function asyncOperation(): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(42), 10);
  });
}

// Run benchmarks
async function main() {
  console.log("Example Benchmarks\n");

  // Single benchmark
  const result1 = await benchmark("fibonacci(10)", () => fibonacci(10), {
    iterations: 1000,
  });
  console.log(formatResult(result1));

  // Compare multiple implementations
  const results = await compare(
    [
      {
        name: "fibonacci(10)",
        fn: () => fibonacci(10),
      },
      {
        name: "fibonacci(20)",
        fn: () => fibonacci(20),
      },
      {
        name: "asyncOperation",
        fn: asyncOperation,
      },
    ],
    {
      iterations: 100,
    }
  );

  console.log("\nComparison Results:");
  for (const result of results) {
    console.log(formatResult(result));
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { fibonacci, asyncOperation };
