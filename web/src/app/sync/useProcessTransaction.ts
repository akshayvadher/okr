import usePgLocalTransactionProcess from '@/sync/usePgLocalTransactionProcess';
import useMemoryLocalTransactionProcess from '@/sync/useMemoryLocalTransactionProcess';
import usePgLocalOperations from '@/sync/usePgLocalOperations';
import { useClientMetadata } from '@/sync/client-metadata-memory';
import { useCallback } from 'react';
import { TransactionEnriched } from '@/sync/transaction';
import { useEnqueue } from '@/sync/transaction-sync-forward-queue';

const useProcessTransaction = () => {
  const { transactionLocalDbProcessor } = usePgLocalTransactionProcess();
  const { transactionLocalInMemoryProcessor } =
    useMemoryLocalTransactionProcess();
  const { doesTransactionExist, registerTransactionLocalDb } =
    usePgLocalOperations();
  const { clientId, sessionId } = useClientMetadata();
  const enqueueTransactionSyncForward = useEnqueue();

  const processTransactionSyncBack = useCallback(
    async (transaction: TransactionEnriched) => {
      try {
        if (transaction.sessionId === sessionId) {
          // no need to process own transaction
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
      sessionId,
      doesTransactionExist,
      transactionLocalDbProcessor,
      transactionLocalInMemoryProcessor,
    ],
  );

  const processTransaction = useCallback(
    async (transaction: TransactionEnriched) => {
      if (!transaction.clientId || !transaction.sessionId) {
        transaction.clientId = clientId;
        transaction.sessionId = sessionId;
      }
      await transactionLocalInMemoryProcessor(transaction);
      await transactionLocalDbProcessor(transaction);
      await registerTransactionLocalDb(transaction);
      enqueueTransactionSyncForward(transaction);
    },
    [
      clientId,
      enqueueTransactionSyncForward,
      registerTransactionLocalDb,
      sessionId,
      transactionLocalDbProcessor,
      transactionLocalInMemoryProcessor,
    ],
  );

  return { processTransactionSyncBack, processTransaction };
};

export default useProcessTransaction;
