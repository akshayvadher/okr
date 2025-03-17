import { useCallback, useEffect, useState } from 'react';
import { usePgLocal } from '@/sync/usePgLocal';

const usePgLocalMigrate = () => {
  const { db } = usePgLocal();
  const [dbCreated, setDbCreated] = useState(false);

  const init = useCallback(async () => {
    if (!db) {
      return;
    }
    await db.exec(`
      CREATE TABLE IF NOT EXISTS objectives
      (
          id         TEXT PRIMARY KEY,
          title      TEXT,
          created_at TEXT,
          updated_at TEXT
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS key_results
      (
          id           TEXT PRIMARY KEY,
          objective_id TEXT,
          title        TEXT,
          target       INTEGER,
          current      INTEGER,
          metrics      TEXT,
          created_at   TEXT,
          updated_at   TEXT
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS transactions
      (
          id         TEXT PRIMARY KEY,
          entity     TEXT,
          action     TEXT,
          payload    TEXT,
          created_at TEXT
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS sync
      (
          id         TEXT PRIMARY KEY,
          last_sync  TEXT
      )
    `);
    setDbCreated(true);
  }, [db]);

  useEffect(() => {
    init().then();
  }, [init]);

  return { dbCreated };
};

export default usePgLocalMigrate;
