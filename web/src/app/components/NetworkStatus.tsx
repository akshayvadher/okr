'use client';

import { cn } from '@/lib/utils';
import { useNetworkStatus } from '@/sync/network-status-memory';
import { useQueueStats } from '@/sync/transaction-sync-forward-queue';
import { useMemo } from 'react';

const NetworkStatus = () => {
  const { status } = useNetworkStatus();
  const { stats } = useQueueStats();
  const pendingTransactions = stats.pending;

  const statusConfig = useMemo(() => {
    switch (status) {
      case 'connected':
        return {
          color: 'text-green-500',
          text: '',
          icon: (
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              {/* Simple glow effect */}
              <g className="animate-pulse-slow">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  strokeWidth="2"
                  className="opacity-20"
                />
              </g>
              {/* Cheerful eyes */}
              <g>
                <circle cx="8" cy="10" r="1.8" fill="currentColor" />
                <circle cx="16" cy="10" r="1.8" fill="currentColor" />
                {/* Simple sparkles */}
                <path
                  d="M7 9l1 1M17 9l-1 1"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                  className="opacity-70"
                />
              </g>
              {/* Happy smile */}
              <g className="animate-wave">
                <path
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="M8 16c2 2 6 2 8 0"
                />
              </g>
              {/* Simple radiating lines */}
              <g className="opacity-30">
                <path
                  strokeLinecap="round"
                  strokeWidth="1.5"
                  d="M12 4V7m0 10v3m-7-7H2m20 0h-3"
                />
              </g>
            </svg>
          ),
        };
      case 'not-connected':
        return {
          color: 'text-red-500',
          text: 'Offline',
          icon: (
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              {/* Sad face with dramatic effect */}
              <g className="animate-ripple">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  strokeWidth="2"
                  className="opacity-20"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="6"
                  strokeWidth="2"
                  className="opacity-40"
                />
              </g>
              {/* Big, sad eyes */}
              <g className="animate-float">
                <circle cx="8" cy="10" r="2" fill="currentColor" />
                <circle cx="16" cy="10" r="2" fill="currentColor" />
                {/* Dramatic tear drops */}
                <path
                  d="M8 14c0 0 2 2.5 4 2.5s4-2.5 4-2.5"
                  strokeLinecap="round"
                  strokeWidth="2"
                  className="opacity-70"
                />
              </g>
              {/* Very sad mouth */}
              <g className="animate-wave">
                <path
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="M8 16c2-3 6-3 8 0"
                />
              </g>
              {/* Broken connection effect */}
              <g className="animate-dash-reverse">
                <path
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  d="M4 4l16 16M4 20l16-16"
                  className="opacity-60"
                />
              </g>
            </svg>
          ),
        };
      case 'checking':
        return {
          color: 'bg-yellow-500',
          text: 'Checking',
          icon: (
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <g className="animate-ripple opacity-50">
                <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
              </g>
              <g className="animate-spin-slow origin-center">
                <path
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="M12 8v1m0 6v1m-4-4H7m10 0h1m-3.5-3.5l.5-.5m-5 0l-.5-.5m5.5 7.5l.5.5m-5 0l-.5.5"
                />
              </g>
              <g className="animate-float">
                <circle cx="12" cy="12" r="2" className="animate-pulse" />
              </g>
            </svg>
          ),
        };
      default:
        return {
          color: 'bg-gray-500',
          text: 'Unknown',
          icon: (
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <g className="animate-ripple opacity-30">
                <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
              </g>
              <g className="animate-wave">
                <path
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="M10 9a2 2 0 1 1 4 0c0 1.5-2 2-2 3.5"
                />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </g>
            </svg>
          ),
        };
    }
  }, [status]);

  return (
    <div className="flex items-center gap-3">
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'relative flex items-center justify-center',
            statusConfig.color,
          )}
        >
          {statusConfig.icon}
        </div>
        <span className={cn('text-sm font-medium', statusConfig.color)}>
          {statusConfig.text}
        </span>
      </div>

      {/* Pending Transactions */}
      {status === 'not-connected' && pendingTransactions > 0 && (
        <div className="flex items-center gap-2 px-2 py-1 bg-red-50 rounded-full">
          <svg
            className="w-4 h-4 text-red-700"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main transaction shape */}
            <rect
              x="6"
              y="8"
              width="12"
              height="8"
              rx="1"
              fill="currentColor"
              className="opacity-90"
            />
            {/* Question mark */}
            <path
              d="M12 10c0 0 1 1 1 1.5s-1 1.5-1 1.5"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <circle cx="12" cy="14" r="0.5" fill="white" />
            {/* Shrug arms */}
            <path
              d="M8 12c0 0 1 1 2 1s2-1 2-1M14 12c0 0 1 1 2 1s2-1 2-1"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-xs font-medium text-red-700">
            {pendingTransactions}
          </span>
        </div>
      )}
    </div>
  );
};

export default NetworkStatus;
