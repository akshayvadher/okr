import usePgLocalMigrate from '@/sync/usePgLocalMigrate';
import { useCallback, useEffect, useState } from 'react';
import {
  useAddKeyResult,
  useAddObjective,
  useGetAllObjectsFromMemory,
} from '@/sync/object-pool';
import useSetLastSync from '@/sync/useSetLastSync';
import useServerToMemorySeed from '@/sync/useServerToMemorySeed';
import { useClientMetadata } from '@/sync/client-metadata-memory';
import usePgLocalOperations from '@/sync/usePgLocalOperations';
import { useEnqueue } from '@/sync/transaction-sync-forward-queue';

const usePgLocalToMemorySeed = () => {
  const [seeded, setSeeded] = useState(false);
  const [pgLocalAndMemoryReady, setPgLocalAndMemoryReady] = useState(false);

  const { clientAppStartTime } = useClientMetadata();

  const { dbCreated } = usePgLocalMigrate();
  const {
    getAllObjectives,
    getAllKeyResults,
    getLastSync,
    getAllPendingSyncForwardTransactions,
  } = usePgLocalOperations();

  const allObjectsFromMemoryPool = useGetAllObjectsFromMemory();
  const addObjective = useAddObjective();
  const addKeyResult = useAddKeyResult();
  const { setLastSync } = useSetLastSync();

  const queueSyncForwardTransaction = useEnqueue();

  const { serverSeed } = useServerToMemorySeed();

  const localIfFirstTime = useCallback(async () => {
    if (!dbCreated || seeded) {
      return;
    }
    setSeeded(true);
    if (allObjectsFromMemoryPool.length !== 0) {
      return;
    }

    const allObjectives = await getAllObjectives();
    allObjectives.forEach(addObjective);

    const allKeyResults = await getAllKeyResults();
    allKeyResults.forEach(addKeyResult);

    const allPendingSyncForwardTransactions =
      await getAllPendingSyncForwardTransactions();
    allPendingSyncForwardTransactions.forEach(queueSyncForwardTransaction);

    console.log('Seeding from local', {
      allObjectives,
      allKeyResults,
      allPendingSyncForwardTransactions,
    });

    const lastSync = await getLastSync();
    if (lastSync?.lastSync) {
      setLastSync(lastSync?.lastSync).then();
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
    dbCreated,
    getAllKeyResults,
    getAllObjectives,
    getAllPendingSyncForwardTransactions,
    getLastSync,
    queueSyncForwardTransaction,
    seeded,
    serverSeed,
    setLastSync,
  ]);

  useEffect(() => {
    localIfFirstTime().then();
  }, [localIfFirstTime]);

  return { pgLocalAndMemoryReady };
};

export default usePgLocalToMemorySeed;
