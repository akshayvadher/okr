'use client';

import { ReactNode } from 'react';
import { Provider } from 'jotai';
import AppLoading from './AppLoading';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <AppLoading>
        {children}
      </AppLoading>
    </Provider>
  );
}
