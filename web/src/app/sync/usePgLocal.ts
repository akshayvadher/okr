import { PGlite } from '@electric-sql/pglite';
import { useEffect, useState } from 'react';
import { live, LiveNamespace } from '@electric-sql/pglite/live';
import { drizzle, PgliteDatabase } from 'drizzle-orm/pglite';

type PGLiteWithLive = PGlite & {
  live: LiveNamespace;
};
// Create a singleton instance outside the hook
let pgLiteInstance: PGLiteWithLive;

export const usePgLocal = () => {
  const [db, setDb] = useState<PGLiteWithLive>();
  const [drizzleDb, setDrizzleDb] = useState<PgliteDatabase>();

  useEffect(() => {
    pgLiteInstance ??= new PGlite('idb://okr-sandbox', {
      extensions: { live },
    }) as PGLiteWithLive;
    setDb(pgLiteInstance);
  }, []);

  useEffect(() => {
    if (!db) {
      return;
    }
    const drizzleDbInstance = drizzle(db);
    setDrizzleDb(drizzleDbInstance);
  }, [db]);

  return { db, drizzleDb };
};
