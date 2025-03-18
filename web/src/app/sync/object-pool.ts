import { KeyResult, Objective, ObjectiveWithProgress } from '@/types';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { calculateObjectiveStatus } from '@/lib/utils';

export interface ObjectInPool {
  object: Objective | KeyResult;
  type: 'OBJECTIVE' | 'KEY_RESULT';
}

export const objectPool = atom<ObjectInPool[]>([]);
export const useGetAllObjectsFromMemory = () => useAtomValue(objectPool);

const objectives = atom<ObjectiveWithProgress[]>((get) =>
  get(objectPool)
    .filter((o) => o.type === 'OBJECTIVE')
    .map((o) => o.object as Objective)
    .map((o) => ({
      ...o,
      key_results: get(objectPool)
        .filter((k) => k.type === 'KEY_RESULT')
        .filter((k) => (k.object as KeyResult).objective_id === o.id)
        .map((k) => k.object as KeyResult)
        .sort((a, b) => a.id.localeCompare(b.id)),
    }))
    .map((o) => ({
      ...o,
      ...calculateObjectiveStatus(o),
    })),
);

const selectedObjectiveId = atom<string>();
export const useSelectedObjectiveId = () =>
  useSetAtom(
    atom(null, (_get, set, objectiveId: string) =>
      set(selectedObjectiveId, objectiveId),
    ),
  );
const objective = atom<ObjectiveWithProgress | undefined>((get) => {
  const objectiveId = get(selectedObjectiveId);
  if (!objective) {
    return;
  }
  return get(objectives).find((o) => o.id === objectiveId);
});

const addObjective = atom(null, (get, set, o: Objective) => {
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

const addKeyResult = atom(null, (get, set, kr: KeyResult) => {
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
    const krObject = keyResult.object as KeyResult;
    krObject.current = progress;

    set(objectPool, [
      ...allObjects.filter((o) => o.object.id !== keyResult.object.id),
      { ...keyResult, object: krObject },
    ]);
  },
);
export const useAddKeyResult = () => useSetAtom(addKeyResult);
export const useUpdateKeyResultProgress = () =>
  useSetAtom(updateKeyResultProgress);
