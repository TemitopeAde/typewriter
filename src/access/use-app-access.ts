import { useEffect, useState } from 'react';
import { httpClient } from '@wix/essentials';
import { createAccessStore, INITIAL_ACCESS, type AccessState } from './access-store';

// Use the module's origin (the app server, not the host site). `new URL('<literal>', import.meta.url)`
// is avoided on purpose: Vite treats it as an asset import and rewrites it to /@fs/... in dev.
const endpointUrl = `${new URL(import.meta.url).origin}/api/app-access`;

const store = createAccessStore(async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await httpClient.fetchWithAuth(endpointUrl, {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Access verification failed (${response.status})`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
});

export function useAppAccess() {
  const [state, setState] = useState<AccessState>(INITIAL_ACCESS);
  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    const refresh = () => { void store.refresh(); };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      unsubscribe();
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return {
    ...state,
    allowed: state.status === 'pro' || state.status === 'trial',
    canAccess: store.canAccess,
    refresh: store.refresh,
  };
}
