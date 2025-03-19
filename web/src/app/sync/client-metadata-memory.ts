import { atom, useAtomValue } from 'jotai';
import { ulid } from 'ulid';
import { atomWithStorage } from 'jotai/utils';

const sessionAtom = atom({
  clientAppStartTime: new Date(),
  sessionId: ulid(),
});

const getOrCreateClientId = () => {
  if (typeof window === 'undefined') return ulid();

  const storedId = window.localStorage.getItem('okr-client');
  if (storedId) return storedId;

  const newId = ulid();
  window.localStorage.setItem('okr-client', newId);
  return newId;
};

const clientAtom = atomWithStorage('okr-client', {
  clientId: getOrCreateClientId(),
});

const combinedIdentity = atom((get) => ({
  ...get(sessionAtom),
  ...get(clientAtom),
}));

export const useClientMetadata = () => useAtomValue(combinedIdentity);
