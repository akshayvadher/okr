import { atom, useAtomValue, useSetAtom } from 'jotai';
import { CommentModel, KeyResultModel, ObjectiveModel, TaskModel } from '@/types/model';
import { atomFamily } from 'jotai/utils';

export type ObjectModels = ObjectiveModel | KeyResultModel | CommentModel | TaskModel;
export type ObjectType = 'OBJECTIVE' | 'KEY_RESULT' | 'COMMENT' | 'TASK';

export interface ObjectInPool {
  object: ObjectModels;
  type: ObjectType;
}

export const objectPool = atom<ObjectInPool[]>([]);
export const useGetAllObjectsFromMemory = () => useAtomValue(objectPool);
export const objectsOfEntity = atomFamily((entity: ObjectType) => {
  return atom((get) =>
    get(objectPool)
      .filter((o) => o.type === entity)
      .map((o) => o.object),
  );
});

export const addObjectOfEntity = atomFamily((entity: ObjectType) =>
  atom(null, (get, set, object: ObjectModels) => {
    const allObjects = get(objectPool);
    const existingObject = allObjects.find(
      (objectInPool) =>
        objectInPool.type === entity && objectInPool.object.id === object.id,
    );
    if (existingObject) {
      return;
    }
    set(objectPool, [
      ...allObjects,
      {
        object,
        type: entity,
      },
    ]);
  }),
);

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
export const useUpdateKeyResultProgress = () =>
  useSetAtom(updateKeyResultProgress);

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

const updateTask = atom(
  null,
  (get, set, update: Partial<TaskModel> & { id: string; objectiveId: string }) => {
    const allObjects = get(objectPool);
    const existingTask = allObjects.find(
      (o) => o.type === 'TASK' && o.object.id === update.id,
    )?.object as TaskModel;
    if (!existingTask) {
      throw new Error(`Task with id ${update.id} not found`);
    }
    set(objectPool, (prev) =>
      prev.map((item) =>
        item.type === 'TASK' && item.object.id === update.id
          ? {
              ...item,
              object: {
                ...existingTask,
                ...update,
              },
            }
          : item,
      ),
    );
  },
);
export const useUpdateTask = () => useSetAtom(updateTask);

const updateTaskStatus = atom(
  null,
  (get, set, update: { id: string; status: string; updatedAt: Date; objectiveId: string }) => {
    const allObjects = get(objectPool);
    const existingTask = allObjects.find(
      (o) => o.type === 'TASK' && o.object.id === update.id,
    )?.object as TaskModel;
    if (!existingTask) {
      throw new Error(`Task with id ${update.id} not found`);
    }
    set(objectPool, (prev) =>
      prev.map((item) =>
        item.type === 'TASK' && item.object.id === update.id
          ? {
              ...item,
              object: {
                ...existingTask,
                status: update.status,
                updatedAt: update.updatedAt,
              },
            }
          : item,
      ),
    );
  },
);
export const useUpdateTaskStatus = () => useSetAtom(updateTaskStatus);
