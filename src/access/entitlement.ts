export type AccessStatus = 'pro' | 'trial' | 'blocked';

export interface AppAccess {
  status: AccessStatus;
  instanceId: string;
  serverTime: string;
  freeTrialAvailable: boolean;
  trialExpiresAt?: string;
}

export interface BillingInstance {
  isFree?: boolean;
  freeTrialAvailable?: boolean;
  billing?: {
    packageName?: string;
    timeStamp?: string;
    freeTrialInfo?: { status?: string };
  };
}

export const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

export function evaluateEntitlement(instance: BillingInstance | undefined, now: number): {
  status: AccessStatus;
  trialExpiresAt?: string;
} {
  if (instance?.isFree !== false || !instance.billing?.packageName?.trim()) {
    return { status: 'blocked' };
  }
  const trialStatus = instance.billing.freeTrialInfo?.status;
  if (trialStatus === 'IN_PROGRESS') {
    const start = Date.parse(instance.billing.timeStamp ?? '');
    if (!Number.isFinite(start) || start > now) return { status: 'blocked' };
    const expires = start + TRIAL_DURATION_MS;
    if (now >= expires) return { status: 'blocked' };
    return { status: 'trial', trialExpiresAt: new Date(expires).toISOString() };
  }
  if (trialStatus !== undefined && trialStatus !== 'ENDED' && trialStatus !== 'NOT_AVAILABLE') {
    return { status: 'blocked' };
  }
  return { status: 'pro' };
}

export function parseAppAccess(value: unknown): AppAccess {
  if (typeof value !== 'object' || value === null) throw new Error('Invalid access response');
  const data = value as Record<string, unknown>;
  if (
    !['pro', 'trial', 'blocked'].includes(String(data.status)) ||
    typeof data.instanceId !== 'string' || !data.instanceId ||
    typeof data.serverTime !== 'string' || !Number.isFinite(Date.parse(data.serverTime))
  ) throw new Error('Invalid access response');
  const status = data.status as AccessStatus;
  if (status === 'trial' && (
    typeof data.trialExpiresAt !== 'string' ||
    !Number.isFinite(Date.parse(data.trialExpiresAt)) ||
    Date.parse(data.trialExpiresAt) <= Date.parse(data.serverTime)
  )) throw new Error('Invalid trial expiration');
  return {
    status,
    instanceId: data.instanceId,
    serverTime: data.serverTime,
    freeTrialAvailable: data.freeTrialAvailable === true,
    ...(status === 'trial' && typeof data.trialExpiresAt === 'string'
      ? { trialExpiresAt: data.trialExpiresAt } : {}),
  };
}
