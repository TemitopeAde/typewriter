// The access endpoint answers "pro", so no upgrade notice covers the UI in the shots.
export const httpClient = {
  fetchWithAuth: async () =>
    new Response(JSON.stringify({ status: 'pro', instanceId: 'demo', serverTime: new Date().toISOString(), freeTrialAvailable: false })),
};
