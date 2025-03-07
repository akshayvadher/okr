"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {useState} from "react";
import {TransactionQueueProcessor} from "@/sync/TransactionQueueProcessor";

export function AppProviders({children}: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  return (
      <>
        <TransactionQueueProcessor/>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </>
  );
}
