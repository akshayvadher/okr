import { usePgLocal } from '@/sync/usePgLocal';
import { useEffect, useState } from 'react';
import {
  useAddKeyResult,
  useAddObjective,
  useObjectivesFromPool,
} from '@/sync/object-pool';
import { api } from '@/lib/api';
import { useTransactionQueue } from '@/sync/useTransactionQueue';
import { parseISO } from 'date-fns';

const useGetObjects = () => {
  const [serverLoadingDone, setServerLoadingDone] = useState(false);
  const { localLoadingDone } = usePgLocal();
  const { addObjectivePgLocal, addKeyResultPgLocal } = useTransactionQueue();
  const objectives = useObjectivesFromPool();
  const addObjective = useAddObjective();
  const addKeyResult = useAddKeyResult();

  useEffect(() => {
    if (!serverLoadingDone && localLoadingDone) {
      if (objectives.length === 0) {
        const getObjects = async () => {
          const objectives = (await api.getObjectives()).sort(
            (a, b) =>
              parseISO(a.created_at).getMilliseconds() -
              parseISO(b.created_at).getMilliseconds(),
          );
          const keyResults = objectives
            .flatMap((o) => o.key_results ?? [])
            .sort(
              (a, b) =>
                parseISO(a.created_at).getMilliseconds() -
                parseISO(b.created_at).getMilliseconds(),
            );

          console.log('server insertion', objectives, keyResults);
          objectives.forEach(addObjective);
          objectives.forEach(addObjectivePgLocal);

          keyResults.forEach(addKeyResult);
          keyResults.forEach(addKeyResultPgLocal);

          setServerLoadingDone(true);
        };
        getObjects().then();
      } else {
        setServerLoadingDone(true);
      }
    }
  }, [
    addKeyResult,
    addKeyResultPgLocal,
    addObjective,
    addObjectivePgLocal,
    localLoadingDone,
    objectives.length,
    serverLoadingDone,
  ]);

  return { serverLoadingDone };
};

export default useGetObjects;
