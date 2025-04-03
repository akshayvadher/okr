import { usePgLocal } from '@/sync/usePgLocal';
import { useCallback } from 'react';
import { KeyResult, Objective, UpdateObjectiveRequest } from '@/types';
import { TransactionEnriched } from '@/sync/transaction';
import {
  keyResultTable,
  objectiveTable,
  syncTable,
  transactionTable,
  commentTable,
} from '@/sync/drizzle/schema';
import { asc, eq } from 'drizzle-orm/sql';
import { CommentModal } from '@/types/modal';

const usePgLocalOperations = () => {
  const { drizzleDb } = usePgLocal();

  const addObjectivePgLocal = useCallback(
    async (objective: Objective) => {
      if (!drizzleDb) throw new Error('db connection not available');
      const existing = await drizzleDb
        .select()
        .from(objectiveTable)
        .where(eq(objectiveTable.id, objective.id));
      if (existing.length > 0) {
        console.log('Objective already exists in the database');
        return;
      }
      await drizzleDb.insert(objectiveTable).values(objective);
    },
    [drizzleDb],
  );

  const updateObjectivePgLocal = useCallback(
    async (objective: UpdateObjectiveRequest) => {
      if (!drizzleDb) throw new Error('db connection not available');
      await drizzleDb
        .update(objectiveTable)
        .set(objective)
        .where(eq(objectiveTable.id, objective.id));
    },
    [drizzleDb],
  );

  const addKeyResultPgLocal = useCallback(
    async (keyResult: KeyResult) => {
      if (!drizzleDb) throw new Error('db connection not available');
      const existing = await drizzleDb
        .select()
        .from(keyResultTable)
        .where(eq(keyResultTable.id, keyResult.id));
      if (existing.length > 0) {
        console.log('KeyResult already exists in the database');
        return;
      }
      await drizzleDb.insert(keyResultTable).values(keyResult);
    },
    [drizzleDb],
  );

  const updateKeyResultProgressPgLocal = useCallback(
    async ({ id, progress }: { id: string; progress: number }) => {
      if (!drizzleDb) throw new Error('db connection not available');
      await drizzleDb
        .update(keyResultTable)
        .set({ current: progress })
        .where(eq(keyResultTable.id, id));
    },
    [drizzleDb],
  );

  const addCommentPgLocal = useCallback(
    async (comment: CommentModal) => {
      if (!drizzleDb) throw new Error('db connection not available');
      await drizzleDb.insert(commentTable).values(comment);
    },
    [drizzleDb],
  );
  const doesTransactionExist = useCallback(
    async (txId: string) => {
      if (!drizzleDb) throw new Error('db connection not available');
      const transactions = await drizzleDb
        .select()
        .from(transactionTable)
        .where(eq(transactionTable.id, txId));
      return { exists: transactions.length > 0, transaction: transactions[0] };
    },
    [drizzleDb],
  );

  const registerTransactionLocalDb = useCallback(
    async (transaction: TransactionEnriched) => {
      const { exists } = await doesTransactionExist(transaction.id);
      if (exists) return;
      if (!drizzleDb) throw new Error('db connection not available');
      if (!transaction.clientId || !transaction.sessionId)
        throw new Error('sessionId not provided');
      await drizzleDb.insert(transactionTable).values({
        id: transaction.id,
        entity: transaction.entity,
        action: transaction.action,
        clientId: transaction.clientId,
        sessionId: transaction.sessionId,
        objectiveId: transaction.objectiveId!,
        createdAt: transaction.createdAt,
        payloadString: JSON.stringify(transaction.payload),
        serverSyncStatus: 'pending',
      });
    },
    [drizzleDb, doesTransactionExist],
  );

  const getAllPendingSyncForwardTransactions = useCallback(async () => {
    if (!drizzleDb) throw new Error('db connection not available');
    const transactions = await drizzleDb
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.serverSyncStatus, 'pending'))
      .orderBy(asc(transactionTable.serverSyncStatus));
    return transactions.map((t) => ({
      ...t,
      payload: JSON.parse(t.payloadString),
    }));
  }, [drizzleDb]);

  const markSyncForwardTransactionDone = useCallback(
    async (transactionId: string) => {
      if (!drizzleDb) throw new Error('db connection not available');
      await drizzleDb
        .update(transactionTable)
        .set({ serverSyncStatus: 'done' })
        .where(eq(transactionTable.id, transactionId));
    },
    [drizzleDb],
  );

  const getAllObjectives = useCallback(async () => {
    if (!drizzleDb) throw new Error('db connection not available');
    return drizzleDb.select().from(objectiveTable);
  }, [drizzleDb]);

  const getAllKeyResults = useCallback(async () => {
    if (!drizzleDb) throw new Error('db connection not available');
    return drizzleDb.select().from(keyResultTable);
  }, [drizzleDb]);

  const getAllComments = useCallback(async () => {
    if (!drizzleDb) throw new Error('db connection not available');
    return drizzleDb.select().from(commentTable);
  }, [drizzleDb]);

  const getLastSync = useCallback(async () => {
    if (!drizzleDb) throw new Error('db connection not available');
    const lastSync = await drizzleDb.select().from(syncTable);
    if (lastSync.length === 0) {
      return undefined;
    }
    return lastSync[0];
  }, [drizzleDb]);

  return {
    addObjectivePgLocal,
    updateObjectivePgLocal,
    addKeyResultPgLocal,
    updateKeyResultProgressPgLocal,
    addCommentPgLocal,
    registerTransactionLocalDb,
    doesTransactionExist,
    getAllObjectives,
    getAllKeyResults,
    getAllComments,
    getLastSync,
    getAllPendingSyncForwardTransactions,
    markSyncForwardTransactionDone,
  };
};

export default usePgLocalOperations;
