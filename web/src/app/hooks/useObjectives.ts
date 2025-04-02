import { useObjectivesFromPool } from '@/sync/object-pool';
import { useEnqueue } from '@/sync/queue';
import { CreateObjectiveRequest, UpdateObjectiveRequest } from '@/types';
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

  const patchObjective = useCallback(
    (id: string, data: { title?: string; description?: string }) => {
      enqueue({
        entity: 'OBJECTIVE',
        action: 'UPDATE',
        payload: {
          id,
          ...data,
        } as UpdateObjectiveRequest,
      });
    },
    [enqueue],
  );

  return {
    objectives,
    createObjective,
    patchObjective,
  };
};

export default useObjectives;
