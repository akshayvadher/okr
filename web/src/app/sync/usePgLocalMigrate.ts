import { useCallback, useEffect, useState } from 'react';
import { usePgLocal } from '@/sync/usePgLocal';
import { queries, tableNames } from './migration-queries';

const usePgLocalMigrate = () => {
  const { db } = usePgLocal();
  const [dbCreated, setDbCreated] = useState(false);

  const init = useCallback(async () => {
    if (!db) {
      return;
    }
    console.log('creating tables if not exists');
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

  return { dbCreated };
};

export default usePgLocalMigrate;
