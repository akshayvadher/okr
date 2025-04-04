export interface CommentModel {
  id: string;
  content: string;
  createdAt: Date;
  objectiveId: string;
  keyResultId?: string | null;
}

export interface ObjectiveModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description?: string | null;
}

export interface KeyResultModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  objectiveId: string;
  title: string;
  target: number;
  current: number;
  metrics: string;
}
