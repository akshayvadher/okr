import {useQueueConsumer} from "@/sync/queue";
import {useEffect, useState} from "react";
import {Transaction} from "@/sync/transaction";
import {
  useAddKeyResult,
  useAddObjective,
  useUpdateKeyResultProgress
} from "@/sync/object-pool";
import {
  CreateKeyResultRequestWithObjective,
  CreateObjectiveRequest,
  UpdateProgressRequestWithKeyResult
} from "@/types";

export const TransactionQueueProcessor = () => {
  const {pendingItems, markAsProcessing, complete, fail} = useQueueConsumer();
  const [isProcessing, setIsProcessing] = useState(false);
  const addObjectiveLocal = useAddObjective();
  const addKeyResultLocal = useAddKeyResult();
  const updateKeyResultProgressLocal = useUpdateKeyResultProgress();

  const transactionLocalProcessor = async (transaction: Transaction) => {
    switch (transaction.entity) {
      case "OBJECTIVE":
        switch (transaction.action) {
          case "CREATE":
            const request = transaction.payload as CreateObjectiveRequest;
            addObjectiveLocal({
              ...request,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              key_results: [],
            });
            break;
          default:
            throw new Error(`Unknown action: ${transaction.action}`);
        }
        break;
      case "KEY_RESULT":
        switch (transaction.action) {
          case "CREATE": {
            const request = transaction.payload as CreateKeyResultRequestWithObjective;
            addKeyResultLocal({
              ...request,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              current: 0,
            })
            break;
          }
          case "UPDATE_PROGRESS": {
            const request = transaction.payload as UpdateProgressRequestWithKeyResult;
            updateKeyResultProgressLocal({
              id: request.keyResultId,
              progress: request.progress,
            })
            break;
          }
          default:
            throw new Error(`Unknown action: ${transaction.action}`);
        }
        break;
      default:
        throw new Error(`Unknown entity: ${transaction.entity}`);
    }
  }


  // Function to process a single item
  const processItem = async (id: string, transaction: Transaction) => {
    console.log(`Processing item: ${id} ${transaction}`);
    // Mark the item as being processed
    markAsProcessing(id);

    try {
      await transactionLocalProcessor(transaction)

      complete(id);
    } catch (error) {
      fail(id, "" + error);
    }
  };

  // Process the next item in the queue
  const processNext = async () => {
    if (pendingItems.length > 0 && !isProcessing) {
      setIsProcessing(true);
      const item = pendingItems[0];
      await processItem(item.id, item.transaction);
      setIsProcessing(false);
    }
  };

  // Auto-process the queue when enabled
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingItems.length > 0 && !isProcessing) {
        processNext();
      }
    }, 10);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pendingItems, isProcessing, processNext]);

  return null;
};
