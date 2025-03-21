export interface Base {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServerBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface KeyResultOnly {
  objectiveId: string;
  title: string;
  target: number;
  current: number;
  metrics: string;
}

export interface KeyResult extends KeyResultOnly, Base {}

export interface ServerKeyResult extends KeyResultOnly, ServerBase {}

export interface ObjectiveOnly {
  title: string;
  description?: string | null;
}

export interface Objective extends ObjectiveOnly, Base {
  keyResults?: KeyResult[];
}

export interface ServerObjective extends ObjectiveOnly, ServerBase {
  keyResults: ServerKeyResult[];
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
