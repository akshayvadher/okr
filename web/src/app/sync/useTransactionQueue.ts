import { useQueueConsumer } from '@/sync/queue';
import { useCallback, useEffect } from 'react';
import { TransactionEnriched } from '@/sync/transaction';
import useProcessTransaction from '@/sync/useProcessTransaction';

let isProcessing = false;

export const useTransactionQueue = () => {
  const { pendingItems, markAsProcessing, complete, fail } = useQueueConsumer();

  const { processTransaction } = useProcessTransaction();

  const processItem = useCallback(
    async (id: string, transaction: TransactionEnriched) => {
      markAsProcessing(id);
      try {
        await processTransaction(transaction);
        complete(id);
      } catch (error) {
        console.error('process failed', error);
        fail(id, '' + error);
      }
    },
    [complete, fail, markAsProcessing, processTransaction],
  );

  const processNext = useCallback(async () => {
    if (pendingItems.length > 0 && !isProcessing) {
      isProcessing = true;
      const item = pendingItems[0];
      await processItem(item.id, item.transaction);
      isProcessing = false;
    }
  }, [pendingItems, processItem]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingItems.length > 0 && !isProcessing) {
        processNext().then();
      }
    }, 10); // TODO fix the delay

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pendingItems, processNext]);
};
