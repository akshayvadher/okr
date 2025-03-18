'use client';

import { ReactNode } from 'react';
import useSyncEngine from '@/sync/useSyncEngine';

const ObjectiveLayout = ({ children }: { children: ReactNode }) => {
  useSyncEngine();
  return children;
};

export default ObjectiveLayout;
