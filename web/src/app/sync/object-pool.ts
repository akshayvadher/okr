import { atom, useAtomValue, useSetAtom } from 'jotai';
import { calculateObjectiveStatus } from '@/lib/utils';
import { CommentModel, KeyResultModel, ObjectiveModel } from '@/types/model';
import { ObjectiveView } from '@/types/view';

export interface ObjectInPool {
  object: ObjectiveModel | KeyResultModel | CommentModel;
  type: 'OBJECTIVE' | 'KEY_RESULT' | 'COMMENT';
}

export const objectPool = atom<ObjectInPool[]>([]);
export const useGetAllObjectsFromMemory = () => useAtomValue(objectPool);

const objectives = atom<ObjectiveView[]>((get) =>
  get(objectPool)
    .filter((o) => o.type === 'OBJECTIVE')
    .map((o) => o.object as ObjectiveModel)
    .map((o) => ({
      ...o,
      keyResults: get(objectPool)
        .filter((k) => k.type === 'KEY_RESULT')
        .filter((k) => (k.object as KeyResultModel).objectiveId === o.id)
        .map((k) => k.object as KeyResultModel)
        .sort((a, b) => a.id.localeCompare(b.id)),
      comments: get(objectPool)
        .filter((c) => c.type === 'COMMENT')
        .map((c) => c.object as CommentModel)
        .filter((c) => c.objectiveId === o.id)
        .filter((c) => !c.keyResultId)
        .sort((a, b) => a.id.localeCompare(b.id)),
    }))
    .map((o) => ({
      ...o,
      ...calculateObjectiveStatus(o),
    }))
    .sort((a, b) => a.id.localeCompare(b.id)),
);

const selectedObjectiveId = atom<string>();
export const useSelectObjectiveId = () => useSetAtom(selectedObjectiveId);
const objective = atom<ObjectiveView | undefined>((get) => {
  const objectiveId = get(selectedObjectiveId);
  if (!objective) {
    return;
  }
  return get(objectives).find((o) => o.id === objectiveId);
});

const addObjective = atom(null, (get, set, o: ObjectiveModel) => {
  const allObjects = get(objectPool);
  const existingObjective = allObjects.find(
    (objectInPool) =>
      objectInPool.type === 'OBJECTIVE' && objectInPool.object.id === o.id,
  );
  if (existingObjective) {
    return;
  }
  set(objectPool, [
    ...allObjects,
    {
      object: o,
      type: 'OBJECTIVE',
    },
  ]);
});

export const useObjectivesFromPool = () => useAtomValue(objectives);
export const useObjectiveFromPool = () => useAtomValue(objective);
export const useAddObjective = () => useSetAtom(addObjective);

const addKeyResult = atom(null, (get, set, kr: KeyResultModel) => {
  const allObjects = get(objectPool);
  const existingKeyResult = allObjects.find(
    (o) => o.type === 'KEY_RESULT' && o.object.id === kr.id,
  );
  if (existingKeyResult) {
    return;
  }
  set(objectPool, [
    ...allObjects,
    {
      object: kr,
      type: 'KEY_RESULT',
    },
  ]);
});

const updateKeyResultProgress = atom(
  null,
  (
    get,
    set,
    {
      id,
      progress,
    }: {
      id: string;
      progress: number;
    },
  ) => {
    const allObjects = get(objectPool);
    const keyResult = allObjects.find(
      (o) => o.type === 'KEY_RESULT' && o.object.id === id,
    );
    if (!keyResult || !keyResult.object) {
      throw new Error(`Key result with id ${id} not found`);
    }

    set(objectPool, (prev) =>
      prev.map((item) =>
        item.object.id === id
          ? {
              ...item,
              object: {
                ...item.object,
                current: progress,
              },
            }
          : item,
      ),
    );
  },
);
export const useAddKeyResult = () => useSetAtom(addKeyResult);
export const useUpdateKeyResultProgress = () =>
  useSetAtom(updateKeyResultProgress);

const addComment = atom(null, (get, set, c: CommentModel) => {
  const allObjects = get(objectPool);
  const existingComment = allObjects.find(
    (o) => o.type === 'COMMENT' && o.object.id === c.id,
  );
  if (existingComment) {
    return;
  }
  set(objectPool, [...allObjects, { object: c, type: 'COMMENT' }]);
});
export const useAddComment = () => useSetAtom(addComment);

const updateObjective = atom(
  null,
  (get, set, update: Partial<ObjectiveModel> & { id: string }) => {
    const allObjects = get(objectPool);
    const existingObjective = allObjects.find(
      (o) => o.type === 'OBJECTIVE' && o.object.id === update.id,
    )?.object as ObjectiveModel;
    if (!existingObjective) {
      throw new Error(`Objective with id ${update.id} not found`);
    }
    set(objectPool, (prev) =>
      prev.map((item) =>
        item.type === 'OBJECTIVE' && item.object.id === update.id
          ? {
              ...item,
              object: {
                ...existingObjective,
                ...update,
              },
            }
          : item,
      ),
    );
  },
);

export const useUpdateObjective = () => useSetAtom(updateObjective);
