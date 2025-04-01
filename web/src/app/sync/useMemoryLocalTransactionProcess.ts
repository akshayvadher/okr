import { useCallback } from 'react';
import { TransactionEnriched } from '@/sync/transaction';
import {
  CreateCommentRequest,
  CreateKeyResultRequestWithObjective,
  CreateObjectiveRequest,
  UpdateProgressRequestWithKeyResult,
} from '@/types';
import {
  useAddKeyResult,
  useAddObjective,
  useUpdateKeyResultProgress,
  useAddComment,
} from '@/sync/object-pool';

const useMemoryLocalTransactionProcess = () => {
  const addObjectiveLocal = useAddObjective();
  const addKeyResultLocal = useAddKeyResult();
  const updateKeyResultProgressLocal = useUpdateKeyResultProgress();
  const addCommentLocal = useAddComment();

  const transactionLocalInMemoryProcessor = useCallback(
    async (transaction: TransactionEnriched) => {
      switch (transaction.entity) {
        case 'OBJECTIVE':
          switch (transaction.action) {
            case 'CREATE':
              const request = transaction.payload as CreateObjectiveRequest;
              addObjectiveLocal({
                ...request,
                id: transaction.id,
                createdAt: transaction.createdAt,
                updatedAt: transaction.createdAt,
                keyResults: [],
              });
              break;
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
        default:
          throw new Error(`Unknown entity: ${transaction.entity}`);
      }
    },
    [addKeyResultLocal, addObjectiveLocal, updateKeyResultProgressLocal, addCommentLocal],
  );

  return { transactionLocalInMemoryProcessor };
};

export default useMemoryLocalTransactionProcess;
