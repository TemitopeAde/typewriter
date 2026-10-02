import { extensions } from '@wix/astro/builders'

export default extensions.customElement({
  id: '628a53d9-0d7e-4212-bdb5-8e847af9709e',
  name: 'Typewriter Text',
  width: {
    defaultWidth: 600,
    allowStretch: true
  },
  height: {
    defaultHeight: 120
  },
  installation: {
    autoAdd: false
  },
  presets: [
    {
      id: '9e659584-53b1-4f85-96b5-ab738367f872',
      name: 'default',
      thumbnailUrl: '{{BASE_URL}}/typewriter-text-thumbnail.png',
    },
  ],
  
  tagName: 'typewriter-text',
  element: './extensions/site/widgets/typewriter-text/typewriter-text.tsx',
  settings: './extensions/site/widgets/typewriter-text/typewriter-text.panel.tsx',
});
