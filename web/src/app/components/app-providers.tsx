'use client';

import { ReactNode } from 'react';
import { Provider } from 'jotai';

export function AppProviders({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}
