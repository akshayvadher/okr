import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import usePgLocalOperations from '@/sync/usePgLocalOperations';
import { objectiveDtoToModel } from '@/types/transform';
import useObjectives, { useAddObjective } from '@/hooks/useObjectives';
import { useAddKeyResult } from '@/hooks/useKeyResults';
import { useAddComment } from '@/hooks/useComments';
import { useAddTask } from '@/hooks/useTasks';

const useServerToMemorySeed = () => {
  const [serverSeedDone, setServerSeedDone] = useState(false);
  const { objectives: objectivesInMemory } = useObjectives();

  const addObjective = useAddObjective();
  const addKeyResult = useAddKeyResult();
  const addComment = useAddComment();
  const addTask = useAddTask();
  const { addObjectivePgLocal, addKeyResultPgLocal, addCommentPgLocal, addTaskPgLocal } =
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
      const { objectives, keyResults, comments, tasks } =
        objectiveDtoToModel(objectivesDto);

      console.log('Seeding from server', { objectives, keyResults, comments, tasks });
      objectives.forEach(addObjective);
      objectives.forEach(addObjectivePgLocal);

      keyResults.forEach(addKeyResult);
      keyResults.forEach(addKeyResultPgLocal);

      comments.forEach(addComment);
      comments.forEach(addCommentPgLocal);

      tasks.forEach(addTask);
      tasks.forEach(addTaskPgLocal);
    };
    getObjectsFromServer().then();
  }, [
    addKeyResult,
    addKeyResultPgLocal,
    addObjective,
    addObjectivePgLocal,
    addComment,
    addCommentPgLocal,
    addTask,
    addTaskPgLocal,
    objectivesInMemory.length,
    serverSeedDone,
  ]);

  return { serverSeed };
};

export default useServerToMemorySeed;
