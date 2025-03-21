import usePgLocalTransactionProcess from '@/sync/usePgLocalTransactionProcess';
import useMemoryLocalTransactionProcess from '@/sync/useMemoryLocalTransactionProcess';
import usePgLocalOperations from '@/sync/usePgLocalOperations';
import { useClientMetadata } from '@/sync/client-metadata-memory';
import { useCallback } from 'react';
import {
  serverToDomain,
  TransactionEnriched,
  TransactionServer,
} from '@/sync/transaction';
import { useEnqueue } from '@/sync/transaction-sync-forward-queue';
import useSetLastSync from '@/sync/useSetLastSync';

const useProcessTransaction = () => {
  const { transactionLocalDbProcessor } = usePgLocalTransactionProcess();
  const { transactionLocalInMemoryProcessor } =
    useMemoryLocalTransactionProcess();
  const { doesTransactionExist, registerTransactionLocalDb } =
    usePgLocalOperations();
  const { clientId, sessionId } = useClientMetadata();
  const enqueueTransactionSyncForward = useEnqueue();
  const { setLastSync } = useSetLastSync();

  const processTransactionSyncBack = useCallback(
    async (transaction: TransactionServer) => {
      try {
        if (transaction.sessionId === sessionId) {
          // no need to process own transaction
          await setLastSync(transaction.serverCreatedAt);
          return;
        }

        const { exists } = await doesTransactionExist(transaction.id);
        if (exists) return;

        console.log('transaction does not exist so processing', transaction);
        const domainTransaction = serverToDomain(transaction);
        await transactionLocalInMemoryProcessor(domainTransaction);
        await transactionLocalDbProcessor(domainTransaction);
        await setLastSync(transaction.serverCreatedAt);
      } catch (error) {
        console.error('process in memory failed', error);
      }
    },
    [
      sessionId,
      doesTransactionExist,
      transactionLocalInMemoryProcessor,
      transactionLocalDbProcessor,
      setLastSync,
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
