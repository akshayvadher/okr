export interface CommentModal {
  id: string;
  content: string;
  createdAt: Date;
  objectiveId: string;
  keyResultId?: string | null;
}
