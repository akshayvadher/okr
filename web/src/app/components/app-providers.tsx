'use client';

import { TransactionQueueProcessor } from '@/sync/TransactionQueueProcessor';
import { ReactNode } from 'react';
import { TimeContextProvider } from '@/contex/TimeContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TimeContextProvider>
      <TransactionQueueProcessor />
      {children}
    </TimeContextProvider>
  );
}
