"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface IntegrationCardProps {
  name: string;
  icon: string;
  description: string;
  provider: string;
  status?: "connected" | "disconnected" | "error" | "connecting";
  onConnect?: () => void;
  connected?: boolean;
}

export function IntegrationCard({
  name,
  icon,
  description,
  provider: _provider,
  status = "disconnected",
  onConnect,
  connected = false,
}: IntegrationCardProps) {
  const isConnected = status === "connected" || connected;
  const isConnecting = status === "connecting";

  return (
    <Card className={`transition-all ${isConnected ? "border-green-500" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl" aria-hidden="true">{icon}</div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          {isConnected && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          )}
          {status === "error" && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Error
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isConnected && (
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full"
            variant={isConnecting ? "outline" : "default"}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect"
            )}
          </Button>
        )}
        {isConnected && (
          <div className="text-sm text-muted-foreground">
            Connected successfully. You can now use this integration in your workflows.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
