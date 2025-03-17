import { useCallback } from 'react';
import { TransactionEnriched } from '@/sync/transaction';
import {
  CreateKeyResultRequestWithObjective,
  CreateObjectiveRequest,
  UpdateProgressRequestWithKeyResult,
} from '@/types';
import {
  useAddKeyResult,
  useAddObjective,
  useUpdateKeyResultProgress,
} from '@/sync/object-pool';

const useMemoryLocalTransactionProcess = () => {
  const addObjectiveLocal = useAddObjective();
  const addKeyResultLocal = useAddKeyResult();
  const updateKeyResultProgressLocal = useUpdateKeyResultProgress();

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
                created_at: transaction.created_at,
                updated_at: transaction.created_at,
                key_results: [],
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
                created_at: transaction.created_at,
                updated_at: transaction.created_at,
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
        default:
          throw new Error(`Unknown entity: ${transaction.entity}`);
      }
    },
    [addKeyResultLocal, addObjectiveLocal, updateKeyResultProgressLocal],
  );

  return { transactionLocalInMemoryProcessor };
};

export default useMemoryLocalTransactionProcess;
