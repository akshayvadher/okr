import { useQueueConsumer } from '@/sync/queue';
import { useCallback, useEffect } from 'react';
import { TransactionEnriched } from '@/sync/transaction';
import { api } from '@/lib/api';
import usePgLocalTransactionProcess from '@/sync/usePgLocalTransactionProcess';
import useMemoryLocalTransactionProcess from '@/sync/useMemoryLocalTransactionProcess';
import usePgLocalOperations from '@/sync/usePgLocalOperations';
import { useClientMetadata } from '@/sync/client-metadata-memory';

let isProcessing = false;

export const useTransactionQueue = () => {
  const { pendingItems, markAsProcessing, complete, fail } = useQueueConsumer();

  const { transactionLocalDbProcessor } = usePgLocalTransactionProcess();
  const { transactionLocalInMemoryProcessor } =
    useMemoryLocalTransactionProcess();
  const { doesTransactionExist } = usePgLocalOperations();
  const { clientId } = useClientMetadata();

  const transactionApi = useCallback(
    async (transaction: TransactionEnriched) => {
      if (!transaction.clientId) {
        transaction.clientId = clientId;
      }
      api.addTransaction(transaction).then();
    },
    [clientId],
  );

  const processInMemory = useCallback(
    async (id: string, transaction: TransactionEnriched) => {
      try {
        if (transaction.clientId === clientId) {
          return;
        }

        const { exists } = await doesTransactionExist(transaction.id);
        if (exists) return;

        console.log('transaction does not exist so processing', transaction);
        await transactionLocalInMemoryProcessor(transaction);
        await transactionLocalDbProcessor(transaction);
      } catch (error) {
        console.error('process in memory failed', error);
      }
    },
    [
      clientId,
      doesTransactionExist,
      transactionLocalDbProcessor,
      transactionLocalInMemoryProcessor,
    ],
  );

  const processItem = useCallback(
    async (id: string, transaction: TransactionEnriched) => {
      markAsProcessing(id);

      try {
        await transactionLocalInMemoryProcessor(transaction);
        await transactionLocalDbProcessor(transaction);
        await transactionApi(transaction);

        complete(id);
      } catch (error) {
        console.error('process failed', error);
        fail(id, '' + error);
      }
    },
    [
      complete,
      fail,
      markAsProcessing,
      transactionApi,
      transactionLocalDbProcessor,
      transactionLocalInMemoryProcessor,
    ],
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

  return { processInMemory };
};
