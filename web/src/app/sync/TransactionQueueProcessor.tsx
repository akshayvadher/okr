'use client';

import { useTransactionQueue } from '@/sync/useTransactionQueue';
import useGetObjects from '@/sync/useGetObjects';
import useServerTransactions from "@/sync/useServerTransactions";

export const TransactionQueueProcessor = () => {
  useTransactionQueue();
  useGetObjects();
  useServerTransactions();

  return null;
};
