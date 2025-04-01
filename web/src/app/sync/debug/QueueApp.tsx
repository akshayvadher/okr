'use client';

import React, { useEffect } from 'react';
import { usePgLocal } from '../usePgLocal';
import ServerTransactionFeed from './ServerTransactionFeed';
import { api } from '@/lib/api';
import { tableNames } from '@/sync/migration-queries';
import { useQueueStats } from '@/sync/queue';
import {
  keyResultTable,
  objectiveTable,
  commentTable,
  syncTable,
  transactionTable,
} from '@/sync/drizzle/schema';

export const QueueMonitor = () => {
  const { queue, stats } = useQueueStats();

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

export const QueueApp = () => {
  const { db, drizzleDb } = usePgLocal();

  const cleanup = async () => {
    if (!drizzleDb) {
      throw new Error('Database not initialized');
    }
    await drizzleDb.delete(objectiveTable);
    await drizzleDb.delete(keyResultTable);
    await drizzleDb.delete(commentTable);
    await drizzleDb.delete(transactionTable);
    await drizzleDb.delete(syncTable);

    await api.deleteAll();
    window.location.reload();
  };

  useEffect(() => {
    if (!db) {
      return;
    }
    // Retrieve the Repl element
    const repl = document?.getElementById('repl');

    if (repl) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      repl.pg = db;
    }
  }, [db]);

  return (
    <div className="queue-app">
      <h1>React Queue System Demo</h1>
      <div className="app-container">
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/*// @ts-expect-error*/}
        <pglite-repl id="repl"></pglite-repl>
        Current tables <pre>{JSON.stringify(tableNames, null, 2)}</pre>
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
