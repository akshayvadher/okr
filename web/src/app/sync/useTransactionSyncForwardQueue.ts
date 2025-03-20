import {
  useMarkFirstComplete,
  useMarkFirstFailed,
  useMarkFirstProcessing,
  useMarkProcessingBackToPending,
  usePeekPendingOrProcessingItem,
} from '@/sync/transaction-sync-forward-queue';
import { useEffect } from 'react';
import useProcessSyncForwardTransaction from '@/sync/useProcessSyncForwardTransaction';
import {
  useNetworkStatus,
  useRegisterNetworkOffline,
} from '@/sync/network-status-memory';

export const useTransactionSyncForwardQueue = () => {
  const pendingOrProcessingItem = usePeekPendingOrProcessingItem();
  const markFirstProcessing = useMarkFirstProcessing();
  const markFirstComplete = useMarkFirstComplete();
  const markFirstFailed = useMarkFirstFailed();
  const markProcessingBackToPending = useMarkProcessingBackToPending();

  const { processTransaction } = useProcessSyncForwardTransaction();

  const { connected } = useNetworkStatus();
  const registerNetworkOffline = useRegisterNetworkOffline();

  useEffect(() => {
    if (!connected) {
      // no internet, so don't try API call
      return;
    }
    if (!pendingOrProcessingItem) {
      // nothing pending
      return;
    }
    if (pendingOrProcessingItem.status === 'processing') {
      // already processing
      return;
    }
    markFirstProcessing();
    processTransaction(pendingOrProcessingItem.transaction)
      .then(() => markFirstComplete())
      .catch((e: Error) => {
        if (e.message.includes('Failed to fetch')) {
          // this means the server is still not available, so keep it
          registerNetworkOffline(e.message);
          markProcessingBackToPending();
          return;
        }
        markFirstFailed();
      });
  }, [
    connected,
    markFirstComplete,
    markFirstFailed,
    markFirstProcessing,
    markProcessingBackToPending,
    pendingOrProcessingItem,
    processTransaction,
    registerNetworkOffline,
  ]);
};
