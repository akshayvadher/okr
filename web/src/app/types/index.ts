export interface Base {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface KeyResult extends Base {
  objective_id: string;
  title: string;
  target: number;
  current: number;
  metrics: string;
}

export interface Objective extends Base {
  title: string;
  description: string;
  key_results: KeyResult[];
}

export interface CreateObjectiveRequest {
  title: string;
  description: string;
}

export interface CreateKeyResultRequest {
  title: string;
  target: number;
  metrics: string;
}

export interface CreateKeyResultRequestWithObjective
  extends CreateKeyResultRequest {
  objective_id: string;
}

export interface UpdateProgressRequest {
  progress: number;
}

export interface UpdateProgressRequestWithKeyResult
  extends UpdateProgressRequest {
  keyResultId: string;
  objective_id: string;
}

export interface ObjectiveWithProgress extends Objective {
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind';
}
