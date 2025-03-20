import { useTransactionQueue } from '@/sync/useTransactionQueue';
import useServerTransactions from '@/sync/useServerTransactions';
import { useTransactionSyncForwardQueue } from '@/sync/useTransactionSyncForwardQueue';

const useSyncEngine = () => {
  useTransactionQueue();
  useTransactionSyncForwardQueue();
  useServerTransactions();
  // usePgLocalTrackChanges();
};

export default useSyncEngine;
