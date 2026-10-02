// Shared between the widget and its settings panel: prop keys, defaults and parsers.
// Widget props travel as string attributes, so everything is stored as a string.

export const TAG_OPTIONS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'] as const;
export type TagOption = (typeof TAG_OPTIONS)[number];

export const ALIGN_OPTIONS = ['left', 'center', 'right'] as const;
export type AlignOption = (typeof ALIGN_OPTIONS)[number];

export interface TypewriterSettings {
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
  cursorCharacter: string;
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
  cursorCharacter: raw.cursorCharacter ?? DEFAULTS.cursorCharacter,
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
