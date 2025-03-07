import {PGlite} from "@electric-sql/pglite";
import {useEffect, useState} from "react";

// Create a singleton instance outside of the hook
let pgLiteInstance: PGlite;

export const usePgLocal = () => {
  const [db, setDb] = useState<PGlite>(pgLiteInstance);
  useEffect(() => {
    if (!pgLiteInstance) {
      pgLiteInstance = new PGlite('idb://okr-sandbox')
    }
    setDb(pgLiteInstance)
  }, []);

  return {db}
}
