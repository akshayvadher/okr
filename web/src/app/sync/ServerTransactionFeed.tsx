'use client';

import React, { useEffect, useState } from 'react';
import './ServerTransactionFeed.css';
import { TransactionServer } from '@/sync/transaction';
import { useTransactionQueue } from '@/sync/useTransactionQueue';
import { useTimeContext } from '@/contex/TimeContext';
import useGetObjects from '@/sync/useGetObjects';

const ServerTransactionFeed = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ entity: '', action: '' });
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
      if (filter.entity) params.append('entity', filter.entity);
      if (filter.action) params.append('action', filter.action);
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
  }, [ready, filter, processInMemory, clientAppStartTime]); // Reconnect when filters change

  // Parse JSON payload for display
  const formatPayload = (payloadStr: unknown) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const payload = JSON.parse(payloadStr);
      return (
        <pre className="transaction-payload">
          {JSON.stringify(payload, null, 2)}
        </pre>
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return <span className="transaction-payload">{payloadStr}</span>;
    }
  };

  // Format date
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  // Handle filter changes
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="transaction-feed-container">
      <div className="transaction-feed-header">
        <h1>Transaction Feed</h1>
        <div
          className="connection-status"
          data-status={connectionStatus.toLowerCase()}
        >
          {connectionStatus}
        </div>
      </div>

      <div className="transaction-filters">
        <div className="filter-group">
          <label htmlFor="entity-filter">Entity:</label>
          <input
            id="entity-filter"
            type="text"
            name="entity"
            value={filter.entity}
            onChange={handleFilterChange}
            placeholder="Filter by entity"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="action-filter">Action:</label>
          <input
            id="action-filter"
            type="text"
            name="action"
            value={filter.action}
            onChange={handleFilterChange}
            placeholder="Filter by action"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading transactions...</div>
      ) : (
        <div className="transactions-list">
          {transactions.length === 0 ? (
            <div className="no-transactions">No transactions found</div>
          ) : (
            transactions.map((transaction: TransactionServer) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-header">
                  <span className="transaction-entity">
                    {transaction.entity}
                  </span>
                  <span className="transaction-action">
                    {transaction.action}
                  </span>
                  <span className="transaction-date">
                    {formatDate(transaction.server_created_at)}
                  </span>
                </div>
                <div className="transaction-content">
                  <div className="transaction-details">
                    <div>
                      <strong>ID:</strong> {transaction.id}
                    </div>
                    <div>
                      <strong>Created:</strong>{' '}
                      {formatDate(transaction.created_at)}
                    </div>
                  </div>
                  <div className="transaction-payload-container">
                    <strong>Payload:</strong>
                    {formatPayload(transaction.payload)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ServerTransactionFeed;
