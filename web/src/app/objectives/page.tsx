'use client';

import { ObjectiveList } from '@/components/objectives/objective-list';
import { QueueApp } from '@/sync/QueueApp';
import { useIsDebugModeOn, useToggleDebugMode } from '@/contex/debug';
import { useCallback, useEffect } from 'react';

export default function ObjectivesPage() {
  const isDebugModeOn = useIsDebugModeOn();
  const toggleDebugMode = useToggleDebugMode();

  const handler = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === 'KeyD' && event.ctrlKey && event.altKey) {
        event.preventDefault();
        toggleDebugMode();
        console.log('Debug mode toggled:', !isDebugModeOn);
      }
    },
    [isDebugModeOn, toggleDebugMode],
  );

  useEffect(() => {
    window.addEventListener('keydown', handler, false);
    return () => window.removeEventListener('keydown', handler, false);
  }, [handler]);
  return (
    <div>
      {/*<OKRDashboard/>*/}
      <ObjectiveList />
      {isDebugModeOn && <QueueApp />}
    </div>
  );
}
