import { useObjectivesFromPool } from '@/sync/object-pool';
import { useEnqueue } from '@/sync/queue';
import { CreateObjectiveRequest } from '@/types';
import { useCallback } from 'react';

const useObjectives = () => {
  const enqueue = useEnqueue();

  const objectives = useObjectivesFromPool();
  const createObjective = useCallback(
    (data: CreateObjectiveRequest) => {
      enqueue({
        entity: 'OBJECTIVE',
        action: 'CREATE',
        payload: data,
      });
    },
    [enqueue],
  );

  return {
    objectives,
    createObjective,
  };
};

export default useObjectives;
