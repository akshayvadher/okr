import {
  useMarkFirstComplete,
  useMarkFirstFailed,
  useMarkFirstProcessing,
  usePeekPendingOrProcessingItem,
} from '@/sync/queue';
import { useCallback, useEffect } from 'react';
import { TransactionEnriched } from '@/sync/transaction';
import useProcessTransaction from '@/sync/useProcessTransaction';

export const useTransactionQueue = () => {
  const pendingOrProcessingItem = usePeekPendingOrProcessingItem();
  const markFirstProcessing = useMarkFirstProcessing();
  const markFirstComplete = useMarkFirstComplete();
  const markFirstFailed = useMarkFirstFailed();

  const { processTransaction } = useProcessTransaction();
  const processItem = useCallback(
    async (id: string, transaction: TransactionEnriched) => {
      try {
        await processTransaction(transaction);
        return id;
      } catch (error) {
        console.error('transaction queue process failed', error);
        return id;
      }
    },
    [processTransaction],
  );

  useEffect(() => {
    if (!pendingOrProcessingItem) {
      // nothing pending
      return;
    }
    if (pendingOrProcessingItem.status === 'processing') {
      // already processing
      return;
    }
    markFirstProcessing();
    processItem(pendingOrProcessingItem.id, pendingOrProcessingItem.transaction)
      .then(() => markFirstComplete())
      .catch(() => markFirstFailed());
  }, [
    markFirstComplete,
    markFirstFailed,
    markFirstProcessing,
    pendingOrProcessingItem,
    processItem,
  ]);
};
