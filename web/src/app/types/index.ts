export interface Base {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyResult extends Base {
  objectiveId: string;
  title: string;
  target: number;
  current: number;
  metrics: string;
}

export interface Objective extends Base {
  title: string;
  description?: string| null;
  keyResults?: KeyResult[];
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
  objectiveId: string;
}

export interface UpdateProgressRequest {
  progress: number;
}

export interface UpdateProgressRequestWithKeyResult
  extends UpdateProgressRequest {
  keyResultId: string;
  objectiveId: string;
}

export interface ObjectiveWithProgress extends Objective {
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind';
}
