import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateEntitlement, parseAppAccess, TRIAL_DURATION_MS } from '../src/access/entitlement.ts';
import { handleAppAccess } from '../src/access/access-handler.ts';
import { createAccessStore, ACCESS_REFRESH_MS } from '../src/access/access-store.ts';

const start = Date.parse('2026-10-02T12:00:00Z');
const paid = { isFree: false, billing: { packageName: 'pro' } };
const trial = {
  ...paid,
  billing: { ...paid.billing, timeStamp: new Date(start).toISOString(), freeTrialInfo: { status: 'IN_PROGRESS' } },
};
const response = (status, now, extra = {}) => ({
  status, instanceId: 'installation-a', serverTime: new Date(now).toISOString(), ...extra,
});
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

test('only a confirmed paid installation grants Pro access', () => {
  assert.equal(evaluateEntitlement(paid, start).status, 'pro');
  for (const instance of [undefined, {}, { isFree: true }, { ...paid, isFree: true }, { isFree: false },
    { isFree: false, freeTrialAvailable: true }, { isFree: false, billing: { packageName: '' } }]) {
    assert.equal(evaluateEntitlement(instance, start).status, 'blocked');
  }
});

test('three-day trial ends at the exact boundary; ended trial can convert to Pro', () => {
  assert.equal(evaluateEntitlement(trial, start).status, 'trial');
  assert.equal(evaluateEntitlement(trial, start + TRIAL_DURATION_MS - 1).status, 'trial');
  assert.equal(evaluateEntitlement(trial, start + TRIAL_DURATION_MS).status, 'blocked');
  assert.equal(evaluateEntitlement({ ...paid, billing: { ...paid.billing, freeTrialInfo: { status: 'ENDED' } } }, start).status, 'pro');
  assert.equal(evaluateEntitlement({ ...paid, isFree: true }, start).status, 'blocked');
});

test('invalid, future or missing trial dates and unknown statuses cannot unlock access', () => {
  for (const timeStamp of [undefined, '', 'invalid', new Date(start + 1000).toISOString()]) {
    assert.equal(evaluateEntitlement({ ...trial, billing: { ...trial.billing, timeStamp } }, start).status, 'blocked');
  }
  assert.equal(evaluateEntitlement({ ...paid, billing: { ...paid.billing, freeTrialInfo: { status: 'UNKNOWN' } } }, start).status, 'blocked');
});

test('cancellation preserves paid access until Wix removes entitlement', () => {
  assert.equal(evaluateEntitlement({ ...paid, billing: { ...paid.billing, autoRenewing: false } }, start).status, 'pro');
  assert.equal(evaluateEntitlement({ ...paid, isFree: true }, start).status, 'blocked');
});

test('response validation rejects malformed or already-expired trial grants', () => {
  for (const value of [null, {}, response('unlocked', start), response('pro', start, { instanceId: '' }),
    response('trial', start), response('trial', start, { trialExpiresAt: new Date(start).toISOString() })]) {
    assert.throws(() => parseAppAccess(value));
  }
  assert.equal(parseAppAccess(response('pro', start, { ownerInfo: 'private' })).ownerInfo, undefined);
});

test('unauthenticated requests never call the elevated billing method', async () => {
  for (const token of [{ active: false, instanceId: 'installation-a' }, { active: true }]) {
    let calls = 0;
    const result = await handleAppAccess({ getTokenInfo: async () => token, getInstance: async () => { calls++; return {}; } });
    assert.equal(result.status, 401);
    assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.equal(calls, 0);
  }
});

test('backend returns only installation entitlement, with no billing or owner fields', async () => {
  const result = await handleAppAccess({
    getTokenInfo: async () => ({ active: true, instanceId: 'installation-a' }),
    getInstance: async () => ({ instance: { ...paid, instanceId: 'installation-a' }, site: { ownerInfo: 'private' } }),
  });
  assert.equal(result.status, 200);
  assert.deepEqual(Object.keys(await result.json()).sort(), ['instanceId', 'serverTime', 'status']);
});

test('billing failures and mismatched installations return errors without granting access', async (t) => {
  t.mock.method(console, 'error', () => {});
  for (const getInstance of [async () => { throw new Error('Permission denied'); },
    async () => ({ instance: { ...paid, instanceId: 'another-installation' } })]) {
    const result = await handleAppAccess({ getTokenInfo: async () => ({ active: true, instanceId: 'installation-a' }), getInstance });
    assert.equal(result.status, 503);
    assert.equal((await result.json()).status, undefined);
  }
});

test('multiple subscribers share checks, polling and explicit refresh requests', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: start });
  let calls = 0;
  const store = createAccessStore(async () => { calls++; return response('pro', Date.now()); });
  const stopA = store.subscribe(() => {});
  const stopB = store.subscribe(() => {});
  await flush();
  assert.equal(calls, 1);
  assert.equal(store.canAccess(), true);
  t.mock.timers.tick(ACCESS_REFRESH_MS);
  await flush();
  assert.equal(calls, 2);
  await Promise.all([store.refresh(), store.refresh()]);
  assert.equal(calls, 3);
  stopA(); stopB();
  t.mock.timers.tick(ACCESS_REFRESH_MS * 2);
  assert.equal(calls, 3);
  assert.equal(store.canAccess(), false);
});

test('trial deadline locks access before checking for conversion, despite browser clock skew', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: start - 10_000_000 });
  let calls = 0;
  let finish;
  const states = [];
  const store = createAccessStore(() => {
    calls++;
    return calls === 1
      ? Promise.resolve(response('trial', start, { trialExpiresAt: new Date(start + 1000).toISOString() }))
      : new Promise((resolve) => { finish = resolve; });
  });
  const stop = store.subscribe((state) => states.push(state.status));
  await flush();
  assert.equal(store.canAccess(), true);
  t.mock.timers.tick(999);
  assert.equal(store.canAccess(), true);
  t.mock.timers.tick(1);
  assert.equal(store.canAccess(), false);
  assert.equal(states.at(-1), 'loading');
  finish(response('pro', start + 1000));
  await flush();
  assert.equal(store.canAccess(), true);
  assert.equal(states.at(-1), 'pro');
  stop();
});

test('an expired trial stays blocked after Wix revalidation', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: start });
  let calls = 0;
  const store = createAccessStore(async () => ++calls === 1
    ? response('trial', start, { trialExpiresAt: new Date(start + 1000).toISOString() })
    : response('blocked', Date.now()));
  const stop = store.subscribe(() => {});
  await flush();
  t.mock.timers.tick(1000);
  await flush();
  assert.equal(store.canAccess(), false);
  assert.equal(calls, 2);
  stop();
});

test('failed checks revoke access and retry restores it', async (t) => {
  t.mock.method(console, 'error', () => {});
  let fail = false;
  const states = [];
  const store = createAccessStore(async () => {
    if (fail) throw new Error('Network unavailable');
    return response('pro', Date.now());
  });
  const stop = store.subscribe((state) => states.push(state.status));
  await flush();
  fail = true;
  await store.refresh();
  assert.equal(store.canAccess(), false);
  assert.equal(states.at(-1), 'error');
  fail = false;
  await store.refresh();
  assert.equal(store.canAccess(), true);
  stop();
});

test('responses arriving after unmount cannot unlock a new context', async () => {
  let finish;
  const store = createAccessStore(() => new Promise((resolve) => { finish = resolve; }));
  const stop = store.subscribe(() => {});
  stop();
  finish(response('pro', Date.now()));
  await flush();
  assert.equal(store.canAccess(), false);
});
