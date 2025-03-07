'use client';

import {useCallback, useEffect} from "react";
import {useAddKeyResult, useAddObjective, useGetAll} from "@/sync/object-pool";
import {KeyResult, Objective} from "@/types";
import {usePgLocal} from "@/sync/usePgLocal";

export const PgLocal = () => {
  const all = useGetAll();
  const addObjective = useAddObjective();
  const addKeyResult = useAddKeyResult();
  const {db} = usePgLocal();

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
    `)

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
    `)
  }, [db])
  const localIfFirstTime = useCallback(async () => {
    if (all.length === 0 && db) {
      const os = await db.query(`
          select 
            *
          from 
            objectives`)
      const allObjectives = os.rows as Objective[];
      allObjectives.forEach(addObjective)


      const ks = await db.query(`
          select 
            *
          from 
            key_results`)
      const allKeyResults = ks.rows as KeyResult[];
      allKeyResults.forEach(addKeyResult)
      console.log({os, ks})
    }
  }, [addKeyResult, addObjective, all.length, db]);
  useEffect(() => {
    init().then();
    localIfFirstTime().then();
  }, [init, localIfFirstTime]);
  return <></>;
}

