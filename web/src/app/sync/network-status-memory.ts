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

const registerNetworkOnline = atom(null, (_get, set) =>
  set(networkStatus, {
    connected: true,
    error: undefined,
  }),
);
export const useRegisterNetworkOnline = () => useSetAtom(registerNetworkOnline);

const registerNetworkOffline = atom(null, (_get, set, error: string) =>
  set(networkStatus, {
    connected: false,
    error,
  }),
);
export const useRegisterNetworkOffline = () =>
  useSetAtom(registerNetworkOffline);
