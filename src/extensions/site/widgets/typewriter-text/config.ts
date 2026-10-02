// Shared between the widget and its settings panel: prop keys, defaults and parsers.
// Widget props travel as string attributes, so everything is stored as a string.

export const TAG_OPTIONS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'] as const;
export type TagOption = (typeof TAG_OPTIONS)[number];

export const ALIGN_OPTIONS = ['left', 'center', 'right'] as const;
export type AlignOption = (typeof ALIGN_OPTIONS)[number];

/** Cursor symbols offered in the panel; any other stored value falls back to the default. */
export const CURSOR_OPTIONS = [
  { char: '|', label: 'Bar' },
  { char: '▏', label: 'Thin bar' },
  { char: '▌', label: 'Half block' },
  { char: '█', label: 'Block' },
  { char: '_', label: 'Underscore' },
  { char: '•', label: 'Dot' },
] as const;
export type CursorOption = (typeof CURSOR_OPTIONS)[number]['char'];
const CURSOR_CHARS = CURSOR_OPTIONS.map((o) => o.char);

export const MODE_OPTIONS = ['word', 'sentences'] as const;
export type ModeOption = (typeof MODE_OPTIONS)[number];

export interface TypewriterSettings {
  mode: ModeOption;
  sentenceTemplate: string;
  words: string[];
  wordColor: string;
  text: string[];
  as: TagOption;
  typingSpeed: number;
  initialDelay: number;
  pauseDuration: number;
  deletingSpeed: number;
  variableSpeedEnabled: boolean;
  variableSpeedMin: number;
  variableSpeedMax: number;
  loop: boolean;
  startOnVisible: boolean;
  reverseMode: boolean;
  showCursor: boolean;
  hideCursorWhileTyping: boolean;
  cursorCharacter: CursorOption;
  cursorBlinkDuration: number;
  cursorColor: string;
  textColors: string[];
  textColor: string;
  font: string;
  textDecoration: string;
  fontSize: number;
  textAlign: AlignOption;
}

export const DEFAULTS: TypewriterSettings = {
  mode: 'word',
  sentenceTemplate: 'Great ideas [start] with a spark.',
  words: ['stop', 'now', 'bring'],
  wordColor: '',
  text: ['Great ideas start with a spark.', 'Make something unexpected.', 'One word at a time.'],
  as: 'h2',
  typingSpeed: 75,
  initialDelay: 0,
  pauseDuration: 1500,
  deletingSpeed: 30,
  variableSpeedEnabled: false,
  variableSpeedMin: 40,
  variableSpeedMax: 120,
  loop: true,
  startOnVisible: false,
  reverseMode: false,
  showCursor: true,
  hideCursorWhileTyping: false,
  cursorCharacter: '|',
  cursorBlinkDuration: 0.5,
  cursorColor: '',
  textColors: [],
  textColor: '#1a1a1a',
  font: '',
  textDecoration: '',
  fontSize: 40,
  textAlign: 'left',
};

/** Settings key (camelCase, used by the widget) → attribute name (kebab-case, used by the panel). */
export const toAttr = (key: keyof TypewriterSettings) =>
  key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Serialize a setting value to the string stored on the widget. */
export const serialize = (value: TypewriterSettings[keyof TypewriterSettings]): string =>
  Array.isArray(value) ? JSON.stringify(value) : String(value);

