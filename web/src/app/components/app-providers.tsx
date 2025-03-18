'use client';

import { ReactNode } from 'react';
import { Provider } from 'jotai';
import useSyncEngine from '@/sync/useSyncEngine';

export function AppProviders({ children }: { children: ReactNode }) {
  useSyncEngine();
  return <Provider>{children}</Provider>;
}
