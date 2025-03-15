import { TimeContextProvider } from '@/contex/TimeContext';
import { ReactNode } from 'react';

export const RootProviders = ({ children }: { children: ReactNode }) => {
  return <TimeContextProvider>{children}</TimeContextProvider>;
};

export default RootProviders;
