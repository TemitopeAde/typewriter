import { app } from '@wix/astro/builders';
import typewriterText from './extensions/site/widgets/typewriter-text/typewriter-text.extension.ts';

import typewriterText1 from './extensions/site/components/typewriter-text/typewriter-text.extension.ts';

import typewriterTools from './extensions/backend/app-tools/typewriter-tools/typewriter-tools.extension.ts';

import typewriterProvider from './extensions/backend/service-plugins/typewriter-provider/typewriter-provider.extension.ts';

import appInstalled from './extensions/backend/events/app-installed/app-installed.extension.ts';

import paidPlanPurchased from './extensions/backend/events/paid-plan-purchased/paid-plan-purchased.extension.ts';

import paidPlanChanged from './extensions/backend/events/paid-plan-changed/paid-plan-changed.extension.ts';

import dataCollections from './extensions/backend/data-collections/data-collections.extension.ts';

export default app()
  .use(typewriterText).use(typewriterText1).use(typewriterTools).use(typewriterProvider).use(appInstalled).use(paidPlanPurchased).use(paidPlanChanged).use(dataCollections);
