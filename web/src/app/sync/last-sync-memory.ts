import { atom, useAtomValue, useSetAtom } from 'jotai';

const lastSyncAtom = atom<string>();

export const useLastSync = () => useAtomValue(lastSyncAtom);
export const useSetLastSyncMemory = () => useSetAtom(lastSyncAtom);
