import { useTransactionQueue } from '@/sync/useTransactionQueue';
import useServerTransactions from '@/sync/useServerTransactions';
import { usePgLocal } from '@/sync/usePgLocal';

const useSyncEngine = () => {
  usePgLocal();
  useTransactionQueue();
  useServerTransactions();
  // usePgLocalTrackChanges();
};

export default useSyncEngine;
