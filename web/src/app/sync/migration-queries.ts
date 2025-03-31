import { md5 } from '@/lib/hash';

export const queries = {
  objective: `(
          id           varchar(32) PRIMARY KEY,
          title        varchar(256),
          description  varchar(256),
          created_at   timestamp (6) with time zone,
          updated_at   timestamp (6) with time zone
      )`,
  keyResult: `(
          id            varchar(32) PRIMARY KEY,
          objective_id  varchar(32),
          title         varchar(256),
          target        INTEGER,
          current       INTEGER,
          metrics       varchar(256),
          created_at    timestamp (6) with time zone,
          updated_at    timestamp (6) with time zone
      )`,
  transaction: `(
          id                      varchar(32) PRIMARY KEY,
          entity                  varchar(32),
          action                  varchar(32),
          payload_string          text,
          client_id               varchar(32),
          session_id              varchar(32),
          objective_id            varchar(32),
          created_at              timestamp (6) with time zone,
          server_sync_status      varchar(32)
      )`,
  sync: `(
          id          varchar(10) PRIMARY KEY,
          last_sync   text
      )`,
};

// Because with every change of table structure, we need to update the change
// there is no way to upgrade, so we are creating a new table altogether
// with difference name (hash changes if the query changes)
export const tableNames = {
  objective: 'objective_' + md5(queries.objective),
  keyResult: 'key_result_' + md5(queries.keyResult),
  transaction: 'transaction_' + md5(queries.transaction),
  sync: 'sync_' + md5(queries.sync),
};
