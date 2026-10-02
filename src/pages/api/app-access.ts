import type { APIRoute } from 'astro';
import { auth } from '@wix/essentials';
import { appInstances } from '@wix/app-management';
import { handleAppAccess } from '../../access/access-handler';

export const GET: APIRoute = () => handleAppAccess({
  getTokenInfo: () => auth.getTokenInfo(),
  getInstance: () => auth.elevate(appInstances.getAppInstance)(),
});
