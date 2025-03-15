import { atom, useAtomValue, useSetAtom } from 'jotai';

const debugMode = atom(false);
const toggleAtom = atom(null, (get, set) => {
  const currentValue = get(debugMode);
  set(debugMode, !currentValue);
});

export const useIsDebugModeOn = () => useAtomValue(debugMode);
export const useToggleDebugMode = () => useSetAtom(toggleAtom);
