'use client';

import React from 'react';
import { useQueueMonitor } from '../queue';
import { usePgLocal } from '../usePgLocal';
import ServerTransactionFeed from './ServerTransactionFeed';
import { api } from '@/lib/api';

// Queue Monitor Component - Displays queue status
export const QueueMonitor = () => {
  const { queue, stats } = useQueueMonitor();

  return (
    <div className="monitor">
      <h2>Queue Status</h2>
      <div className="stats">
        <div>Total: {stats.total}</div>
        <div>Pending: {stats.pending}</div>
        <div>Processing: {stats.processing}</div>
        <div>Completed: {stats.completed}</div>
        <div>Failed: {stats.failed}</div>
      </div>

      <h3>Queue Items</h3>
      <ul className="queue-list">
        {queue.map((item) => (
          <li key={item.id} className={`status-${item.status}`}>
            <div>ID: {item.id.substring(0, 8)}...</div>
            <div>Status: {item.status}</div>
            <div>Content: {JSON.stringify(item.transaction)}</div>
            <div>Created: {item.createdAt.toLocaleTimeString()}</div>
            {item.processedAt && (
              <div>Processed: {item.processedAt.toLocaleTimeString()}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Main App Component
export const QueueApp = () => {
  const { db } = usePgLocal();

  const cleanup = async () => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    await db.exec(`truncate table objectives`);
    await db.exec(`truncate table key_results`);
    await db.exec(`truncate table transactions`);
    await db.exec(`truncate table sync`);

    await api.deleteAll();
    window.location.reload();
  };
  return (
    <div className="queue-app">
      <h1>React Queue System Demo</h1>
      <div className="app-container">
        <QueueMonitor />

        <ServerTransactionFeed />

        <button
          type={'button'}
          className="btn  bg-cyan-700 rounded"
          onClick={cleanup}
        >
          Cleanup
        </button>
      </div>
    </div>
  );
};
