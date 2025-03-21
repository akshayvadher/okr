import { Objective, ServerObjective } from '@/types';
import { TransactionEnriched } from '@/sync/transaction';
import { p } from '@/sync/date/format';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api/v1';

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

const serverToDtoMapping = (o: ServerObjective) => {
  return {
    ...o,
    createdAt: p(o.createdAt),
    updatedAt: p(o.updatedAt),
    keyResults: o.keyResults?.map((k) => {
      return {
        ...k,
        createdAt: p(k.createdAt),
        updatedAt: p(k.updatedAt),
      };
    }),
  } as Objective;
};

export const api = {
  getObjectives: () =>
    fetchWithError<ServerObjective[]>(`${API_BASE_URL}/objectives/`).then(
      (response: ServerObjective[]) => response.map(serverToDtoMapping),
    ),

  addTransaction: (data: TransactionEnriched) =>
    fetchWithError<TransactionEnriched>(`${API_BASE_URL}/transactions/`, {
      method: 'POST',
      body: JSON.stringify({ ...data, payload: JSON.stringify(data.payload) }),
    }),

  deleteAll: async () => {
    await fetchWithError(`${API_BASE_URL}/delete-all`, { method: 'DELETE' });
  },
};
