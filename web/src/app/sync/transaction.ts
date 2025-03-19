import {
  CreateKeyResultRequestWithObjective,
  CreateObjectiveRequest,
  UpdateProgressRequestWithKeyResult,
} from '@/types';

export interface Transaction {
  entity: 'OBJECTIVE' | 'KEY_RESULT';
  action: 'CREATE' | 'UPDATE_PROGRESS';
  payload:
    | CreateObjectiveRequest
    | CreateKeyResultRequestWithObjective
    | UpdateProgressRequestWithKeyResult;
}

export interface TransactionEnriched extends Transaction {
  id: string;
  created_at: string;
  clientId?: string;
  sessionId?: string;
}

export interface TransactionServer {
  id: string;
  created_at: string;
  payload: string;
  entity: 'OBJECTIVE' | 'KEY_RESULT';
  action: 'CREATE' | 'UPDATE_PROGRESS';
  server_created_at: string;
  clientId: string;
  sessionId: string;
}
