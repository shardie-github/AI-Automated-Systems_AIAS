import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Download, Code, Package, FileCode } from "lucide-react";

export const metadata: Metadata = {
  title: "SDK Export — Download Bundles & SDKs | AIAS",
  description: "Download optimized model bundles, SDK scaffolds, Docker images, and deployment templates for your platform.",
};

const exportTypes = [
  {
    type: "optimized_model",
    title: "Optimized Models",
    description: "Download optimized model files in your target format",
    icon: Package,
    formats: ["ONNX", "TensorFlow Lite", "GGUF", "CoreML", "TensorRT"],
  },
  {
    type: "sdk_scaffold",
    title: "SDK Scaffolds",
    description: "Starter code for integrating optimized models",
    icon: Code,
    languages: ["TypeScript", "Python", "Java", "Swift", "C++"],
  },
  {
    type: "docker_image",
    title: "Docker Images",
    description: "Containerized deployment templates",
    icon: Package,
    platforms: ["Linux", "Jetson", "Edge Server"],
  },
  {
    type: "deployment_template",
    title: "Deployment Templates",
    description: "Ready-to-use deployment configurations",
    icon: FileCode,
    templates: ["Kubernetes", "Docker Compose", "Systemd"],
  },
];

export default function SDKExportPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          SDK Export & Downloads
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Download optimized bundles, SDKs, and deployment templates for your platform.
        </p>
      </div>

      {/* Export Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {exportTypes.map((exportType) => {
          const Icon = exportType.icon;
          return (
            <Card key={exportType.type} className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>{exportType.title}</CardTitle>
                </div>
                <CardDescription>{exportType.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {"formats" in exportType && (
                    <div>
                      <p className="text-sm font-medium mb-2">Supported Formats:</p>
                      <div className="flex flex-wrap gap-2">
                        {exportType.formats.map((format) => (
                          <span
                            key={format}
                            className="px-2 py-1 bg-muted rounded text-xs"
                          >
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {"languages" in exportType && (
                    <div>
                      <p className="text-sm font-medium mb-2">Languages:</p>
                      <div className="flex flex-wrap gap-2">
                        {exportType.languages.map((lang) => (
                          <span
                            key={lang}
                            className="px-2 py-1 bg-muted rounded text-xs"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {"platforms" in exportType && (
                    <div>
                      <p className="text-sm font-medium mb-2">Platforms:</p>
                      <div className="flex flex-wrap gap-2">
                        {exportType.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="px-2 py-1 bg-muted rounded text-xs"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {"templates" in exportType && (
                    <div>
                      <p className="text-sm font-medium mb-2">Templates:</p>
                      <div className="flex flex-wrap gap-2">
                        {exportType.templates.map((template) => (
                          <span
                            key={template}
                            className="px-2 py-1 bg-muted rounded text-xs"
                          >
                            {template}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button size="sm" variant="outline" className="w-full mt-4" asChild>
                    <Link href={`/edge-ai/sdk-export/${exportType.type}`}>
                      <Download className="mr-2 h-4 w-4" />
                      Browse Downloads
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Available Downloads */}
      <Card>
        <CardHeader>
          <CardTitle>Available Downloads</CardTitle>
          <CardDescription>
            Your generated artifacts and bundles ready for download.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Complete an optimization job to see available downloads</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/edge-ai/models">Upload a Model</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
