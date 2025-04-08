interface Base {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ObjectiveDto extends Base {
  title: string;
  description?: string | null;
  keyResults: KeyResultDto[];
  comments: CommentDto[];
  tasks: TaskDto[];
}

export interface KeyResultDto extends Base {
  objectiveId: string;
  title: string;
  target: number;
  current: number;
  metrics: string;
}

export interface CommentDto {
  id: string;
  content: string;
  createdAt: string;
  objectiveId: string;
  keyResultId?: string;
}

export interface TaskDto {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  objectiveId: string;
  keyResultId?: string;
}
