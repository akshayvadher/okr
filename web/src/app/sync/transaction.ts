import {
  CreateKeyResultRequestWithObjective,
  CreateObjectiveRequest,
  UpdateProgressRequestWithKeyResult
} from "@/types";

export interface Transaction {
  entity: 'OBJECTIVE' | 'KEY_RESULT';
  action: 'CREATE' | 'UPDATE_PROGRESS';
  payload: CreateObjectiveRequest | CreateKeyResultRequestWithObjective | UpdateProgressRequestWithKeyResult;
}
