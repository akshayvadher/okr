import { TransactionEnriched } from '@/sync/transaction';
import { ObjectiveDto } from '@/types/dto';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'THROW_ERROR';

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
  getObjectives: () =>
    fetchWithError<ObjectiveDto[]>(`${API_BASE_URL}/objectives/`),

  addTransaction: (data: TransactionEnriched) =>
    fetchWithError<TransactionEnriched>(`${API_BASE_URL}/transactions/`, {
      method: 'POST',
      body: JSON.stringify({ ...data, payload: JSON.stringify(data.payload) }),
    }),

  deleteAll: async () => {
    await fetchWithError(`${API_BASE_URL}/delete-all`, { method: 'DELETE' });
  },
};
