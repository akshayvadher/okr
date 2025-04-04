import { useCallback, useState } from 'react';
import {
  useAddKeyResult,
  useAddObjective,
  useObjectivesFromPool,
  useAddComment,
} from '@/sync/object-pool';
import { api } from '@/lib/api';
import usePgLocalOperations from '@/sync/usePgLocalOperations';
import { objectiveDtoToModel } from '@/types/transform';

const useServerToMemorySeed = () => {
  const [serverSeedDone, setServerSeedDone] = useState(false);
  const objectivesInMemory = useObjectivesFromPool();

  const addObjective = useAddObjective();
  const addKeyResult = useAddKeyResult();
  const addComment = useAddComment();
  const { addObjectivePgLocal, addKeyResultPgLocal, addCommentPgLocal } =
    usePgLocalOperations();

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
      const objectivesDto = await api.getObjectives();
      const { objectives, keyResults, comments } =
        objectiveDtoToModel(objectivesDto);

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
