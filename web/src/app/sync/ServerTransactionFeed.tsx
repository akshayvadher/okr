'use client';

import React from 'react';
import './ServerTransactionFeed.css';
import { TransactionServer } from '@/sync/transaction';
import useServerTransactions from '@/sync/useServerTransactions';

const ServerTransactionFeed = () => {
  const { transactions, connectionStatus, error, loading } =
    useServerTransactions();

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
