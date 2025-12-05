import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Gauge, TrendingUp, Clock, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Edge AI Benchmarks — Performance Metrics | AIAS",
  description: "View benchmark results for your optimized models. Compare latency, throughput, and hardware utilization across devices.",
};

export default function EdgeAIBenchmarksPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Benchmark Results
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Performance metrics for your optimized models across different devices and configurations.
        </p>
        <Button asChild>
          <Link href="/edge-ai/benchmarks/new">Run New Benchmark</Link>
        </Button>
      </div>

      {/* Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Example Benchmark Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>ResNet-50 Optimized</span>
              <Gauge className="h-5 w-5 text-primary" />
            </CardTitle>
            <CardDescription>Jetson Nano • INT8 Quantization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Latency
                </span>
                <span className="font-semibold">12.3 ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Throughput
                </span>
                <span className="font-semibold">81 ops/sec</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Memory
                </span>
                <span className="font-semibold">245 MB</span>
              </div>
              <div className="pt-3 border-t">
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href="/edge-ai/benchmarks/example">View Details</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Section */}
      <Card>
        <CardHeader>
          <CardTitle>Compare Optimizations</CardTitle>
          <CardDescription>
            Compare performance across different quantization levels and optimization strategies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Run multiple benchmarks to see comparison charts</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/edge-ai/benchmarks/new">Start Benchmarking</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