const parseNumber = (raw: string | null | undefined, fallback: number) => {
  if (raw === null || raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

const parseBool = (raw: string | null | undefined, fallback: boolean) =>
  raw === 'true' ? true : raw === 'false' ? false : fallback;

const parseStringArray = (raw: string | null | undefined, fallback: string[]) => {
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : fallback;
  } catch {
    return fallback;
  }
};

const parseOption = <T extends string>(raw: string | null | undefined, options: readonly T[], fallback: T) =>
  options.includes(raw as T) ? (raw as T) : fallback;

/** Build full settings from raw string values, falling back to defaults per key. */
export const parseSettings = (raw: Partial<Record<keyof TypewriterSettings, string | null | undefined>>): TypewriterSettings => ({
  mode: parseOption(raw.mode, MODE_OPTIONS, DEFAULTS.mode),
  sentenceTemplate: raw.sentenceTemplate ?? DEFAULTS.sentenceTemplate,
  words: parseStringArray(raw.words, DEFAULTS.words),
  wordColor: raw.wordColor ?? DEFAULTS.wordColor,
  text: parseStringArray(raw.text, DEFAULTS.text),
  as: parseOption(raw.as, TAG_OPTIONS, DEFAULTS.as),
  typingSpeed: parseNumber(raw.typingSpeed, DEFAULTS.typingSpeed),
  initialDelay: parseNumber(raw.initialDelay, DEFAULTS.initialDelay),
  pauseDuration: parseNumber(raw.pauseDuration, DEFAULTS.pauseDuration),
  deletingSpeed: parseNumber(raw.deletingSpeed, DEFAULTS.deletingSpeed),
  variableSpeedEnabled: parseBool(raw.variableSpeedEnabled, DEFAULTS.variableSpeedEnabled),
  variableSpeedMin: parseNumber(raw.variableSpeedMin, DEFAULTS.variableSpeedMin),
  variableSpeedMax: parseNumber(raw.variableSpeedMax, DEFAULTS.variableSpeedMax),
  loop: parseBool(raw.loop, DEFAULTS.loop),
  startOnVisible: parseBool(raw.startOnVisible, DEFAULTS.startOnVisible),
  reverseMode: parseBool(raw.reverseMode, DEFAULTS.reverseMode),
  showCursor: parseBool(raw.showCursor, DEFAULTS.showCursor),
  hideCursorWhileTyping: parseBool(raw.hideCursorWhileTyping, DEFAULTS.hideCursorWhileTyping),
  cursorCharacter: parseOption(raw.cursorCharacter, CURSOR_CHARS, DEFAULTS.cursorCharacter),
  cursorBlinkDuration: parseNumber(raw.cursorBlinkDuration, DEFAULTS.cursorBlinkDuration),
  cursorColor: raw.cursorColor ?? DEFAULTS.cursorColor,
  textColors: parseStringArray(raw.textColors, DEFAULTS.textColors),
  textColor: raw.textColor || DEFAULTS.textColor,
  font: raw.font ?? DEFAULTS.font,
  textDecoration: raw.textDecoration ?? DEFAULTS.textDecoration,
  fontSize: parseNumber(raw.fontSize, DEFAULTS.fontSize),
  textAlign: parseOption(raw.textAlign, ALIGN_OPTIONS, DEFAULTS.textAlign),
});

export const SETTING_KEYS = Object.keys(DEFAULTS) as (keyof TypewriterSettings)[];

/**
 * Split a rotating-word sentence like "Great ideas [start] with a spark." into the static
 * text around the first [bracketed] word and the full word rotation (bracketed word first).
 * Without brackets, the words are animated at the end of the sentence.
 */
export const splitTemplate = (template: string, words: string[]) => {
  const extra = words.map((w) => w.trim()).filter(Boolean);
  const match = /\[([^\]]*)\]/.exec(template);

  if (!match) {
    const rotation = extra.length > 0 ? extra : [''];
    return { before: template ? `${template} ` : '', after: '', rotation, hasMarker: false };
  }

  const first = match[1].trim();
  const rotation = [first, ...extra].filter(Boolean);
  return {
    before: template.slice(0, match.index),
    after: template.slice(match.index + match[0].length),
    rotation: rotation.length > 0 ? rotation : [''],
    hasMarker: true,
  };
};

const clip = (text: string, max = 30) => (text.length > max ? `${text.slice(0, max)}…` : text);

/**
 * Check a rotating-word sentence for bracket mistakes. Returns a message that quotes the
 * offending part and says how to fix it, or null when the sentence is well formed.
 */
export const validateTemplate = (template: string): string | null => {
  if (!template.trim()) return 'The sentence is empty. Type a sentence and wrap one word in [brackets].';

  let open = -1;
  for (let i = 0; i < template.length; i++) {
    const c = template[i];
    if (c === '[') {
      if (open !== -1) {
        let end = template.indexOf(']', i);
        if (end === -1) end = template.length - 1;
        while (template[end + 1] === ']') end++;
        return `Brackets can't be inside other brackets: "${clip(template.slice(open, end + 1))}". Use one pair, e.g. [start].`;
      }
      open = i;
    } else if (c === ']') {
      if (open === -1) {
        const wordStart = template.lastIndexOf(' ', i - 1) + 1;
        const snippet = template.slice(Math.max(wordStart, i - 29), i + 1);
        return `There's a closing bracket with no opening one: "${snippet}". Add "[" before the word.`;
      }
      open = -1;
    }
  }
  if (open !== -1) {
    return `You opened a bracket but never closed it: "${clip(template.slice(open))}". Add "]" after the word.`;
  }

  const markers = [...template.matchAll(/\[([^\]]*)\]/g)];
  const empty = markers.find((m) => m[1].trim() === '');
  if (empty) return `The brackets are empty: "${empty[0]}". Put the word to animate inside, e.g. [start].`;
  if (markers.length > 1) {
    return `Only one word can be in brackets. Found ${markers.length}: ${markers.map((m) => m[0]).join(', ')}. Remove the extra brackets.`;
  }
  if (markers.length === 0) {
    return 'No word in [brackets]. Wrap the word to animate, e.g. Great ideas [start] with a spark.';
  }
  return null;
};
