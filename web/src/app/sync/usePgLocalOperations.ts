import { usePgLocal } from '@/sync/usePgLocal';
import { useCallback } from 'react';
import { KeyResult, Objective } from '@/types';
import { TransactionEnriched } from '@/sync/transaction';
import { tableNames } from './migration-queries';

const usePgLocalOperations = () => {
  const { db } = usePgLocal();

  const addObjectivePgLocal = useCallback(
    async (objective: Objective) => {
      if (!db) throw new Error('db connection not available');
      const existing = await db.query(
        `select * from ${tableNames.objective} where id = '${objective.id}'`,
      );
      if (existing?.rows?.length > 0) {
        console.log('Objective already exists in the database');
        return;
      }
      await db.exec(`
        INSERT INTO ${tableNames.objective} (id, title, description, created_at, updated_at)
        values ('${objective.id}',
                '${objective.title}',
                '${objective.description}',
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
        `select * from ${tableNames.keyResult} where id = '${keyResult.id}'`,
      );
      if (existing?.rows?.length > 0) {
        console.log('Key result already exists in the database');
        return;
      }
      await db.exec(`
        INSERT INTO ${tableNames.keyResult} (id, title, target, metrics, objective_id,
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
    async ({ id, progress }: { id: string; progress: number }) => {
      if (!db) throw new Error('db connection not available');
      await db.exec(`
        UPDATE ${tableNames.keyResult}
        SET current = ${progress}
        WHERE id = '${id}'
    `);
    },
    [db],
  );

  const doesTransactionExist = useCallback(
    async (txId: string) => {
      if (!db) {
        throw new Error('db not found');
      }
      const result = await db.query(
        `SELECT * FROM ${tableNames.transaction} WHERE id = '${txId}'`,
      );
      return { exists: result.rows.length > 0, transaction: result.rows[0] };
    },
    [db],
  );

  const registerTransactionLocalDb = useCallback(
    async (transaction: TransactionEnriched) => {
      const { exists } = await doesTransactionExist(transaction.id);
      if (exists) return;
      if (!db) throw new Error('db connection not available');
      await db.exec(
        `INSERT INTO ${tableNames.transaction} (id, entity, action, client_id, session_id, payload, created_at)
        values ('${transaction.id}',
                '${transaction.entity}',
                '${transaction.action}',
                '${transaction.clientId}',
                '${transaction.sessionId}',
                '${JSON.stringify(transaction.payload)}',
                '${transaction.created_at}')
    `,
      );
    },
    [db, doesTransactionExist],
  );

  return {
    addObjectivePgLocal,
    addKeyResultPgLocal,
    updateKeyResultProgressPgLocal,
    registerTransactionLocalDb,
    doesTransactionExist,
  };
};

export default usePgLocalOperations;
