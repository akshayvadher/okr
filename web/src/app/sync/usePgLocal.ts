import { PGlite } from '@electric-sql/pglite';
import { useCallback, useEffect, useState } from 'react';
import {
  useAddKeyResult,
  useAddObjective,
  useGetAll,
} from '@/sync/object-pool';
import { KeyResult, Objective } from '@/types';
import { useTimeContext } from '@/contex/TimeContext';

// Create a singleton instance outside of the hook
let pgLiteInstance: PGlite;

export const usePgLocal = () => {
  const [db, setDb] = useState<PGlite>();
  const [dbCreated, setDbCreated] = useState(false);
  const [localLoadingDone, setLocalLoadingDone] = useState(false);
  const [ready, setReady] = useState(false);
  const { setLastSyncTime, clientAppStartTime } = useTimeContext();
  const [triedLoadingFromLocal, setTriedLoadingFromLocal] = useState(false);

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

    await db.exec(`
      CREATE TABLE IF NOT EXISTS sync
      (
          id         TEXT PRIMARY KEY,
          last_sync  TEXT
      )
    `);
    setDbCreated(true);
  }, [db]);

  const localIfFirstTime = useCallback(async () => {
    if (db && dbCreated) {
      console.log('db ready------');
      if (all.length === 0 && !triedLoadingFromLocal) {
        const os = await db.query(`
          select 
            *
          from 
            objectives`);
        const allObjectives = os.rows as Objective[];
        console.log('adding o ---');
        allObjectives.forEach(addObjective);
        console.log('added o ---');

        const ks = await db.query(`
          select 
            *
          from 
            key_results`);
        const allKeyResults = ks.rows as KeyResult[];
        allKeyResults.forEach(addKeyResult);

        const lastSync = await db.query(`
          select 
            *
          from 
            sync
          where id = 'last_sync'`);
        if (lastSync.rows.length > 0) {
          const lastSyncRow = lastSync.rows[0] as {
            id: string;
            last_sync: string;
          };
          console.log({ lastSyncRow });
          const lastSyncDate = new Date(lastSyncRow.last_sync);
          setLastSyncTime(lastSyncDate);
        } else {
          setLastSyncTime(clientAppStartTime);
        }
        setTriedLoadingFromLocal(true);
      }

      setLocalLoadingDone(true);
      setReady(true);
    }
  }, [
    addKeyResult,
    addObjective,
    all.length,
    clientAppStartTime,
    db,
    dbCreated,
    setLastSyncTime,
    triedLoadingFromLocal,
  ]);

  useEffect(() => {
    console.log('---- started process');
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
      setLastSyncTime(dateToSet);
    },
    [db, setLastSyncTime],
  );

  return { db, doesTransactionExist, ready, localLoadingDone, setLastSync };
};
