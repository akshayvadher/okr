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

export interface CreateCommentRequest {
  content: string;
  objectiveId: string;
  keyResultId?: string;
}

export interface UpdateObjectiveRequest {
  id: string;
  title?: string;
  description?: string;
}
