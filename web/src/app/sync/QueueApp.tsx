'use client'

import React from 'react';
import {useQueueMonitor} from './queue';


// Queue Monitor Component - Displays queue status
export const QueueMonitor = () => {
  const {queue, stats} = useQueueMonitor();

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
          {queue.map(item => (
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
  return (
      <div className="queue-app">
        <h1>React Queue System Demo</h1>
        <div className="app-container">
          <QueueMonitor/>
        </div>
      </div>
  );
};
