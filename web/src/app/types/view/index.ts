import { CommentModel, KeyResultModel, ObjectiveModel, TaskModel } from '../model';

export interface ObjectiveView extends ObjectiveModel {
  keyResults: KeyResultModel[];
  comments: CommentModel[];
  tasks: TaskModel[];
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind';
}
