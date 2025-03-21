'use client';

import { useNetworkStatus } from '@/sync/network-status-memory';
import { useQueueStats } from '@/sync/transaction-sync-forward-queue';

const NetworkStatus = () => {
  const { status } = useNetworkStatus();
  const offline = status === 'not-connected';
  const connecting = status === 'checking';
  const { stats } = useQueueStats();

  return (
    <div>
      {connecting && `🏡`}
      {offline && `🟠 offline`}
      <span className="text-rose-600 ml-1">
        {offline && stats.pending > 0 && `🔄️ ${stats.pending}`}
      </span>
    </div>
  );
};

export default NetworkStatus;
