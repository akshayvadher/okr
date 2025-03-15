import { createContext, ReactNode, useContext, useState } from 'react';

const timeContext = createContext<{
  clientAppStartTime: Date;
  lastSyncTime: Date | undefined;
  setLastSyncTime: (date: Date) => void;
}>({
  clientAppStartTime: new Date(),
  lastSyncTime: undefined,
  setLastSyncTime: () => {
    console.error('wrong method');
  },
});
export const useTimeContext = () => useContext(timeContext);

export const TimeContextProvider = ({ children }: { children: ReactNode }) => {
  const date = new Date();
  const [lastSyncTime, setLastSyncTime] = useState<Date | undefined>(undefined);
  return (
    <timeContext.Provider
      value={{ clientAppStartTime: date, lastSyncTime, setLastSyncTime }}
    >
      {children}
    </timeContext.Provider>
  );
};
