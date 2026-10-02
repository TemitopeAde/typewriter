import { toolsProvider } from '@wix/app-tools/service-plugins';
import { defaultProps } from '../../../site/components/typewriter-text/typewriter-text.props';
import { configurationSchema, prepareConfiguration } from '../../app-tools/typewriter-tools/configuration';

toolsProvider.provideHandlers({
  runTool: async ({ request }) => {
    switch (request.methodName) {
      case 'get-typewriter-capabilities':
        return { response: {
          componentType: 'typewriter.TypewriterText',
          defaults: defaultProps,
          configurationSchema,
          guidance: 'Typewriter Text animates one bracketed word within a fixed sentence or cycles through full sentences. Configure text, heading tag, typing/deleting speed, delays, human-like speed, loop, visibility trigger, playback and cursor. The Editor React Component is for Wix Harmony. Use prepare-typewriter-settings to validate configuration. These tools do not read current site settings, insert elements, save editor props or publish sites.',
        } };
      case 'prepare-typewriter-settings':
        return { response: prepareConfiguration(request.payload ?? {}) };
      default:
        throw new Error(`Unknown Typewriter tool: ${request.methodName}`);
    }
  },
});
