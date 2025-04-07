import usePgLocalMigrate from '@/sync/usePgLocalMigrate';
import { useCallback, useEffect, useState } from 'react';
import { useGetAllObjectsFromMemory } from '@/sync/object-pool';
import useSetLastSync from '@/sync/useSetLastSync';
import useServerToMemorySeed from '@/sync/useServerToMemorySeed';
import { useClientMetadata } from '@/sync/client-metadata-memory';
import usePgLocalOperations from '@/sync/usePgLocalOperations';
import { useEnqueue } from '@/sync/transaction-sync-forward-queue';
import { f } from './date/format';
import { useAddObjective } from '@/hooks/useObjectives';
import { useAddKeyResult } from '@/hooks/useKeyResults';
import { useAddComment } from '@/hooks/useComments';

const usePgLocalToMemorySeed = () => {
  const [seeded, setSeeded] = useState(false);
  const [pgLocalAndMemoryReady, setPgLocalAndMemoryReady] = useState(false);

  const { clientAppStartTime } = useClientMetadata();

  const { dbCreated } = usePgLocalMigrate();
  const {
    getAllObjectives,
    getAllKeyResults,
    getAllComments,
    getLastSync,
    getAllPendingSyncForwardTransactions,
  } = usePgLocalOperations();

  const allObjectsFromMemoryPool = useGetAllObjectsFromMemory();
  const addObjective = useAddObjective();
  const addKeyResult = useAddKeyResult();
  const addComment = useAddComment();
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

    const allComments = await getAllComments();
    allComments.forEach(addComment);

    const allPendingSyncForwardTransactions =
      await getAllPendingSyncForwardTransactions();
    allPendingSyncForwardTransactions.forEach(queueSyncForwardTransaction);

    console.log('Seeding from local', {
      allObjectives,
      allKeyResults,
      allComments,
      allPendingSyncForwardTransactions,
    });

    const lastSync = await getLastSync();
    if (lastSync?.lastSync) {
      setLastSync(lastSync?.lastSync).then();
    } else {
      setLastSync(f(clientAppStartTime)).then();
      await serverSeed();
    }
    setPgLocalAndMemoryReady(true);
  }, [
    addComment,
    addKeyResult,
    addObjective,
    allObjectsFromMemoryPool.length,
    clientAppStartTime,
    dbCreated,
    getAllComments,
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
