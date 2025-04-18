import { useEffect, useState } from 'react';
import { TransactionServer } from '@/sync/transaction';
import usePgLocalToMemorySeed from '@/sync/usePgLocalToMemorySeed';
import { useLastSync } from '@/sync/last-sync-memory';
import { API_BASE_URL } from '@/lib/api';
import useProcessTransaction from '@/sync/useProcessTransaction';
import {
  useRegisterNetworkOffline,
  useRegisterNetworkOnline,
} from '@/sync/network-status-memory';

const useServerTransactions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [connectionStatus, setConnectionStatus] = useState('Pending');
  const { processTransactionSyncBack } = useProcessTransaction();
  const { pgLocalAndMemoryReady } = usePgLocalToMemorySeed();
  const lastSyncTime = useLastSync();
  const registerNetworkOffline = useRegisterNetworkOffline();
  const registerNetworkOnline = useRegisterNetworkOnline();

  useEffect(() => {
    if (
      !pgLocalAndMemoryReady ||
      !lastSyncTime ||
      connectionStatus === 'Connected'
    ) {
      return;
    }
    let eventSource: EventSource | null = null;

    const connectToSSE = () => {
      if (
        connectionStatus === 'Connected' ||
        connectionStatus === 'Connecting...'
      ) {
        return;
      }
      setConnectionStatus('Connecting...');

      let url = `${API_BASE_URL}/transactions/events`;
      const params = new URLSearchParams();
      console.log('starting listening transaction from ', lastSyncTime);
      params.append('from', lastSyncTime);
      if (params.toString()) url += `?${params.toString()}`;

      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        setConnectionStatus('Connected');
        setError(undefined);
        registerNetworkOnline();
      };

      eventSource.onmessage = (event) => {
        try {
          const eventData = JSON.parse(event.data);
          console.log('received event', eventData);
          registerNetworkOnline();
          if (eventData.type === 'initial') {
            setLoading(false);
            eventData.data.forEach((transaction: TransactionServer) => {
              processTransactionSyncBack(transaction).then();
            });
          } else if (eventData.type === 'new') {
            const serverTransaction = eventData.data as TransactionServer;
            processTransactionSyncBack(serverTransaction).then();
          }
        } catch (err) {
          console.error('Error parsing event data:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.log('EventSource error:', err);
        setConnectionStatus('Disconnected');
        setError('Connection lost. Attempting to reconnect...');
        registerNetworkOffline('Event source connection lost');

        if (eventSource === null) {
          throw new Error(
            'Weird how eventSource is null inside its own onerror method',
          );
        }
        eventSource.close();
      };
    };

    // Initial connection
    connectToSSE();

    return () => {
      // if (eventSource) {
      //   eventSource.close();
      // }
      // TODO find a way to close the connection
    };
  }, [
    pgLocalAndMemoryReady,
    processTransactionSyncBack,
    lastSyncTime,
    connectionStatus,
    registerNetworkOnline,
    registerNetworkOffline,
  ]);

  return { loading, error, connectionStatus };
};

export default useServerTransactions;
