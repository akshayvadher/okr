import { useTransactionQueue } from '@/sync/useTransactionQueue';
import useServerTransactions from '@/sync/useServerTransactions';
import usePgLocalTrackChanges from '@/sync/usePgLocalTrackChanges';

const useSyncEngine = () => {
  useTransactionQueue();
  useServerTransactions();
  usePgLocalTrackChanges();
};

export default useSyncEngine;
