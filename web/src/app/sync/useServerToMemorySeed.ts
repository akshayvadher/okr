import { useCallback, useState } from 'react';
import {
  useAddKeyResult,
  useAddObjective,
  useObjectivesFromPool,
  useAddComment,
} from '@/sync/object-pool';
import { api } from '@/lib/api';
import usePgLocalOperations from '@/sync/usePgLocalOperations';

const useServerToMemorySeed = () => {
  const [serverSeedDone, setServerSeedDone] = useState(false);
  const objectivesInMemory = useObjectivesFromPool();

  const addObjective = useAddObjective();
  const addKeyResult = useAddKeyResult();
  const addComment = useAddComment();
  const { addObjectivePgLocal, addKeyResultPgLocal, addCommentPgLocal } = usePgLocalOperations();

  const serverSeed = useCallback(async () => {
    if (serverSeedDone) {
      return;
    }
    setServerSeedDone(true);
    if (objectivesInMemory.length > 0) {
      // this means that either server seed is not required
      // it is required only if the PgLocal is empty
      // or server seed is already done
      return;
    }
    const getObjectsFromServer = async () => {
      const objectives = (await api.getObjectives()).sort((a, b) =>
        a.id.localeCompare(b.id),
      );
      const keyResults = objectives
        .flatMap((o) => o.keyResults ?? [])
        .sort((a, b) => a.id.localeCompare(b.id));
      const comments = objectives
        .flatMap((o) => o.comments ?? [])
        .sort((a, b) => a.id.localeCompare(b.id));

      console.log('Seeding from server', { objectives, keyResults, comments });
      objectives.forEach(addObjective);
      objectives.forEach(addObjectivePgLocal);

      keyResults.forEach(addKeyResult);
      keyResults.forEach(addKeyResultPgLocal);

      comments.forEach(addComment);
      comments.forEach(addCommentPgLocal);
    };
    getObjectsFromServer().then();
  }, [
    addKeyResult,
    addKeyResultPgLocal,
    addObjective,
    addObjectivePgLocal,
    addComment,
    addCommentPgLocal,
    objectivesInMemory.length,
    serverSeedDone,
  ]);

  return { serverSeed };
};

export default useServerToMemorySeed;
