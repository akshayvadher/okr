import { atom, useAtomValue, useSetAtom } from 'jotai';

type NetworkStatus = {
  connected: boolean;
  error?: string;
};

const networkStatus = atom<NetworkStatus>({
  connected: true,
  error: undefined,
});

export const useNetworkStatus = () => useAtomValue(networkStatus);

export const useRegisterNetworkOnline = () =>
  useSetAtom(
    atom(null, (_get, set) =>
      set(networkStatus, {
        connected: true,
        error: undefined,
      }),
    ),
  );

export const useRegisterNetworkOffline = () =>
  useSetAtom(
    atom(null, (_get, set, error: string) =>
      set(networkStatus, {
        connected: false,
        error,
      }),
    ),
  );
