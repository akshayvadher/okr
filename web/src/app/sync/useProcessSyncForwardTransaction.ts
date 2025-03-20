import { useCallback } from 'react';
import { TransactionEnriched } from '@/sync/transaction';
import { api } from '@/lib/api';
import usePgLocalOperations from '@/sync/usePgLocalOperations';

const useProcessSyncForwardTransaction = () => {
  const { markSyncForwardTransactionDone } = usePgLocalOperations();

  const processTransaction = useCallback(
    async (transaction: TransactionEnriched) => {
      await api.addTransaction(transaction);
      await markSyncForwardTransactionDone(transaction.id);
    },
    [markSyncForwardTransactionDone],
  );

  return { processTransaction };
};

export default useProcessSyncForwardTransaction;
