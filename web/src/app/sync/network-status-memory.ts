import { atom, useAtomValue, useSetAtom } from 'jotai';

type NetworkStatus = {
  status: 'checking' | 'connected' | 'not-connected';
  error?: string;
};

const networkStatus = atom<NetworkStatus>({
  status: 'checking',
  error: undefined,
});

export const useNetworkStatus = () => useAtomValue(networkStatus);

const registerNetworkOnline = atom(null, (_get, set) =>
  set(networkStatus, {
    status: 'connected',
    error: undefined,
  }),
);
export const useRegisterNetworkOnline = () => useSetAtom(registerNetworkOnline);

const registerNetworkOffline = atom(null, (_get, set, error: string) =>
  set(networkStatus, {
    status: 'not-connected',
    error,
  }),
);
export const useRegisterNetworkOffline = () =>
  useSetAtom(registerNetworkOffline);
