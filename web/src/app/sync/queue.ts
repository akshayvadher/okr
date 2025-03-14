import { atom, useAtom } from 'jotai';
import { Transaction, TransactionEnriched } from '@/sync/transaction';
import {nanoid} from "nanoid";

// Define the queue item type
interface QueueItem {
  id: string;
  transaction: TransactionEnriched;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
}

// Create the queue atom
const queueAtom = atom<QueueItem[]>([]);

// Derived atom for pending items
const pendingItemsAtom = atom((get) => {
  const queue = get(queueAtom);
  return queue.filter((item) => item.status === 'pending');
});

// Actions to manipulate the queue
export const useQueueActions = () => {
  const [queue, setQueue] = useAtom(queueAtom);

  // Add an item to the queue
  const enqueue = (transaction: Transaction) => {
    const newItem: QueueItem = {
      id: nanoid(),
      transaction: {
        ...transaction,
        id: nanoid(),
        created_at: new Date().toISOString(),
      },
      status: 'pending',
      createdAt: new Date(),
    };

    setQueue((currentQueue) => [...currentQueue, newItem]);
    return newItem.id;
  };

  // Get the next pending item without removing it
  const peek = () => {
    return queue.find((item) => item.status === 'pending');
  };

  // Mark an item as processing
  const markAsProcessing = (id: string) => {
    setQueue((currentQueue) =>
      currentQueue.map((item) =>
        item.id === id ? { ...item, status: 'processing' } : item,
      ),
    );
  };

  // Complete an item
  const complete = (id: string) => {
    setQueue((currentQueue) =>
      currentQueue.map((item) =>
        item.id === id
          ? { ...item, status: 'completed', processedAt: new Date() }
          : item,
      ),
    );
  };

  // Mark an item as failed
  const fail = (id: string, error?: string) => {
    setQueue((currentQueue) =>
      currentQueue.map((item) =>
        item.id === id
          ? { ...item, status: 'failed', error, processedAt: new Date() }
          : item,
      ),
    );
  };

  // Remove an item from the queue
  const remove = (id: string) => {
    setQueue((currentQueue) => currentQueue.filter((item) => item.id !== id));
  };

  // Clear completed and failed items
  const cleanup = () => {
    setQueue((currentQueue) =>
      currentQueue.filter(
        (item) => item.status !== 'completed' && item.status !== 'failed',
      ),
    );
  };

  // Clear the entire queue
  const clear = () => {
    setQueue([]);
  };

  return {
    queue,
    enqueue,
    peek,
    markAsProcessing,
    complete,
    fail,
    remove,
    cleanup,
    clear,
  };
};

// Hook to use for adding items to the queue (Producer component)
export const useQueueProducer = () => {
  const { enqueue } = useQueueActions();
  return { enqueue };
};

// Hook for consuming the queue (Consumer component or service)
export const useQueueConsumer = () => {
  const [pendingItems] = useAtom(pendingItemsAtom);
  const { markAsProcessing, complete, fail, remove } = useQueueActions();

  return {
    pendingItems,
    markAsProcessing,
    complete,
    fail,
    remove,
  };
};

// Hook for monitoring the queue state
export const useQueueMonitor = () => {
  const [queue] = useAtom(queueAtom);

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
};
