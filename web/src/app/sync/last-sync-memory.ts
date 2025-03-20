import { atom, useAtomValue, useSetAtom } from 'jotai';

const lastSyncAtom = atom<Date>();

export const useLastSync = () => useAtomValue(lastSyncAtom);
export const useSetLastSyncMemory = () => useSetAtom(lastSyncAtom);
