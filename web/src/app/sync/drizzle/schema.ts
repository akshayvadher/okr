import {
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { tableNames } from '@/sync/migration-queries';

export const objectiveTable = pgTable(tableNames.objective, {
  id: varchar({ length: 32 }).primaryKey(),
  title: varchar({ length: 256 }).notNull(),
  description: varchar({ length: 256 }),
  createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
});

export const keyResultTable = pgTable(tableNames.keyResult, {
  id: varchar({ length: 32 }).primaryKey(),
  objectiveId: varchar({ length: 32 }).notNull(),
  title: varchar({ length: 256 }).notNull(),
  target: integer().notNull(),
  current: integer().default(0).notNull(),
  metrics: varchar({ length: 256 }).notNull(),
  createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
});

export const entityEnum = pgEnum('entity', ['OBJECTIVE', 'KEY_RESULT']);
export const actionEnum = pgEnum('action', ['CREATE', 'UPDATE_PROGRESS']);

export const transactionTable = pgTable(tableNames.transaction, {
  id: varchar({ length: 32 }).primaryKey(),
  entity: entityEnum().notNull(),
  action: actionEnum().notNull(),
  payloadString: text().notNull(),
  clientId: varchar({ length: 32 }).notNull(),
  sessionId: varchar({ length: 32 }).notNull(),
  createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  serverSyncStatus: varchar({ length: 32 }).notNull(),
});

export const syncTable = pgTable(tableNames.sync, {
  id: varchar().primaryKey(),
  lastSync: timestamp({ precision: 6, withTimezone: true }).notNull(),
});
