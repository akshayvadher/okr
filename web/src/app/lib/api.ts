import {
  CreateKeyResultRequest,
  CreateObjectiveRequest,
  Objective,
  UpdateProgressRequest
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function fetchWithError<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Objectives
  getObjectives: () =>
      fetchWithError<Objective[]>(`${API_BASE_URL}/objectives/`),

  getObjective: (id: string) =>
      fetchWithError<Objective>(`${API_BASE_URL}/objectives/${id}`),

  getObjectiveDetails: (id: string) =>
      fetchWithError<Objective>(`${API_BASE_URL}/objectives/${id}/details`),

  createObjective: (data: CreateObjectiveRequest) =>
      fetchWithError<Objective>(`${API_BASE_URL}/objectives/`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

  // Key Results
  createKeyResult: (objectiveId: string, data: CreateKeyResultRequest) =>
      fetchWithError<Objective>(`${API_BASE_URL}/objectives/${objectiveId}/key-results`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

  updateKeyResultProgress: (keyResultId: string, data: UpdateProgressRequest) =>
      fetchWithError<Objective>(`${API_BASE_URL}/key-results/${keyResultId}/progress`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
};

// Utility to calculate objective progress and status
export function calculateObjectiveStatus(objective: Objective): {
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind';
} {
  if (!objective.key_results || objective.key_results.length === 0) {
    return { progress: 0, status: 'on-track' };
  }

  const totalProgress = objective.key_results.reduce((sum, kr) => {
    return sum + (kr.current / kr.target) * 100;
  }, 0);

  const averageProgress = totalProgress / objective.key_results.length;

  // Calculate days elapsed percentage
  // const startDate = new Date(objective.start_date);
  // const endDate = new Date(objective.end_date);
  // const today = new Date();

  // const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  // const elapsedDays = Math.max(0, (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  // const timeElapsedPercent = Math.min(100, (elapsedDays / totalDays) * 100);

  // Determine status based on progress vs time elapsed
  const status: 'on-track' | 'at-risk' | 'behind' = 'behind';

  // if (averageProgress < timeElapsedPercent - 20) {
  //   status_ = 'behind';
  // } else if (averageProgress < timeElapsedPercent - 10) {
  //   status_ = 'at-risk';
  // }

  return {
    progress: Math.round(averageProgress * 10) / 10, // Round to 1 decimal place
    status,
  };
}
