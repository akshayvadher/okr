import {
  useMarkFirstComplete,
  useMarkFirstFailed,
  useMarkFirstProcessing,
  usePeekPendingOrProcessingItem,
} from '@/sync/queue';
import { useEffect } from 'react';
import useProcessTransaction from '@/sync/useProcessTransaction';

export const useTransactionQueue = () => {
  const pendingOrProcessingItem = usePeekPendingOrProcessingItem();
  const markFirstProcessing = useMarkFirstProcessing();
  const markFirstComplete = useMarkFirstComplete();
  const markFirstFailed = useMarkFirstFailed();

  const { processTransaction } = useProcessTransaction();

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
    processTransaction(pendingOrProcessingItem.transaction)
      .then(() => markFirstComplete())
      .catch(() => markFirstFailed());
  }, [
    markFirstComplete,
    markFirstFailed,
    markFirstProcessing,
    pendingOrProcessingItem,
    processTransaction,
  ]);
};
