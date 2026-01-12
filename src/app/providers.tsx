"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { Toaster } from "@/components/ui/toast";
import * as Tooltip from "@radix-ui/react-tooltip";

// T17.1: Lazy load React Query DevTools only in development
// This reduces production bundle size by ~15KB
const ReactQueryDevtools = dynamic(
  () => import("@tanstack/react-query-devtools").then((mod) => ({ default: mod.ReactQueryDevtools })),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // T17.5: Optimize cache settings for better performance
            staleTime: 60 * 1000, // 1 minute - data stays fresh for 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes - cache cleanup (was cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
            // T17.2: Prevent unnecessary re-renders
            notifyOnChangeProps: ['data', 'error', 'isLoading'],
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <Tooltip.Provider>
          <SupabaseProvider>
            {children}
            <Toaster />
            {/* T17.1: DevTools only in development, lazy-loaded */}
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
          </SupabaseProvider>
        </Tooltip.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
