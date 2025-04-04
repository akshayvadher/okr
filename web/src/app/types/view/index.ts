import { CommentModel, KeyResultModel, ObjectiveModel } from '../model';

export interface ObjectiveView extends ObjectiveModel {
  keyResults: KeyResultModel[];
  comments: CommentModel[];
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind';
}
