import {
  CreateKeyResultRequestWithObjective,
  CreateObjectiveRequest,
  UpdateProgressRequestWithKeyResult,
  CreateCommentRequest,
  UpdateObjectiveRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from '@/types/dto/request';
import { p } from '@/sync/date/format';

export type entity = 'OBJECTIVE' | 'KEY_RESULT' | 'COMMENT' | 'TASK';
export type action = 'CREATE' | 'UPDATE_PROGRESS' | 'UPDATE' | 'UPDATE_STATUS';

export interface Transaction {
  entity: entity;
  action: action;
  payload:
    | CreateObjectiveRequest
    | CreateKeyResultRequestWithObjective
    | UpdateProgressRequestWithKeyResult
    | CreateCommentRequest
    | UpdateObjectiveRequest
    | CreateTaskRequest
    | UpdateTaskRequest
    | UpdateTaskStatusRequest;
}

export interface TransactionEnriched extends Transaction {
  id: string;
  createdAt: Date;
  clientId?: string;
  sessionId?: string;
  objectiveId?: string;
}

export interface TransactionServer {
  id: string;
  createdAt: string;
  payload: string;
  entity: entity;
  action: action;
  serverCreatedAt: string;
  clientId: string;
  sessionId: string;
  objectiveId: string;
}

export const serverToDomain = (s: TransactionServer): TransactionEnriched => ({
  ...s,
  createdAt: p(s.createdAt),
  payload: JSON.parse(s.payload),
});
