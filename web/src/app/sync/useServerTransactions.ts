import { useEffect, useState } from 'react';
import { useTransactionQueue } from '@/sync/useTransactionQueue';
import useGetObjects from '@/sync/useGetObjects';
import { useTimeContext } from '@/contex/TimeContext';
import { TransactionServer } from '@/sync/transaction';

const useServerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const { processInMemory } = useTransactionQueue();
  const { serverLoadingDone: ready } = useGetObjects();
  const { clientAppStartTime } = useTimeContext();

  useEffect(() => {
    if (!ready) {
      return;
    }
    let eventSource: EventSource | null = null;

    const connectToSSE = () => {
      setConnectionStatus('Connecting...');

      // Build URL with any filters
      let url = 'http://localhost:8080/api/v1/transactions/events';
      const params = new URLSearchParams();
      params.append('from', clientAppStartTime.toISOString());
      if (params.toString()) url += `?${params.toString()}`;

      // Create EventSource connection
      eventSource = new EventSource(url);

      // Handle connection open
      eventSource.onopen = () => {
        setConnectionStatus('Connected');
        setError(null);
      };

      // Handle incoming messages
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
            }).then();
          }
        } catch (err) {
          console.error('Error parsing event data:', err);
        }
      };

      // Handle errors
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
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [ready, processInMemory, clientAppStartTime]); // Reconnect when filters change

  return { transactions, loading, error, connectionStatus };
};

export default useServerTransactions;
