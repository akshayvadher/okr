import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Transaction, TransactionEnriched } from '@/sync/transaction';
import { ulid } from 'ulid';

interface QueueItem {
  id: string;
  transaction: TransactionEnriched;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
}

const queueAtom = atom<QueueItem[]>([]);

const peekPendingItemAtom = atom((get) =>
  get(queueAtom)
    .filter((item) => item.status == 'pending')
    .at(0),
);

const peekProcessingItemAtom = atom((get) =>
  get(queueAtom)
    .filter((item) => item.status == 'processing')
    .at(0),
);

const pendingOrProcessingItemsAtom = atom((get) => {
  const queue = get(queueAtom);
  return queue.filter(
    (item) => item.status === 'pending' || item.status === 'processing',
  );
});

const peekPendingOrProcessingItemAtom = atom<QueueItem | undefined>((get) =>
  get(pendingOrProcessingItemsAtom).at(0),
);

export const usePeekPendingOrProcessingItem = () =>
  useAtomValue(peekPendingOrProcessingItemAtom);

const enqueuePendingAtom = atom(null, (_get, set, transaction: Transaction) => {
  const newItem: QueueItem = {
    id: ulid(),
    transaction: {
      ...transaction,
      id: ulid(),
      createdAt: new Date(),
    },
    status: 'pending',
    createdAt: new Date(),
  };
  set(queueAtom, (prev) => [...prev, newItem]);
});

export const useEnqueue = () => useSetAtom(enqueuePendingAtom);

const markFirstProcessing = atom(null, (get, set) => {
  const firstPendingItem = get(peekPendingItemAtom);
  if (!firstPendingItem) {
    return;
  }
  set(queueAtom, (prev) =>
    prev.map((item) =>
      item.id === firstPendingItem.id
        ? {
            ...item,
            status: 'processing',
          }
        : item,
    ),
  );
});
export const useMarkFirstProcessing = () => useSetAtom(markFirstProcessing);

const markFirstComplete = atom(null, (get, set) => {
  const firstProcessingItem = get(peekProcessingItemAtom);
  if (!firstProcessingItem) {
    return;
  }
  set(queueAtom, (prev) =>
    prev.map((item) =>
      item.id === firstProcessingItem.id
        ? {
            ...item,
            status: 'completed',
          }
        : item,
    ),
  );
});
export const useMarkFirstComplete = () => useSetAtom(markFirstComplete);

const markFirstFailed = atom(null, (get, set) => {
  const firstProcessingItem = get(peekProcessingItemAtom);
  if (!firstProcessingItem) {
    return;
  }
  set(queueAtom, (prev) =>
    prev.map((item) =>
      item.id === firstProcessingItem.id
        ? {
            ...item,
            status: 'failed',
          }
        : item,
    ),
  );
});
export const useMarkFirstFailed = () => useSetAtom(markFirstFailed);

const queueStatusAtom = atom((get) => {
  const queue = get(queueAtom);

  const stats = {
    total: queue.length,
    pending: queue.filter((item) => item.status === 'pending').length,
    processing: queue.filter((item) => item.status === 'processing').length,
    completed: queue.filter((item) => item.status === 'completed').length,
    failed: queue.filter((item) => item.status === 'failed').length,
  };

  return {
    queue,
    stats,
  };
});

export const useQueueStats = () => useAtomValue(queueStatusAtom);
