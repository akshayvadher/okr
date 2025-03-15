'use client';

import { TransactionQueueProcessor } from '@/sync/TransactionQueueProcessor';
import { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <TransactionQueueProcessor />
      {children}
    </>
  );
}
