import { useEffect, useState } from 'react';
import { TransactionServer } from '@/sync/transaction';
import useMemoryLocalSeed from '@/sync/useMemoryLocalSeed';
import usePgLocalAndMemorySetLastSync from '@/sync/usePgLocalAndMemorySetLastSync';
import { useLastSync } from '@/sync/last-sync-memory';
import { API_BASE_URL } from '@/lib/api';
import useProcessTransaction from '@/sync/useProcessTransaction';

const useServerTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [connectionStatus, setConnectionStatus] = useState('Pending');
  const { processInMemory } = useProcessTransaction();
  const { pgLocalAndMemoryReady } = useMemoryLocalSeed();
  const { setLastSync } = usePgLocalAndMemorySetLastSync();
  const lastSyncTime = useLastSync();

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
      console.log({ lastSyncTime });
      params.append('from', lastSyncTime.toISOString());
      if (params.toString()) url += `?${params.toString()}`;

      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        setConnectionStatus('Connected');
        setError(undefined);
      };

      eventSource.onmessage = (event) => {
        try {
          const eventData = JSON.parse(event.data);
          console.log('received event', eventData);

          if (eventData.type === 'initial') {
            setTransactions(eventData.data);
            setLoading(false);
            eventData.data.forEach((transaction: TransactionServer) => {
              processInMemory({
                ...transaction,
                payload: JSON.parse(transaction.payload),
              }).then();
            });
            if (eventData.data.length > 0) {
              const lastTx = eventData.data[
                eventData.data.length - 1
              ] as TransactionServer;
              setLastSync(lastTx.created_at).then();
            }
          } else if (eventData.type === 'new') {
            setTransactions((prevTransactions) => {
              const updatedTransactions = [eventData.data, ...prevTransactions];
              if (updatedTransactions.length > 50) {
                updatedTransactions.pop();
              }
              return updatedTransactions;
            });
            const serverTransaction = eventData.data as TransactionServer;
            processInMemory({
              ...serverTransaction,
              payload: JSON.parse(serverTransaction.payload),
            }).then(() => {
              return setLastSync(serverTransaction.created_at);
            });
          }
        } catch (err) {
          console.error('Error parsing event data:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('EventSource error:', err);
        setConnectionStatus('Disconnected');
        setError('Connection lost. Attempting to reconnect...');

        if (eventSource === null) {
          throw new Error(
            'Weird how eventSource is null inside its own onerror method',
          );
        }
        eventSource.close();

        // Try to reconnect after a delay
        setTimeout(connectToSSE, 3000);
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
    processInMemory,
    lastSyncTime,
    setLastSync,
    connectionStatus,
  ]);

  return { transactions, loading, error, connectionStatus };
};

export default useServerTransactions;
