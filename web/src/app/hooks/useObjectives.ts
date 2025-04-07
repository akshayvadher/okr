import { addObjectOfEntity, objectsOfEntity } from '@/sync/object-pool';
import { useEnqueue } from '@/sync/queue';
import {
  CreateObjectiveRequest,
  UpdateObjectiveRequest,
} from '@/types/dto/request';
import { useCallback } from 'react';
import { CommentModel, KeyResultModel, ObjectiveModel } from '@/types/model';
import { atom, useAtomValue } from 'jotai';
import { calculateObjectiveStatus } from '@/lib/utils';
import { useSetAtom } from 'jotai/index';
import { ObjectiveView } from '@/types/view';

const objectivesAtom = objectsOfEntity('OBJECTIVE');
const keyResultsAtom = objectsOfEntity('KEY_RESULT');
const commentsAtom = objectsOfEntity('COMMENT');

const objectivesWithView = atom((get) =>
  get(objectivesAtom)
    .map((o) => o as ObjectiveModel)
    .map((o) => ({
      ...o,
      keyResults: get(keyResultsAtom)
        .map((k) => k as KeyResultModel)
        .filter((k) => k.objectiveId === o.id)
        .sort((a, b) => a.id.localeCompare(b.id)),
      comments: get(commentsAtom)
        .map((c) => c as CommentModel)
        .filter((c) => c.objectiveId === o.id && !c.keyResultId)
        .sort((a, b) => a.id.localeCompare(b.id)),
    }))
    .map((o) => ({
      ...o,
      ...calculateObjectiveStatus(o),
    }))
    .sort((a, b) => a.id.localeCompare(b.id)),
);

const addObjective = addObjectOfEntity('OBJECTIVE');
export const useAddObjective = () => useSetAtom(addObjective);

const selectedObjectiveId = atom<string>();
const objective = atom<ObjectiveView | undefined>((get) => {
  const objectiveId = get(selectedObjectiveId);
  if (!objective) {
    return;
  }
  return get(objectivesWithView).find((o) => o.id === objectiveId);
});
export const useSelectObjectiveId = () => useSetAtom(selectedObjectiveId);
export const useObjectiveFromPool = () => useAtomValue(objective);

const useObjectives = () => {
  const enqueue = useEnqueue();
  const objectives = useAtomValue(objectivesWithView);

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
