import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Cpu, Smartphone, Server, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Device Analyzer — Hardware Profiling | AIAS",
  description: "Analyze your device capabilities and create profiles for edge AI optimization. Support for AI PCs, Jetsons, mobile devices, and more.",
};

const deviceTemplates = [
  {
    name: "NVIDIA Jetson Nano",
    type: "jetson",
    icon: Cpu,
    description: "4-core ARM, Maxwell GPU, 4GB RAM",
  },
  {
    name: "NVIDIA Jetson Xavier NX",
    type: "jetson",
    icon: Cpu,
    description: "6-core ARM, Volta GPU, 8GB RAM",
  },
  {
    name: "Android Phone",
    type: "android",
    icon: Smartphone,
    description: "Generic Android device with NPU",
  },
  {
    name: "AI PC (Intel Core Ultra)",
    type: "ai_pc",
    icon: Server,
    description: "Intel Core Ultra with NPU, 16GB RAM",
  },
  {
    name: "Raspberry Pi 4",
    type: "raspberry_pi",
    icon: Cpu,
    description: "4-core ARM, 4GB RAM",
  },
];

export default function DeviceAnalyzerPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Device Analyzer
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Create device profiles for your target hardware. Use templates or configure custom devices.
        </p>
      </div>

      {/* Device Templates */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Pre-configured Device Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deviceTemplates.map((device) => {
            const Icon = device.icon;
            return (
              <Card key={device.name} className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{device.name}</CardTitle>
                      <CardDescription className="text-sm">{device.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link href={`/edge-ai/device-analyzer/${device.type}`}>Use Template</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Device */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Create Custom Device Profile
          </CardTitle>
          <CardDescription>
            Configure a custom device profile with specific hardware specifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Specify CPU cores, GPU model, NPU capabilities, memory, and runtime environment.
            </p>
            <Button asChild>
              <Link href="/edge-ai/device-analyzer/custom">Create Custom Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Your Device Profiles */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Device Profiles</h2>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No custom device profiles yet. Create one to get started.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
