'use client';

import { useTransactionQueue } from '@/sync/useTransactionQueue';

export const TransactionQueueProcessor = () => {
  useTransactionQueue();

  return null;
};
