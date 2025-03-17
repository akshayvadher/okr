import { atom, useAtomValue, useSetAtom } from 'jotai';

const lastSyncAtom = atom<Date>();

export const useLastSync = () => useAtomValue(lastSyncAtom);
export const useSetLastSyncMemory = () =>
  useSetAtom(atom(null, (get, set, date: Date) => set(lastSyncAtom, date)));
