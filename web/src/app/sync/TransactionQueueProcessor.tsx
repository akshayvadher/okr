'use client'

import {useQueueConsumer} from "@/sync/queue";
import {useCallback, useEffect} from "react";
import {TransactionEnriched} from "@/sync/transaction";
import {
  useAddKeyResult,
  useAddObjective,
  useUpdateKeyResultProgress
} from "@/sync/object-pool";
import {
  CreateKeyResultRequestWithObjective,
  CreateObjectiveRequest,
  KeyResult,
  Objective,
  UpdateProgressRequestWithKeyResult
} from "@/types";
import {PgLocal} from "@/sync/PgLocal";
import {usePgLocal} from "@/sync/usePgLocal";

let isProcessing = false;
export const TransactionQueueProcessor = () => {
  const {pendingItems, markAsProcessing, complete, fail} = useQueueConsumer();
  const addObjectiveLocal = useAddObjective();
  const addKeyResultLocal = useAddKeyResult();
  const updateKeyResultProgressLocal = useUpdateKeyResultProgress();

  const {db} = usePgLocal();

  const addObjectivePgLocal = useCallback((objective: Objective) => {
    if (!db) throw new Error("db connection not available");
    db.exec(`
        INSERT INTO objectives (id, title, created_at, updated_at)
        values ('${objective.id}',
                '${objective.title}',
                '${objective.created_at}',
                '${objective.updated_at}')
    `)
  }, [db]);

  const addKeyResultPgLocal = useCallback((keyResult: KeyResult) => {
    if (!db) throw new Error("db connection not available");
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
  }, [db])

  const updateKeyResultProgressPgLocal = useCallback(({id, progress}: {
    id: string,
    progress: number
  }) => {
    if (!db) throw new Error("db connection not available");
    db.exec(`
        UPDATE key_results
        SET current = ${progress}
        WHERE id = '${id}'
    `);
  }, [db]);

  const transactionLocalInMemoryProcessor = useCallback(async (transaction: TransactionEnriched) => {
    switch (transaction.entity) {
      case "OBJECTIVE":
        switch (transaction.action) {
          case "CREATE":
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
      case "KEY_RESULT":
        switch (transaction.action) {
          case "CREATE": {
            const request = transaction.payload as CreateKeyResultRequestWithObjective;
            addKeyResultLocal({
              ...request,
              id: transaction.id,
              created_at: transaction.created_at,
              updated_at: transaction.created_at,
              current: 0,
            })
            break;
          }
          case "UPDATE_PROGRESS": {
            const request = transaction.payload as UpdateProgressRequestWithKeyResult;
            updateKeyResultProgressLocal({
              id: request.keyResultId,
              progress: request.progress,
            })
            break;
          }
          default:
            throw new Error(`Unknown action: ${transaction.action}`);
        }
        break;
      default:
        throw new Error(`Unknown entity: ${transaction.entity}`);
    }
  }, [addKeyResultLocal, addObjectiveLocal, updateKeyResultProgressLocal])

  const transactionLocalDbProcessor = useCallback(async (transaction: TransactionEnriched) => {
    switch (transaction.entity) {
      case "OBJECTIVE":
        switch (transaction.action) {
          case "CREATE":
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
      case "KEY_RESULT":
        switch (transaction.action) {
          case "CREATE": {
            const request = transaction.payload as CreateKeyResultRequestWithObjective;
            addKeyResultPgLocal({
              ...request,
              id: transaction.id,
              created_at: transaction.created_at,
              updated_at: transaction.created_at,
              current: 0,
            })
            break;
          }
          case "UPDATE_PROGRESS": {
            const request = transaction.payload as UpdateProgressRequestWithKeyResult;
            updateKeyResultProgressPgLocal({
              id: request.keyResultId,
              progress: request.progress,
            })
            break;
          }
          default:
            throw new Error(`Unknown action: ${transaction.action}`);
        }
        break;
      default:
        throw new Error(`Unknown entity: ${transaction.entity}`);
    }
  }, [addKeyResultPgLocal, addObjectivePgLocal, updateKeyResultProgressPgLocal])


  const processItem = useCallback(async (
      id: string,
      transaction: TransactionEnriched) => {
    markAsProcessing(id);

    try {
      await transactionLocalInMemoryProcessor(transaction)
      await transactionLocalDbProcessor(transaction)

      complete(id);
    } catch (error) {
      console.error('process failed', error)
      fail(id, "" + error);
    }
  }, [complete, fail, markAsProcessing, transactionLocalDbProcessor, transactionLocalInMemoryProcessor]);

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
    }, 100); // TODO fix the delay

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pendingItems, processNext]);

  return <PgLocal/>;
};
