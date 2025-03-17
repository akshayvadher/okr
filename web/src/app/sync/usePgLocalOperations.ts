import { usePgLocal } from '@/sync/usePgLocal';
import { useCallback } from 'react';
import { KeyResult, Objective } from '@/types';
import { TransactionEnriched } from '@/sync/transaction';
import usePgLocalMigrate from '@/sync/usePgLocalMigrate';

const usePgLocalOperations = () => {
  const { db } = usePgLocal();
  const { tableNames } = usePgLocalMigrate();

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
        INSERT INTO ${tableNames.objective} (id, title, created_at, updated_at)
        values ('${objective.id}',
                '${objective.title}',
                '${objective.created_at}',
                '${objective.updated_at}')
    `);
    },
    [db, tableNames.objective],
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
    [db, tableNames.keyResult],
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
    [db, tableNames.keyResult],
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
    [db, tableNames.transaction],
  );

  const registerTransactionLocalDb = useCallback(
    async (transaction: TransactionEnriched) => {
      const { exists } = await doesTransactionExist(transaction.id);
      if (exists) return;
      if (!db) throw new Error('db connection not available');
      await db.exec(
        `INSERT INTO ${tableNames.transaction} (id, entity, action, payload, created_at)
        values ('${transaction.id}',
                '${transaction.entity}',
                '${transaction.action}',
                '${JSON.stringify(transaction.payload)}',
                '${transaction.created_at}')
    `,
      );
    },
    [db, doesTransactionExist, tableNames.transaction],
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
