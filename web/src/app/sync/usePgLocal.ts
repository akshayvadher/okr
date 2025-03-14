import { PGlite } from '@electric-sql/pglite';
import { useCallback, useEffect, useState } from 'react';
import {
  useAddKeyResult,
  useAddObjective,
  useGetAll,
} from '@/sync/object-pool';
import { KeyResult, Objective } from '@/types';

// Create a singleton instance outside of the hook
let pgLiteInstance: PGlite;

export const usePgLocal = () => {
  const [db, setDb] = useState<PGlite>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!pgLiteInstance) {
      pgLiteInstance = new PGlite('idb://okr-sandbox');
    }
    setDb(pgLiteInstance);
  }, []);

  const all = useGetAll();
  const addObjective = useAddObjective();
  const addKeyResult = useAddKeyResult();

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
    setReady(true);
  }, [db]);

  const localIfFirstTime = useCallback(async () => {
    if (all.length === 0 && db) {
      const os = await db.query(`
          select 
            *
          from 
            objectives`);
      const allObjectives = os.rows as Objective[];
      allObjectives.forEach(addObjective);

      const ks = await db.query(`
          select 
            *
          from 
            key_results`);
      const allKeyResults = ks.rows as KeyResult[];
      allKeyResults.forEach(addKeyResult);
      console.log({ os, ks });
    }
  }, [addKeyResult, addObjective, all.length, db]);

  useEffect(() => {
    init().then();
    localIfFirstTime().then();
  }, [init, localIfFirstTime]);

  const doesTransactionExist = useCallback(
    async (txId: string) => {
      if (!db) {
        throw new Error('db not found');
      }
      const result = await db.query(
        `SELECT * FROM transactions WHERE id = '${txId}'`,
      );
      return { exists: result.rows.length > 0, transaction: result.rows[0] };
    },
    [db],
  );

  return { db, doesTransactionExist, ready };
};
