import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Zap, 
  Rocket, 
  Smartphone, 
  Cpu, 
  FileCode, 
  Settings,
  Check
} from "lucide-react";

export const metadata: Metadata = {
  title: "Edge AI Services — Consulting & Implementation | AIAS",
  description: "Edge AI consulting services: optimization, deployment, NPU integration, and custom implementations for your business.",
};

const services = [
  {
    icon: Zap,
    title: "Edge Optimization Onboarding Call",
    description: "Get started with edge AI optimization. We'll review your models, discuss target devices, and create an optimization strategy.",
    deliverables: [
      "30-minute strategy call",
      "Model compatibility assessment",
      "Device recommendation",
      "Optimization roadmap",
    ],
    timeline: "1-2 days",
    price: "Free",
  },
  {
    icon: Rocket,
    title: "Enterprise Edge AI Deployment Blueprint",
    description: "Comprehensive deployment strategy for enterprise edge AI. Architecture, security, monitoring, and scaling.",
    deliverables: [
      "Deployment architecture design",
      "Security & compliance review",
      "Monitoring & observability setup",
      "Scaling strategy",
      "Documentation & runbooks",
    ],
    timeline: "2-4 weeks",
    price: "Custom",
  },
  {
    icon: Smartphone,
    title: "Offline Agent & NPU Integration Package",
    description: "Deploy offline AI agents with NPU acceleration. Perfect for mobile apps, IoT devices, and edge servers.",
    deliverables: [
      "NPU capability analysis",
      "Model optimization for NPU",
      "Integration code & SDK",
      "Testing & validation",
      "Deployment guide",
    ],
    timeline: "3-6 weeks",
    price: "Custom",
  },
  {
    icon: Cpu,
    title: "Model Shrinking & Compression Service",
    description: "Expert model compression to reduce size by 70-90% while maintaining accuracy. Custom quantization strategies.",
    deliverables: [
      "Model analysis & profiling",
      "Custom quantization strategy",
      "Compressed model delivery",
      "Accuracy validation report",
      "Performance benchmarks",
    ],
    timeline: "1-3 weeks",
    price: "Custom",
  },
  {
    icon: Settings,
    title: "Jetson / Android / AI PC Deployment Service",
    description: "End-to-end deployment service for specific platforms. From optimization to production deployment.",
    deliverables: [
      "Platform-specific optimization",
      "Deployment package",
      "Integration support",
      "Performance tuning",
      "Production deployment",
    ],
    timeline: "2-5 weeks",
    price: "Custom",
  },
  {
    icon: FileCode,
    title: "Local AI Tutor / Offline Assistant Setup",
    description: "Deploy local AI assistants for education, customer support, or internal tools. Works completely offline.",
    deliverables: [
      "Assistant architecture design",
      "Model selection & optimization",
      "Integration & deployment",
      "User interface (if needed)",
      "Training & documentation",
    ],
    timeline: "4-8 weeks",
    price: "Custom",
  },
];

export default function EdgeAIServicesPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Edge AI Consulting Services
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Expert consulting and implementation services for edge AI deployment.
          From strategy to production.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/demo">Schedule Consultation</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/edge-ai">Explore Platform</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.title} className="h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Deliverables:</h4>
                    <ul className="space-y-1">
                      {service.deliverables.map((item, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-4 border-t flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Timeline:</strong> {service.timeline}
                      </p>
                      <p className="text-sm font-semibold text-primary mt-1">
                        {service.price}
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link href="/demo">Learn More</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Deploy Edge AI in Your Business?
        </h2>
        <p className="text-muted-foreground mb-6">
          Schedule a free consultation to discuss your edge AI needs.
          We'll help you choose the right service and create a custom plan.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/demo">Schedule Free Consultation</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/case-studies">View Case Studies</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
