import { evaluateEntitlement, type BillingInstance } from './entitlement.ts';

interface Dependencies {
  getTokenInfo: () => Promise<{ active: boolean; instanceId?: string }>;
  getInstance: () => Promise<{ instance?: BillingInstance & { instanceId?: string } }>;
}

const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };

export async function handleAppAccess(deps: Dependencies): Promise<Response> {
  let instanceId: string;
  try {
    const token = await deps.getTokenInfo();
    if (!token.active || !token.instanceId) {
      return Response.json({ error: 'Authentication required' }, { status: 401, headers });
    }
    instanceId = token.instanceId;
  } catch {
    return Response.json({ error: 'Authentication required' }, { status: 401, headers });
  }
  try {
    const { instance } = await deps.getInstance();
    if (!instance || instance.instanceId !== instanceId) {
      throw new Error('App instance does not match the authenticated installation');
    }
    const now = Date.now();
    return Response.json({
      ...evaluateEntitlement(instance, now),
      instanceId,
      serverTime: new Date(now).toISOString(),
    }, { headers });
  } catch (error) {
    console.error('Failed to verify app access:', error);
    return Response.json({ error: 'Unable to verify app access' }, { status: 503, headers });
  }
}
