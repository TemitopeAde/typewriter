import { app } from '@wix/astro/builders';
import myPage from './extensions/dashboard/pages/my-page/my-page.extension.ts';

import typewriterText from './extensions/site/widgets/typewriter-text/typewriter-text.extension.ts';

export default app()
  .use(myPage).use(typewriterText);
