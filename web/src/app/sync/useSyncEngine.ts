import { useTransactionQueue } from '@/sync/useTransactionQueue';
import useServerTransactions from '@/sync/useServerTransactions';

const useSyncEngine = () => {
  useTransactionQueue();
  useServerTransactions();
  // usePgLocalTrackChanges();
};

export default useSyncEngine;
