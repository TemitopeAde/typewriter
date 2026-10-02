import { app } from '@wix/astro/builders';
import typewriterText from './extensions/site/widgets/typewriter-text/typewriter-text.extension.ts';

import typewriterText1 from './extensions/site/components/typewriter-text/typewriter-text.extension.ts';

export default app()
  .use(typewriterText).use(typewriterText1);
