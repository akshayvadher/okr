import { useCallback, useEffect, useState } from 'react';
import { usePgLocal } from '@/sync/usePgLocal';
import { simpleHash } from '@/lib/simple-hash';

const queries = {
  objective: `(
          id         TEXT PRIMARY KEY,
          title      TEXT,
          created_at TEXT,
          updated_at TEXT
      )`,
  keyResult: `(
          id           TEXT PRIMARY KEY,
          objective_id TEXT,
          title        TEXT,
          target       INTEGER,
          current      INTEGER,
          metrics      TEXT,
          created_at   TEXT,
          updated_at   TEXT
      )`,
  transaction: `(
          id         TEXT PRIMARY KEY,
          entity     TEXT,
          action     TEXT,
          payload    TEXT,
          created_at TEXT
      )`,
  sync: `(
          id         TEXT PRIMARY KEY,
          last_sync  TEXT
      )`,
};

// Because with every change of table structure, we need to update the change
// there is no way to upgrade, so we are creating a new table altogether
// with difference name (hash changes if the query changes)
const tableNames = {
  objective: 'objective_' + simpleHash(queries.objective),
  keyResult: 'keyResult_' + simpleHash(queries.keyResult),
  transaction: 'transaction_' + simpleHash(queries.transaction),
  sync: 'sync_' + simpleHash(queries.sync),
};

const usePgLocalMigrate = () => {
  const { db } = usePgLocal();
  const [dbCreated, setDbCreated] = useState(false);

  const init = useCallback(async () => {
    if (!db) {
      return;
    }
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ${tableNames.objective}
      ${queries.objective}
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS ${tableNames.keyResult}
      ${queries.keyResult}
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS ${tableNames.transaction}
      ${queries.transaction}
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS ${tableNames.sync}
      ${queries.sync}
    `);
    setDbCreated(true);
  }, [db]);

  useEffect(() => {
    init().then();
  }, [init]);

  return { dbCreated, tableNames };
};

export default usePgLocalMigrate;
