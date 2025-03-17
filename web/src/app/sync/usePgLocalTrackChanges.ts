import usePgLocalMigrate from '@/sync/usePgLocalMigrate';
import { useEffect } from 'react';
import { usePgLocal } from '@/sync/usePgLocal';
import { LiveChanges } from '@electric-sql/pglite/live';

const usePgLocalTrackChanges = () => {
  const { db } = usePgLocal();
  const { dbCreated, tableNames } = usePgLocalMigrate();

  useEffect(() => {
    if (!dbCreated || !db) {
      return;
    }
    let ret: LiveChanges<{ [p: string]: unknown }>;

    const track = async () => {
      console.log('listening db changes...');
      ret = await db.live.changes(
        `SELECT * FROM ${tableNames.transaction}`,
        [],
        'id',
        (res) => {
          console.log('change in tx table', res);
        },
      );
    };

    track().then();
    return () => {
      ret?.unsubscribe().then();
    };
  }, [db, dbCreated, tableNames.transaction]);
};

export default usePgLocalTrackChanges;
