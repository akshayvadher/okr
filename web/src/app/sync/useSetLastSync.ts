import { useCallback } from 'react';
import { usePgLocal } from './usePgLocal';
import { useSetLastSyncMemory } from '@/sync/last-sync-memory';
import { syncTable } from '@/sync/drizzle/schema';
import { eq } from 'drizzle-orm/sql';

const SYNC_SINGLE_ID = 'lastSync';

const useSetLastSync = () => {
  const { drizzleDb } = usePgLocal();
  const setLastSyncInMemory = useSetLastSyncMemory();

  const setLastSync = useCallback(
    async (date: Date | string) => {
      if (!date) throw new Error('Date was not provided');
      if (!drizzleDb) throw new Error('db not found');
      let exists = false;
      const lastSync = await drizzleDb.select().from(syncTable);
      if (lastSync.length > 0) {
        exists = true;
      }
      const dateInDateFormat = typeof date === 'string' ? new Date(date) : date;
      if (exists) {
        await drizzleDb
          .update(syncTable)
          .set({ lastSync: dateInDateFormat })
          .where(eq(syncTable.id, SYNC_SINGLE_ID));
      } else {
        await drizzleDb.insert(syncTable).values({
          id: SYNC_SINGLE_ID,
          lastSync: dateInDateFormat,
        });
      }
      setLastSyncInMemory(dateInDateFormat);
    },
    [drizzleDb, setLastSyncInMemory],
  );

  return { setLastSync };
};
export default useSetLastSync;
