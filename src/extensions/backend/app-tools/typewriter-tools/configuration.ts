import { defaultProps } from '../../../site/components/typewriter-text/typewriter-text.props';
import { CURSOR_OPTIONS, validateTemplate } from '../../../site/widgets/typewriter-text/config';

const numericLimits: Record<string, readonly [number, number]> = {
  typingSpeed: [1, 2000], deletingSpeed: [1, 2000],
  pauseDuration: [0, 20000], initialDelay: [0, 20000],
  minSpeed: [1, 2000], maxSpeed: [1, 2000], cursorBlinkDuration: [0.1, 5],
};
const enums: Record<string, readonly string[]> = {
  mode: ['word', 'sentences'], tag: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'],
  pauseButtonVisibility: ['showOnHover', 'showAlways'],
  cursorCharacter: CURSOR_OPTIONS.map(({ char }) => char),
};
const booleanKeys = Object.entries(defaultProps)
  .filter(([, value]) => typeof value === 'boolean').map(([key]) => key);

export const configurationProperties = {
  ...Object.fromEntries(Object.entries(numericLimits).map(([key, [minimum, maximum]]) =>
    [key, { type: 'number', minimum, maximum }])),
  ...Object.fromEntries(Object.entries(enums).map(([key, values]) =>
    [key, { type: 'string', enum: values }])),
  ...Object.fromEntries(booleanKeys.map((key) => [key, { type: 'boolean' }])),
  sentence: { type: 'string', minLength: 1, maxLength: 2000, description: 'In word mode, wrap exactly one animated word in [brackets].' },
  words: { type: 'array', maxItems: 50, items: { type: 'object', properties: { word: { type: 'string', minLength: 1, maxLength: 2000 } }, required: ['word'], additionalProperties: false } },
  sentences: { type: 'array', minItems: 1, maxItems: 50, items: { type: 'object', properties: { text: { type: 'string', minLength: 1, maxLength: 2000 } }, required: ['text'], additionalProperties: false } },
};

export const configurationSchema = {
  type: 'object', properties: configurationProperties, additionalProperties: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function prepareConfiguration(payload: unknown) {
  if (!isRecord(payload)) throw new Error('Configuration must be an object.');
  const errors: string[] = [];
  for (const [key, value] of Object.entries(payload)) {
    if (!Object.hasOwn(configurationProperties, key)) {
      errors.push(`Unknown setting: ${key}.`);
      continue;
    }
    const limits = numericLimits[key];
    const options = enums[key];
    if (limits && (typeof value !== 'number' || !Number.isFinite(value) || value < limits[0] || value > limits[1])) {
      errors.push(`${key} must be a number between ${limits[0]} and ${limits[1]}.`);
    } else if (options && (typeof value !== 'string' || !options.includes(value))) {
      errors.push(`${key} must be one of: ${options.join(', ')}.`);
    } else if (booleanKeys.includes(key) && typeof value !== 'boolean') {
      errors.push(`${key} must be a boolean.`);
    } else if (key === 'sentence' && (typeof value !== 'string' || !value.trim() || value.length > 2000)) {
      errors.push('sentence must contain 1–2000 characters.');
    } else if (key === 'words' || key === 'sentences') {
      const itemKey = key === 'words' ? 'word' : 'text';
      if (!Array.isArray(value) || value.length > 50 || (key === 'sentences' && !value.length) ||
        value.some((item: unknown) => !isRecord(item) || Object.keys(item).length !== 1 ||
          typeof item[itemKey] !== 'string' || !item[itemKey].trim() || item[itemKey].length > 2000)) {
        errors.push(`${key} must contain ${key === 'words' ? '0' : '1'}–50 objects with a nonempty ${itemKey} string (max 2000 characters).`);
      }
    }
  }
  if (errors.length) return { valid: false, applied: false, errors };
  const configuration = { ...defaultProps, ...payload };
  if (configuration.mode === 'word') {
    const error = validateTemplate(String(configuration.sentence));
    if (error) errors.push(error);
  }
  if (Number(configuration.minSpeed) > Number(configuration.maxSpeed)) {
    errors.push('minSpeed must not exceed maxSpeed.');
  }
  if (errors.length) return { valid: false, applied: false, errors };
  return {
    valid: true, applied: false, configuration,
    componentType: 'typewriter.TypewriterText',
    instructions: 'These settings are prepared, not saved to a site. Select Typewriter Text in Wix Harmony and apply the values through Content, Rotating word mode or Full sentences mode, Timing, Behavior, and Cursor panels. This tool cannot insert an element, change editor props, or publish the site.',
  };
}
