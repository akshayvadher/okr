import {
  Objective,
  CreateObjectiveRequest,
  CreateKeyResultRequest,
  UpdateProgressRequest,
} from '@/types';
import { TransactionEnriched } from '@/sync/transaction';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function fetchWithError<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
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
    fetchWithError<Objective>(
      `${API_BASE_URL}/objectives/${objectiveId}/key-results`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    ),

  updateKeyResultProgress: (keyResultId: string, data: UpdateProgressRequest) =>
    fetchWithError<Objective>(
      `${API_BASE_URL}/key-results/${keyResultId}/progress`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    ),

  // Transactions
  addTransaction: (data: TransactionEnriched) =>
    fetchWithError<TransactionEnriched>(`${API_BASE_URL}/transactions/`, {
      method: 'POST',
      body: JSON.stringify({ ...data, payload: JSON.stringify(data.payload) }),
    }),
};

// Utility to calculate objective progress and status
export function calculateObjectiveStatus(objective: Objective): {
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind';
} {
  if (!objective.key_results || objective.key_results.length === 0) {
    return { progress: 0, status: 'at-risk' };
  }

  const totalProgress = objective.key_results.reduce((sum, kr) => {
    return sum + (kr.current / kr.target) * 100;
  }, 0);

  const averageProgress = totalProgress / objective.key_results.length;

  // Determine status based on progress percentage
  let status: 'on-track' | 'at-risk' | 'behind' = 'on-track';

  if (averageProgress < 40) {
    status = 'behind';
  } else if (averageProgress < 70) {
    status = 'at-risk';
  }

  return {
    progress: Math.round(averageProgress * 10) / 10, // Round to 1 decimal place
    status,
  };
}
