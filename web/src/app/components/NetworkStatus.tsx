'use client';

import { useNetworkStatus } from '@/sync/network-status-memory';

const NetworkStatus = () => {
  const networkStatus = useNetworkStatus();

  return <div>{!networkStatus.connected && `🟠 offline`}</div>;
};

export default NetworkStatus;
