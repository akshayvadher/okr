import { useEnqueue } from '@/sync/queue';
import { CreateTaskRequest } from '@/types/dto/request';
import { useCallback } from 'react';
import { TaskStatus } from '@/types/model';
import { useSetAtom } from 'jotai/index';
import { addObjectOfEntity } from '@/sync/object-pool';

const addTask = addObjectOfEntity('TASK');
export const useAddTask = () => useSetAtom(addTask);

const useTasks = () => {
  const enqueue = useEnqueue();

  const createTask = useCallback(
    (objectiveId: string, title: string, keyResultId?: string) => {
      const task: CreateTaskRequest = {
        title,
        objectiveId,
        keyResultId,
      };

      enqueue({
        entity: 'TASK',
        action: 'CREATE',
        payload: task,
      });
    },
    [enqueue],
  );

  const updateTask = useCallback(
    (taskId: string, title: string, objectiveId: string) => {
      enqueue({
        entity: 'TASK',
        action: 'UPDATE',
        payload: {
          id: taskId,
          title,
          objectiveId,
        },
      });
    },
    [enqueue],
  );

  const updateTaskStatus = useCallback(
    (taskId: string, status: TaskStatus, objectiveId: string) => {
      enqueue({
        entity: 'TASK',
        action: 'UPDATE_STATUS',
        payload: {
          id: taskId,
          status,
          objectiveId,
        },
      });
    },
    [enqueue],
  );

  return { createTask, updateTask, updateTaskStatus };
};

export default useTasks;
