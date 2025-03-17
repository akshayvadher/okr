import {useTransactionQueue} from "@/sync/useTransactionQueue";
import useServerTransactions from "@/sync/useServerTransactions";

const useSyncEngine = () => {
  useTransactionQueue();
  useServerTransactions();
}

export default useSyncEngine;
