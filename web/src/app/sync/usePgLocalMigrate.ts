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
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ${tableNames.objective}
      ${queries.objective}
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS ${tableNames.keyResult}
      ${queries.keyResult}
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS ${tableNames.comment}
      ${queries.comment}
    `)

    await db.exec(`
      CREATE TABLE IF NOT EXISTS ${tableNames.task}
      ${queries.task}
    `)

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
