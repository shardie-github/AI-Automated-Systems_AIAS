import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, FileText, Settings, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Edge AI Models — Upload & Manage | AIAS",
  description: "Upload and manage your AI models for edge optimization. Support for ONNX, TensorFlow Lite, GGUF, and more.",
};

export default function EdgeAIModelsPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Model Management
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Upload, analyze, and manage your AI models for edge optimization.
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Model
          </CardTitle>
          <CardDescription>
            Supported formats: ONNX, TensorFlow Lite, GGUF, CoreML, TensorRT, OpenVINO, NCNN
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">Drag and drop your model file</p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse (Max file size: 2GB)
            </p>
            <Button asChild>
              <Link href="/edge-ai/models/upload">Select File</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Model List Placeholder */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Placeholder for model cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Example Model</span>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>ONNX • 45.2 MB</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="font-medium">Ready</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Uploaded:</span>{" "}
                  <span className="font-medium">2 days ago</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/edge-ai/models/example/optimize">Optimize</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/edge-ai/models/example/benchmark">Benchmark</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
              <Link href="/edge-ai/device-analyzer">
                <Settings className="h-6 w-6" />
                <span>Analyze Device</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
              <Link href="/edge-ai/benchmarks">
                <FileText className="h-6 w-6" />
                <span>View Benchmarks</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" asChild>
              <Link href="/edge-ai/sdk-export">
                <Download className="h-6 w-6" />
                <span>Download SDKs</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
