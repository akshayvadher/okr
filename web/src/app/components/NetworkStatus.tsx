'use client';

import { useNetworkStatus } from '@/sync/network-status-memory';
import { useQueueStats } from '@/sync/transaction-sync-forward-queue';

const NetworkStatus = () => {
  const networkStatus = useNetworkStatus();
  const { stats } = useQueueStats();

  return (
    <div>
      {!networkStatus.connected && `🟠 offline`}
      <span className="text-rose-600 ml-1">
        {!networkStatus.connected &&
          stats.pending > 0 &&
          `🔄️ ${stats.pending}`}
      </span>
    </div>
  );
};

export default NetworkStatus;
