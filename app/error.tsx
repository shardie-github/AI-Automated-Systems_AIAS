"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { telemetry } from "@/lib/monitoring/enhanced-telemetry";
import { logger } from "@/lib/utils/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Track error with telemetry
    telemetry.trackError(error, {
      digest: error.digest,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });
    // Use logger instead of console.error for environment-aware logging
    logger.error("Application error", error, {
      digest: error.digest,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">
          We're sorry, but something unexpected happened. Please try again.
        </p>
        {error.digest && (
          <p className="text-sm text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
