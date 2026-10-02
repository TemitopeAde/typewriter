import { extensions } from '@wix/astro/builders'
import { configurationSchema } from './configuration';

export default extensions.appTools({
  id: 'bd9f89a9-2231-438d-b7bd-2a12d882eaee',
  name: 'typewriter-tools',
  // learn more about JSON Schema - https://json-schema.org/overview/what-is-jsonschema
  tools: [
    {
      methodName: 'get-typewriter-capabilities',
      displayName: 'Explain Typewriter Text',
      description: 'Explains the Typewriter Text app, its animation modes, defaults and configurable options. Use when a user asks about animated headlines, rotating words, typing effects, cursor settings or how to configure this app. Requires no inputs; does not read or change site elements.',
      activated: true,
      requestSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      responseSchema: {
        type: 'object',
        properties: {
          componentType: { type: 'string' },
          defaults: configurationSchema,
          configurationSchema: { type: 'object' },
          guidance: { type: 'string' },
        }
      }
    },
    {
      methodName: 'prepare-typewriter-settings',
      displayName: 'Prepare Typewriter Settings',
      description: 'Prepares and validates Typewriter Text configuration for a rotating word headline or a sequence of full sentences. Use when a user wants typing effects, different text, animation speed, playback or cursor options. Accepts optional settings and fills omitted settings with app defaults. Returns settings and instructions; does not insert, save, modify or publish site elements.',
      activated: true,
      requestSchema: configurationSchema,
      responseSchema: {
        type: 'object',
        properties: {
          valid: { type: 'boolean' }, applied: { type: 'boolean', const: false },
          errors: { type: 'array', items: { type: 'string' } },
          configuration: configurationSchema, componentType: { type: 'string' },
          instructions: { type: 'string' },
        },
        required: ['valid', 'applied'],
      },
    },
  ],
});
