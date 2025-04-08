export type TaskStatus = 'todo' | 'doing' | 'done' | 'cancelled';

export interface CommentModel {
  id: string;
  content: string;
  createdAt: Date;
  objectiveId: string;
  keyResultId?: string | null;
}

export interface TaskModel {
  id: string;
  title: string;
  status: TaskStatus;
  objectiveId: string;
  keyResultId?: string | null;
  createdAt: Date;
  updatedAt: Date;
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
