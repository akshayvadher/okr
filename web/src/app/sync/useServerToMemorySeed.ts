import { useCallback, useState } from 'react';
import {
  useAddKeyResult,
  useAddObjective,
  useObjectivesFromPool,
} from '@/sync/object-pool';
import { api } from '@/lib/api';
import usePgLocalOperations from '@/sync/usePgLocalOperations';

const useServerToMemorySeed = () => {
  const [serverSeedDone, setServerSeedDone] = useState(false);
  const objectivesInMemory = useObjectivesFromPool();

  const addObjective = useAddObjective();
  const addKeyResult = useAddKeyResult();
  const { addObjectivePgLocal, addKeyResultPgLocal } = usePgLocalOperations();

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

      console.log('Seeding from server', {objectives, keyResults});
      objectives.forEach(addObjective);
      objectives.forEach(addObjectivePgLocal);

      keyResults.forEach(addKeyResult);
      keyResults.forEach(addKeyResultPgLocal);
    };
    getObjectsFromServer().then();
  }, [
    addKeyResult,
    addKeyResultPgLocal,
    addObjective,
    addObjectivePgLocal,
    objectivesInMemory.length,
    serverSeedDone,
  ]);

  return { serverSeed };
};

export default useServerToMemorySeed;
