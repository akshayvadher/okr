'use client';

import useOnline from '@/hooks/useOnline';

const NetworkStatus = () => {
  const { isOnline } = useOnline();

  return <div>{!isOnline && `🟠 offline`}</div>;
};

export default NetworkStatus;
