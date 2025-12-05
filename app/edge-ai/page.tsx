import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Cpu, 
  Zap, 
  Gauge, 
  Download, 
  Smartphone, 
  Server, 
  Code, 
  Rocket,
  Shield,
  TrendingUp
} from "lucide-react";

export const metadata: Metadata = {
  title: "Edge AI Accelerator Studio — Optimize & Deploy AI Models at the Edge | AIAS",
  description: "Optimize AI models for edge devices, NPUs, and local inference. Quantization, benchmarking, and deployment tools for Jetson, Android, AI PCs, and more. Reduce latency, improve privacy, and cut cloud costs.",
  keywords: [
    "edge AI",
    "neural processing",
    "local inference",
    "model optimization",
    "quantization",
    "NPU",
    "Jetson",
    "AI PC",
    "mobile AI",
    "edge deployment",
    "model compression",
    "ONNX",
    "TensorFlow Lite",
    "TensorRT",
    "offline AI",
    "privacy-preserving AI",
  ],
};

const features = [
  {
    icon: Cpu,
    title: "Model Optimization",
    description: "Quantize and compress models with int8, int4, fp8, and GGUF formats. Reduce model size by up to 75% while maintaining accuracy.",
  },
  {
    icon: Smartphone,
    title: "Device Profiling",
    description: "Detect and configure target device capabilities. Support for AI PCs, Jetsons, Android, iOS, Raspberry Pi, and custom devices.",
  },
  {
    icon: Gauge,
    title: "Performance Benchmarking",
    description: "Measure latency, throughput, and hardware utilization. Compare optimization strategies and get recommendations.",
  },
  {
    icon: Download,
    title: "Export & Deploy",
    description: "Download optimized bundles, SDK scaffolds, Docker images, and deployment templates. Ready-to-use code for your platform.",
  },
  {
    icon: Code,
    title: "Cross-Platform SDKs",
    description: "Get starter code in TypeScript, Python, Java, Swift, and more. Consistent APIs across platforms.",
  },
  {
    icon: Shield,
    title: "Privacy-First",
    description: "Run inference locally without sending data to the cloud. Perfect for sensitive applications and offline scenarios.",
  },
];

const useCases = [
  {
    title: "Offline Enterprise Assistants",
    description: "Deploy AI assistants that work without internet connectivity. Perfect for field workers, remote locations, and privacy-sensitive environments.",
    icon: Server,
  },
  {
    title: "Edge AI in Education",
    description: "Local tutoring and learning assistants that work on student devices. No cloud dependency, reduced costs, improved privacy.",
    icon: Rocket,
  },
  {
    title: "Robotics & IoT",
    description: "Real-time inference at the edge for robotics and IoT applications. Low latency, high reliability, minimal power consumption.",
    icon: Cpu,
  },
  {
    title: "Retail Analytics",
    description: "On-premise vision analytics for retail stores. Customer behavior analysis, inventory tracking, and forecasting without cloud costs.",
    icon: TrendingUp,
  },
];

export default function EdgeAIPage() {
  return (
    <div className="container py-12 md:py-16">
      {/* Hero Section */}
      <div className="text-center mb-16 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Edge AI Accelerator Studio
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          Optimize and deploy AI models for edge devices, NPUs, and local inference.
          Reduce latency, improve privacy, and cut cloud costs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/edge-ai/accelerator-studio">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/edge-ai/services">View Services</Link>
          </Button>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Faster Inference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Run inference locally with sub-10ms latency. No network round-trips, no cloud delays.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Privacy-First
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Keep sensitive data on-device. No data leaves your infrastructure. PIPEDA compliant.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Cost Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Eliminate cloud inference costs. Reduce bandwidth usage. Lower infrastructure requirements.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Use Cases */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <Card key={useCase.title} className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                    <CardTitle>{useCase.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {useCase.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/50 rounded-lg p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to Optimize Your AI Models for Edge Deployment?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Upload your model, configure your target device, and get optimized bundles ready for deployment.
          Start with a free optimization or schedule a consultation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/edge-ai/models">Upload Model</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/demo">Schedule Consultation</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
