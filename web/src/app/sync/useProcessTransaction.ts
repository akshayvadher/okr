import usePgLocalTransactionProcess from '@/sync/usePgLocalTransactionProcess';
import useMemoryLocalTransactionProcess from '@/sync/useMemoryLocalTransactionProcess';
import usePgLocalOperations from '@/sync/usePgLocalOperations';
import { useClientMetadata } from '@/sync/client-metadata-memory';
import { useCallback } from 'react';
import { TransactionEnriched } from '@/sync/transaction';
import { api } from '@/lib/api';

const useProcessTransaction = () => {
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
      await api.addTransaction(transaction);
    },
    [clientId],
  );

  const processTransactionSyncBack = useCallback(
    async (transaction: TransactionEnriched) => {
      try {
        if (transaction.clientId === clientId) {
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
      clientId,
      doesTransactionExist,
      transactionLocalDbProcessor,
      transactionLocalInMemoryProcessor,
    ],
  );

  const processTransaction = useCallback(
    async (transaction: TransactionEnriched) => {
      await transactionLocalInMemoryProcessor(transaction);
      await transactionLocalDbProcessor(transaction);
      await transactionApi(transaction);
    },
    [
      transactionApi,
      transactionLocalDbProcessor,
      transactionLocalInMemoryProcessor,
    ],
  );

  return { transactionApi, processTransactionSyncBack, processTransaction };
};

export default useProcessTransaction;
