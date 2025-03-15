import { createContext, ReactNode, useContext } from 'react';

const timeContext = createContext<{
  clientAppStartTime: Date;
}>({ clientAppStartTime: new Date() });
export const useTimeContext = () => useContext(timeContext);

export const TimeContextProvider = ({ children }: { children: ReactNode }) => {
  const date = new Date();
  return (
    <timeContext.Provider value={{ clientAppStartTime: date }}>
      {children}
    </timeContext.Provider>
  );
};
