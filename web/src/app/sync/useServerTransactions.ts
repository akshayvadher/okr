import { useEffect, useState } from 'react';
import { useTransactionQueue } from '@/sync/useTransactionQueue';
import { TransactionServer } from '@/sync/transaction';
import useMemoryLocalSeed from '@/sync/useMemoryLocalSeed';
import usePgLocalAndMemorySetLastSync from '@/sync/usePgLocalAndMemorySetLastSync';
import { useLastSync } from '@/sync/last-sync-memory';
import { API_BASE_URL } from '@/lib/api';

const useServerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const { processInMemory } = useTransactionQueue();
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
      setConnectionStatus('Connecting...');

      // Build URL with any filters
      let url = `${API_BASE_URL}/transactions/events`;
      const params = new URLSearchParams();
      console.log({ lastSyncTime });
      params.append('from', lastSyncTime.toISOString());
      if (params.toString()) url += `?${params.toString()}`;

      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        setConnectionStatus('Connected');
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const eventData = JSON.parse(event.data);
          console.log('received event', eventData);

          if (eventData.type === 'initial') {
            setTransactions(eventData.data);
            setLoading(false);
            eventData.data.forEach((transaction: TransactionServer) => {
              processInMemory(transaction.id, {
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
            // Add new transaction to the top of the list and remove the last one to keep the list size consistent
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setTransactions((prevTransactions) => {
              const updatedTransactions = [eventData.data, ...prevTransactions];
              if (updatedTransactions.length > 50) {
                updatedTransactions.pop();
              }
              return updatedTransactions;
            });
            const serverTransaction = eventData.data as TransactionServer;
            processInMemory(serverTransaction.id, {
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        setError('Connection lost. Attempting to reconnect...');

        // Close the current connection
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        eventSource.close();

        // Try to reconnect after a delay
        setTimeout(connectToSSE, 3000);
      };
    };

    // Initial connection
    connectToSSE();

    // Cleanup on component unmount
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
