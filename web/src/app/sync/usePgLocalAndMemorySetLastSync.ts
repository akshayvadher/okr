import { useCallback } from 'react';
import { usePgLocal } from './usePgLocal';
import { useSetLastSyncMemory } from '@/sync/last-sync-memory';

const usePgLocalAndMemorySetLastSync = () => {
  const { db } = usePgLocal();
  const setLastSyncInMemory = useSetLastSyncMemory();

  const setLastSync = useCallback(
    async (date: Date | string) => {
      if (!db) {
        throw new Error('db not found');
      }
      const exists = await db.query(
        `SELECT * FROM sync WHERE id = 'last_sync'`,
      );
      const dateToInsert = typeof date === 'string' ? date : date.toISOString();
      if (exists.rows.length > 0) {
        await db.exec(`
          UPDATE sync
          SET last_sync = '${dateToInsert}'
          WHERE id = 'last_sync'
        `);
      } else {
        await db.exec(`
          INSERT INTO sync (id, last_sync)
          VALUES ('last_sync', '${dateToInsert}')
        `);
      }
      const dateToSet = typeof date === 'string' ? new Date(date) : date;
      setLastSyncInMemory(dateToSet);
    },
    [db, setLastSyncInMemory],
  );

  return { setLastSync };
};
export default usePgLocalAndMemorySetLastSync;
