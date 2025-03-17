import { useCallback } from 'react';
import { TransactionEnriched } from '@/sync/transaction';
import {
  CreateKeyResultRequestWithObjective,
  CreateObjectiveRequest,
  UpdateProgressRequestWithKeyResult,
} from '@/types';
import usePgLocalOperations from '@/sync/usePgLocalOperations';

const usePgLocalTransactionProcess = () => {
  const {
    registerTransactionLocalDb,
    addKeyResultPgLocal,
    addObjectivePgLocal,
    updateKeyResultProgressPgLocal,
  } = usePgLocalOperations();

  const transactionLocalDbProcessor = useCallback(
    async (transaction: TransactionEnriched) => {
      await registerTransactionLocalDb(transaction);

      switch (transaction.entity) {
        case 'OBJECTIVE':
          switch (transaction.action) {
            case 'CREATE':
              const request = transaction.payload as CreateObjectiveRequest;
              await addObjectivePgLocal({
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
              await addKeyResultPgLocal({
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
        default:
          throw new Error(`Unknown entity: ${transaction.entity}`);
      }
    },
    [
      addKeyResultPgLocal,
      addObjectivePgLocal,
      registerTransactionLocalDb,
      updateKeyResultProgressPgLocal,
    ],
  );

  return { transactionLocalDbProcessor };
};

export default usePgLocalTransactionProcess;
