import usePgLocalMigrate from '@/sync/usePgLocalMigrate';
import { useCallback, useEffect, useState } from 'react';
import {
  useAddKeyResult,
  useAddObjective,
  useGetAllObjectsFromMemory,
} from '@/sync/object-pool';
import useSetLastSync from '@/sync/useSetLastSync';
import useServerSeed from '@/sync/useServerSeed';
import { useClientMetadata } from '@/sync/client-metadata-memory';
import usePgLocalOperations from '@/sync/usePgLocalOperations';

const useMemoryLocalSeed = () => {
  const [seeded, setSeeded] = useState(false);
  const [pgLocalAndMemoryReady, setPgLocalAndMemoryReady] = useState(false);

  const { clientAppStartTime } = useClientMetadata();

  const { dbCreated } = usePgLocalMigrate();
  const { getAllObjectives, getAllKeyResults, getLastSync } =
    usePgLocalOperations();

  const allObjectsFromMemoryPool = useGetAllObjectsFromMemory();
  const addObjective = useAddObjective();
  const addKeyResult = useAddKeyResult();
  const { setLastSync } = useSetLastSync();

  const { serverSeed } = useServerSeed();

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

    const lastSync = await getLastSync();
    if (lastSync) {
      const lastSyncDate = new Date(lastSync.last_sync);
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
    dbCreated,
    getAllKeyResults,
    getAllObjectives,
    getLastSync,
    seeded,
    serverSeed,
    setLastSync,
  ]);

  useEffect(() => {
    localIfFirstTime().then();
  }, [localIfFirstTime]);

  return { pgLocalAndMemoryReady };
};

export default useMemoryLocalSeed;
