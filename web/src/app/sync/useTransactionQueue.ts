import { useQueueConsumer } from '@/sync/queue';
import {
  useAddKeyResult,
  useAddObjective,
  useUpdateKeyResultProgress,
} from '@/sync/object-pool';
import { usePgLocal } from '@/sync/usePgLocal';
import { useCallback, useEffect } from 'react';
import {
  CreateKeyResultRequestWithObjective,
  CreateObjectiveRequest,
  KeyResult,
  Objective,
  UpdateProgressRequestWithKeyResult,
} from '@/types';
import { TransactionEnriched } from '@/sync/transaction';
import { api } from '@/lib/api';

let isProcessing = false;

export const useTransactionQueue = () => {
  const { pendingItems, markAsProcessing, complete, fail } = useQueueConsumer();
  const addObjectiveLocal = useAddObjective();
  const addKeyResultLocal = useAddKeyResult();
  const updateKeyResultProgressLocal = useUpdateKeyResultProgress();

  const { db, doesTransactionExist } = usePgLocal();

  const addObjectivePgLocal = useCallback(
    async (objective: Objective) => {
      if (!db) throw new Error('db connection not available');
      const existing = await db.query(
        `select * from objectives where id = '${objective.id}'`,
      );
      if (existing?.rows?.length > 0) {
        console.log('Objective already exists in the database');
        return;
      }
      db.exec(`
        INSERT INTO objectives (id, title, created_at, updated_at)
        values ('${objective.id}',
                '${objective.title}',
                '${objective.created_at}',
                '${objective.updated_at}')
    `);
    },
    [db],
  );

  const addKeyResultPgLocal = useCallback(
    async (keyResult: KeyResult) => {
      if (!db) throw new Error('db connection not available');
      const existing = await db.query(
        `select * from key_results where id = '${keyResult.id}'`,
      );
      if (existing?.rows?.length > 0) {
        console.log('Key result already exists in the database');
        return;
      }
      db.exec(`
        INSERT INTO key_results (id, title, target, metrics, objective_id,
                                 created_at, updated_at, current)
        values ('${keyResult.id}',
                '${keyResult.title}',
                ${keyResult.target},
                '${keyResult.metrics}',
                '${keyResult.objective_id}',
                '${keyResult.created_at}',
                '${keyResult.updated_at}',
                '${keyResult.current}')
    `);
    },
    [db],
  );

  const updateKeyResultProgressPgLocal = useCallback(
    ({ id, progress }: { id: string; progress: number }) => {
      if (!db) throw new Error('db connection not available');
      db.exec(`
        UPDATE key_results
        SET current = ${progress}
        WHERE id = '${id}'
    `);
    },
    [db],
  );

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

  const transactionLocalDbProcessor = useCallback(
    async (transaction: TransactionEnriched) => {
      switch (transaction.entity) {
        case 'OBJECTIVE':
          switch (transaction.action) {
            case 'CREATE':
              const request = transaction.payload as CreateObjectiveRequest;
              addObjectivePgLocal({
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
              addKeyResultPgLocal({
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
              updateKeyResultProgressPgLocal({
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
    [addKeyResultPgLocal, addObjectivePgLocal, updateKeyResultProgressPgLocal],
  );

  const transactionApi = useCallback(
    async (transaction: TransactionEnriched) => {
      api.addTransaction(transaction).then();
    },
    [],
  );

  const registerTransactionLocalDb = useCallback(
    async (transaction: TransactionEnriched) => {
      const { exists } = await doesTransactionExist(transaction.id);
      if (exists) return;
      if (!db) throw new Error('db connection not available');
      db.exec(
        `
        INSERT INTO transactions (id, entity, action, payload, created_at)
        values ('${transaction.id}',
                '${transaction.entity}',
                '${transaction.action}',
                '${JSON.stringify(transaction.payload)}',
                '${transaction.created_at}')
    `,
      ).then();
    },
    [db, doesTransactionExist],
  );

  const processInMemory = useCallback(
    async (id: string, transaction: TransactionEnriched) => {
      try {
        const { exists } = await doesTransactionExist(transaction.id);
        if (exists) return;

        console.log('transaction does not exist so processing', transaction);
        await transactionLocalInMemoryProcessor(transaction);
        await transactionLocalDbProcessor(transaction);
      } catch (error) {
        console.error('process in memory failed', error);
      }
    },
    [
      doesTransactionExist,
      transactionLocalDbProcessor,
      transactionLocalInMemoryProcessor,
    ],
  );

  const processItem = useCallback(
    async (id: string, transaction: TransactionEnriched) => {
      markAsProcessing(id);

      try {
        await registerTransactionLocalDb(transaction);
        await transactionLocalInMemoryProcessor(transaction);
        await transactionLocalDbProcessor(transaction);
        await transactionApi(transaction);

        complete(id);
      } catch (error) {
        console.error('process failed', error);
        fail(id, '' + error);
      }
    },
    [
      complete,
      fail,
      markAsProcessing,
      transactionApi,
      registerTransactionLocalDb,
      transactionLocalDbProcessor,
      transactionLocalInMemoryProcessor,
    ],
  );

  const processNext = useCallback(async () => {
    if (pendingItems.length > 0 && !isProcessing) {
      isProcessing = true;
      const item = pendingItems[0];
      await processItem(item.id, item.transaction);
      isProcessing = false;
    }
  }, [pendingItems, processItem]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingItems.length > 0 && !isProcessing) {
        processNext().then();
      }
    }, 10); // TODO fix the delay

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pendingItems, processNext]);

  return { processInMemory, addObjectivePgLocal, addKeyResultPgLocal };
};
