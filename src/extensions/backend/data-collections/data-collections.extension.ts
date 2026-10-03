import { extensions } from '@wix/astro/builders'

import lifecycleEventsCollection from './lifecycle-events';

export default extensions.dataCollections({
  id: 'a130f336-c1e4-49d9-8095-37b427be13d4',
  name: 'Data Collections',
  collections: [lifecycleEventsCollection],
});
