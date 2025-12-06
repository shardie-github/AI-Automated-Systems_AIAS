"use client";

/**
 * React Query Provider Setup
 * 
 * Configures TanStack Query (React Query) for the application with:
 * - Default query/mutation options
 * - DevTools (development only)
 * - Error handling
 * - Cache configuration
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

// DevTools is optional - only import if available
// Use dynamic import to avoid build-time resolution issues
let ReactQueryDevtools: React.ComponentType<{ initialIsOpen?: boolean }> | null = null;
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ReactQueryDevtools = require("@tanstack/react-query-devtools").ReactQueryDevtools;
  } catch {
    // DevTools not installed - that's okay
  }
}

/**
 * Default query options
 * 
 * These apply to all queries unless overridden:
 * - staleTime: 30 seconds - Data is considered fresh for 30s
 * - gcTime: 5 minutes - Unused cache entries are garbage collected after 5min
 * - retry: 1 - Retry failed requests once
 * - refetchOnWindowFocus: false - Don't refetch when window regains focus (can be enabled per-query)
 */
const defaultQueryOptions = {
  queries: {
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
  },
  mutations: {
    retry: 1,
  },
};

/**
 * Create QueryClient instance
 * 
 * Note: We create it inside the provider component to ensure
 * a new instance is created for each render in development
 * (React Strict Mode). In production, this only runs once.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern to keep the same query client
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

interface ReactQueryProviderProps {
  children: ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Use useState to ensure we only create one QueryClient instance per component instance
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only in development and if installed */}
      {process.env.NODE_ENV === "development" && ReactQueryDevtools && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
