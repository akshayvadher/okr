import { useCallback } from 'react';
import { usePgLocal } from './usePgLocal';
import { useSetLastSyncMemory } from '@/sync/last-sync-memory';
import { syncTable } from '@/sync/drizzle/schema';
import { eq } from 'drizzle-orm/sql';
import { v } from './date/format';

const SYNC_SINGLE_ID = 'lastSync';

const useSetLastSync = () => {
  const { drizzleDb } = usePgLocal();
  const setLastSyncInMemory = useSetLastSyncMemory();

  // TODO find a way to call this only 500 ms
  const setLastSync = useCallback(
    async (date: string) => {
      if (!date) throw new Error('Date was not provided for the last sync');
      if (!v(date)) throw new Error('Invalidate date for last sync');
      if (!drizzleDb) throw new Error('db not found');
      let exists = false;
      const lastSync = await drizzleDb.select().from(syncTable);
      if (lastSync.length > 0) {
        exists = true;
      }
      if (exists) {
        await drizzleDb
          .update(syncTable)
          .set({ lastSync: date })
          .where(eq(syncTable.id, SYNC_SINGLE_ID));
      } else {
        await drizzleDb.insert(syncTable).values({
          id: SYNC_SINGLE_ID,
          lastSync: date,
        });
      }
      setLastSyncInMemory(date);
    },
    [drizzleDb, setLastSyncInMemory],
  );

  return { setLastSync };
};
export default useSetLastSync;
