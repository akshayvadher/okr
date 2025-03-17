'use client';

import { ReactNode } from 'react';
import useSyncEngine from '@/sync/useSyncEngine';

export function AppProviders({ children }: { children: ReactNode }) {
  useSyncEngine();
  return <>{children}</>;
}
