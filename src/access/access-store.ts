import { parseAppAccess, type AppAccess } from './entitlement.ts';

export interface AccessState {
  status: AppAccess['status'] | 'loading' | 'error';
  instanceId?: string;
  trialExpiresAt?: string;
  freeTrialAvailable?: boolean;
}

export const INITIAL_ACCESS: AccessState = { status: 'loading' };
export const ACCESS_REFRESH_MS = 60_000;

export function createAccessStore(fetchAccess: () => Promise<unknown>) {
  let state: AccessState = INITIAL_ACCESS;
  let deadline: number | undefined;
  let polling: ReturnType<typeof setTimeout> | undefined;
  let expiration: ReturnType<typeof setTimeout> | undefined;
  let pending: Promise<void> | undefined;
  let generation = 0;
  const listeners = new Set<(value: AccessState) => void>();

  const publish = (next: AccessState) => {
    state = next;
    listeners.forEach((listener) => listener(state));
  };

  const canAccess = () => state.status === 'pro' || (
    state.status === 'trial' && deadline !== undefined && Date.now() < deadline
  );

  const refresh = (): Promise<void> => {
    if (pending) return pending;
    const currentGeneration = generation;
    const requestedAt = Date.now();
    clearTimeout(polling);
    const request = async () => {
      try {
        const result = parseAppAccess(await fetchAccess());
        if (currentGeneration !== generation) return;
        clearTimeout(expiration);
        deadline = result.status === 'trial' && result.trialExpiresAt
          ? requestedAt + Date.parse(result.trialExpiresAt) - Date.parse(result.serverTime)
          : undefined;
        // Account for server/client clock skew and conservatively include request latency.
        if (deadline !== undefined && deadline <= Date.now()) {
          publish({ status: 'blocked', instanceId: result.instanceId, freeTrialAvailable: result.freeTrialAvailable });
        } else {
          publish({
            status: result.status,
            instanceId: result.instanceId,
            freeTrialAvailable: result.freeTrialAvailable,
            ...(result.trialExpiresAt ? { trialExpiresAt: result.trialExpiresAt } : {}),
          });
          if (deadline !== undefined) {
            expiration = setTimeout(() => {
              publish({ status: 'loading', instanceId: state.instanceId });
              void refresh();
            }, deadline - Date.now());
          }
        }
      } catch (error) {
        if (currentGeneration !== generation) return;
        console.error('Failed to check app access:', error);
        deadline = undefined;
        clearTimeout(expiration);
        publish({ status: 'error', ...(state.instanceId ? { instanceId: state.instanceId } : {}) });
      } finally {
        if (currentGeneration === generation) {
          pending = undefined;
          if (listeners.size) polling = setTimeout(() => void refresh(), ACCESS_REFRESH_MS);
        }
      }
    };
    pending = request();
    return pending;
  };

  const subscribe = (listener: (value: AccessState) => void) => {
    listeners.add(listener);
    listener(state);
    if (listeners.size === 1) void refresh();
    return () => {
      listeners.delete(listener);
      if (!listeners.size) {
        generation += 1;
        clearTimeout(polling);
        clearTimeout(expiration);
        pending = undefined;
        deadline = undefined;
        state = INITIAL_ACCESS;
      }
    };
  };

  return { subscribe, refresh, canAccess };
}
