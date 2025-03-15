'use client';

import { useTransactionQueue } from '@/sync/useTransactionQueue';
import useGetObjects from '@/sync/useGetObjects';

export const TransactionQueueProcessor = () => {
  useTransactionQueue();
  useGetObjects();

  return null;
};
