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
}

export interface Objective extends Base {
  title: string;
  description: string;
  // start_date: string;
  // end_date: string;
  key_results?: KeyResult[];
}

export interface CreateObjectiveRequest {
  title: string;
  description: string;
  // start_date: string;
  // end_date: string;
}

export interface CreateKeyResultRequest {
  title: string;
  target: number;
}

export interface UpdateProgressRequest {
  progress: number;
}

export interface ObjectiveWithProgress extends Objective {
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind';
}
