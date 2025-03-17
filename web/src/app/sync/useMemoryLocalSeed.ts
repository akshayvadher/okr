import usePgLocalMigrate from '@/sync/usePgLocalMigrate';
import { useCallback, useEffect, useState } from 'react';
import { KeyResult, Objective } from '@/types';
import {
  useAddKeyResult,
  useAddObjective,
  useGetAllObjectsFromMemory,
} from '@/sync/object-pool';
import { usePgLocal } from '@/sync/usePgLocal';
import usePgLocalAndMemorySetLastSync from '@/sync/usePgLocalAndMemorySetLastSync';
import useServerSeed from '@/sync/useServerSeed';
import { useClientMetadata } from '@/sync/client-metadata-memory';

const useMemoryLocalSeed = () => {
  const { db } = usePgLocal();
  const { dbCreated, tableNames } = usePgLocalMigrate();
  const [seeded, setSeeded] = useState(false);
  const [pgLocalAndMemoryReady, setPgLocalAndMemoryReady] = useState(false);

  const { clientAppStartTime } = useClientMetadata();

  const allObjectsFromMemoryPool = useGetAllObjectsFromMemory();
  const addObjective = useAddObjective();
  const addKeyResult = useAddKeyResult();
  const { setLastSync } = usePgLocalAndMemorySetLastSync();

  const { serverSeed } = useServerSeed();

  const localIfFirstTime = useCallback(async () => {
    if (!db || !dbCreated || seeded) {
      return;
    }
    setSeeded(true);
    if (allObjectsFromMemoryPool.length !== 0) {
      return;
    }
    const objectivesFromPgLocal = await db.query(
      `select * from ${tableNames.objective}`,
    );
    const allObjectives = objectivesFromPgLocal.rows as Objective[];
    allObjectives.forEach(addObjective);

    const keyResultsFromPgLocal = await db.query(
      `select * from ${tableNames.keyResult}`,
    );
    const allKeyResults = keyResultsFromPgLocal.rows as KeyResult[];
    allKeyResults.forEach(addKeyResult);

    const lastSync = await db.query(
      `select * from ${tableNames.sync} where id = 'last_sync'`,
    );
    if (lastSync.rows.length > 0) {
      const lastSyncRow = lastSync.rows[0] as {
        id: string;
        last_sync: string;
      };
      const lastSyncDate = new Date(lastSyncRow.last_sync);
      setLastSync(lastSyncDate).then();
    } else {
      setLastSync(clientAppStartTime).then();
      await serverSeed();
    }
    setPgLocalAndMemoryReady(true);
  }, [
    addKeyResult,
    addObjective,
    allObjectsFromMemoryPool.length,
    clientAppStartTime,
    db,
    dbCreated,
    seeded,
    serverSeed,
    setLastSync,
    tableNames,
  ]);

  useEffect(() => {
    localIfFirstTime().then();
  }, [localIfFirstTime]);

  return { pgLocalAndMemoryReady };
};

export default useMemoryLocalSeed;
