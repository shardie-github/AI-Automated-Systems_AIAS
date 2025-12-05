"use client";

import { AlertCircle, RefreshCw, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface ErrorStateEnhancedProps {
  title?: string;
  message?: string;
  errorCode?: string;
  onRetry?: () => void;
  showHelp?: boolean;
  helpUrl?: string;
}

export function ErrorStateEnhanced({
  title = "Something went wrong",
  message = "We encountered an error while processing your request. This is usually temporary.",
  errorCode,
  onRetry,
  showHelp = true,
  helpUrl = "/help",
}: ErrorStateEnhancedProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-sm">What to try:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Refresh the page — Most issues resolve with a refresh</li>
              <li>Check your connection — Ensure you're connected to the internet</li>
              <li>Clear your cache — Sometimes cached data causes issues</li>
              <li>Try again in a few minutes — If it's a server issue, it may resolve shortly</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleRetry} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            {showHelp && (
              <Button variant="outline" asChild className="flex-1">
                <Link href={helpUrl}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Get Help
                </Link>
              </Button>
            )}
          </div>

          {errorCode && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              Error Code: <code className="bg-muted px-2 py-1 rounded">{errorCode}</code>
              <br />
              Include this when contacting support
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
