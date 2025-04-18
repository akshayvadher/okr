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
import usePgLocalOperations from '@/sync/usePgLocalOperations';

const usePgLocalTransactionProcess = () => {
  const {
    addKeyResultPgLocal,
    addObjectivePgLocal,
    updateKeyResultProgressPgLocal,
    addCommentPgLocal,
    updateObjectivePgLocal,
    addTaskPgLocal,
    updateTaskPgLocal,
    updateTaskStatusPgLocal,
  } = usePgLocalOperations();

  const transactionLocalDbProcessor = useCallback(
    async (transaction: TransactionEnriched) => {
      switch (transaction.entity) {
        case 'OBJECTIVE':
          switch (transaction.action) {
            case 'CREATE': {
              const request = transaction.payload as CreateObjectiveRequest;
              await addObjectivePgLocal({
                ...request,
                id: transaction.id,
                createdAt: transaction.createdAt,
                updatedAt: transaction.createdAt,
              });
              break;
            }
            case 'UPDATE': {
              const request = transaction.payload as UpdateObjectiveRequest;
              await updateObjectivePgLocal(request);
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
              await addKeyResultPgLocal({
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
              await updateKeyResultProgressPgLocal({
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
              await addCommentPgLocal({
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
              await addTaskPgLocal({
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
              await updateTaskPgLocal({
                id: request.id,
                title: request.title,
                updatedAt: new Date(),
              });
              break;
            }
            case 'UPDATE_STATUS': {
              const request = transaction.payload as UpdateTaskStatusRequest;
              await updateTaskStatusPgLocal({
                id: request.id,
                status: request.status,
                updatedAt: new Date(),
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
      addCommentPgLocal,
      addKeyResultPgLocal,
      addObjectivePgLocal,
      updateKeyResultProgressPgLocal,
      updateObjectivePgLocal,
      addTaskPgLocal,
      updateTaskPgLocal,
      updateTaskStatusPgLocal,
    ],
  );

  return { transactionLocalDbProcessor };
};

export default usePgLocalTransactionProcess;
