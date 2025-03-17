import { atom, useAtomValue } from 'jotai';
import { ulid } from 'ulid';

const clientAtom = atom({
  clientAppStartTime: new Date(),
  clientId: ulid(),
});

export const useClientMetadata = () => useAtomValue(clientAtom);
