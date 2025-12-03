"use client";

/**
 * DataLoader Component
 * 
 * Standardized wrapper for data queries that handles:
 * - Loading states
 * - Error states
 * - Empty states
 * 
 * @example
 * ```tsx
 * const { data, isLoading, isError, error } = useUser();
 * 
 * return (
 *   <DataLoader
 *     isLoading={isLoading}
 *     isError={isError}
 *     error={error}
 *     isEmpty={!data}
 *     emptyMessage="No user found"
 *   >
 *     <UserProfile user={data} />
 *   </DataLoader>
 * );
 * ```
 */

import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { type ReactNode } from "react";

interface DataLoaderProps {
  isLoading: boolean;
  isError?: boolean;
  error?: Error | unknown;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  loadingMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
  className?: string;
}

export function DataLoader({
  isLoading,
  isError = false,
  error,
  isEmpty = false,
  emptyMessage,
  emptyIcon,
  emptyAction,
  loadingMessage = "Loading...",
  errorTitle,
  errorMessage,
  onRetry,
  children,
  className,
}: DataLoaderProps) {
  // Loading state
  if (isLoading) {
    return <LoadingState message={loadingMessage} className={className} />;
  }

  // Error state
  if (isError) {
    const errorMsg =
      errorMessage ||
      (error instanceof Error ? error.message : "An error occurred");
    
    return (
      <ErrorState
        title={errorTitle}
        message={errorMsg}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  // Empty state
  if (isEmpty && emptyMessage) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyMessage}
        action={emptyAction}
        className={className}
      />
    );
  }

  // Success state - render children
  return <>{children}</>;
}
