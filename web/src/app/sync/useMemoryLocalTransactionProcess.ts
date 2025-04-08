import { useCallback } from 'react';
import { TransactionEnriched } from '@/sync/transaction';
import { TaskStatus } from '@/types/model';
import {
  CreateCommentRequest,
  CreateKeyResultRequestWithObjective,
  CreateObjectiveRequest,
  CreateTaskRequest,
  UpdateObjectiveRequest,
  UpdateProgressRequestWithKeyResult,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from '@/types/dto/request';
import {
  useUpdateKeyResultProgress,
  useUpdateObjective,
  useUpdateTask,
  useUpdateTaskStatus,
} from '@/sync/object-pool';
import { useAddObjective } from '@/hooks/useObjectives';
import { useAddKeyResult } from '@/hooks/useKeyResults';
import { useAddComment } from '@/hooks/useComments';
import { useAddTask } from '@/hooks/useTasks';

const useMemoryLocalTransactionProcess = () => {
  const addObjectiveLocal = useAddObjective();
  const updateObjectiveLocal = useUpdateObjective();
  const addKeyResultLocal = useAddKeyResult();
  const updateKeyResultProgressLocal = useUpdateKeyResultProgress();
  const addCommentLocal = useAddComment();
  const addTaskLocal = useAddTask();
  const updateTaskLocal = useUpdateTask();
  const updateTaskStatusLocal = useUpdateTaskStatus();

  const transactionLocalInMemoryProcessor = useCallback(
    async (transaction: TransactionEnriched) => {
      switch (transaction.entity) {
        case 'OBJECTIVE':
          switch (transaction.action) {
            case 'CREATE': {
              const request = transaction.payload as CreateObjectiveRequest;
              addObjectiveLocal({
                ...request,
                id: transaction.id,
                createdAt: transaction.createdAt,
                updatedAt: transaction.createdAt,
              });
              break;
            }
            case 'UPDATE': {
              const request = transaction.payload as UpdateObjectiveRequest;
              updateObjectiveLocal({
                ...request,
                id: request.id,
                updatedAt: new Date(),
              });
              break;
            }
            default:
              throw new Error(`Unknown action: ${transaction.action}`);
          }
          break;
        case 'KEY_RESULT':
          switch (transaction.action) {
            case 'CREATE': {
              const request =
                transaction.payload as CreateKeyResultRequestWithObjective;
              addKeyResultLocal({
                ...request,
                id: transaction.id,
                createdAt: transaction.createdAt,
                updatedAt: transaction.createdAt,
                current: 0,
              });
              break;
            }
            case 'UPDATE_PROGRESS': {
              const request =
                transaction.payload as UpdateProgressRequestWithKeyResult;
              updateKeyResultProgressLocal({
                id: request.keyResultId,
                progress: request.progress,
              });
              break;
            }
            default:
              throw new Error(`Unknown action: ${transaction.action}`);
          }
          break;
        case 'COMMENT':
          switch (transaction.action) {
            case 'CREATE':
              const request = transaction.payload as CreateCommentRequest;
              addCommentLocal({
                ...request,
                id: transaction.id,
                createdAt: transaction.createdAt,
              });
              break;
          }
          break;
        case 'TASK':
          switch (transaction.action) {
            case 'CREATE': {
              const request = transaction.payload as CreateTaskRequest;
              addTaskLocal({
                ...request,
                id: transaction.id,
                status: 'todo' as TaskStatus,
                createdAt: transaction.createdAt,
                updatedAt: transaction.createdAt,
              });
              break;
            }
            case 'UPDATE': {
              const request = transaction.payload as UpdateTaskRequest;
              updateTaskLocal({
                id: request.id,
                title: request.title,
                updatedAt: new Date(),
                objectiveId: request.objectiveId,
              });
              break;
            }
            case 'UPDATE_STATUS': {
              const request = transaction.payload as UpdateTaskStatusRequest;
              updateTaskStatusLocal({
                id: request.id,
                status: request.status,
                updatedAt: new Date(),
                objectiveId: request.objectiveId,
              });
              break;
            }
            default:
              throw new Error(`Unknown action: ${transaction.action}`);
          }
          break;
        default:
          throw new Error(`Unknown entity: ${transaction.entity}`);
      }
    },
    [
      addObjectiveLocal,
      updateObjectiveLocal,
      addKeyResultLocal,
      updateKeyResultProgressLocal,
      addCommentLocal,
      addTaskLocal,
      updateTaskLocal,
      updateTaskStatusLocal,
    ],
  );

  return { transactionLocalInMemoryProcessor };
};

export default useMemoryLocalTransactionProcess;
