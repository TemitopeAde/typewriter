import type { A11y, Direction } from '@wix/editor-react-types';
import type { CursorOption } from '../../widgets/typewriter-text/config';

export type TypewriterMode = 'word' | 'sentences';
export type TypewriterTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div';

export type RotatingWord = { word: string };
export type TypedSentence = { text: string };

export type TypewriterTextProps = {
  id: string;
  className?: string;
  direction?: Direction;
  a11y?: A11y;

  /** Rotating word keeps one sentence on screen and swaps the [bracketed] word; Full sentences types whole lines one after another. */
  mode?: TypewriterMode;
  /** Wrap the word to animate in square brackets, e.g. Great ideas [start] with a spark. */
  sentence?: string;
  /** Words that replace the bracketed word in turn. */
  words?: Array<RotatingWord>;
  /** Sentences typed and deleted one after another. */
  sentences?: Array<TypedSentence>;
  /** HTML element the text renders as. Use a heading for titles. */
  tag?: TypewriterTag;

  /** Milliseconds between typed characters. @min 1 @max 2000 */
  typingSpeed?: number;
  /** Milliseconds between deleted characters. @min 1 @max 2000 */
  deletingSpeed?: number;
  /** How long finished text stays before deleting, in ms. @min 0 @max 20000 */
  pauseDuration?: number;
  /** Wait before each line starts typing, in ms. @min 0 @max 20000 */
  initialDelay?: number;
  /** Randomize each character's delay between the min and max speed. */
  humanLikeSpeed?: boolean;
  /** Fastest delay when human-like speed is on, in ms. @min 1 @max 2000 */
  minSpeed?: number;
  /** Slowest delay when human-like speed is on, in ms. @min 1 @max 2000 */
  maxSpeed?: number;

  /** Start typing automatically. */
  autoPlay?: boolean;
  /** Start over after the last line. */
  loop?: boolean;
  /** Wait until the text scrolls into view before typing. */
  startOnVisible?: boolean;
  /** Type each line backwards. */
  reverseMode?: boolean;
  /** When the play/pause button is shown. */
  pauseButtonVisibility?: 'showOnHover' | 'showAlways';

  /** Show a blinking cursor after the text. */
  showCursor?: boolean;
  /** Only show the cursor while the text is paused. */
  hideCursorWhileTyping?: boolean;
  /** Symbol used as the cursor. */
  cursorCharacter?: CursorOption;
  /** Seconds for one cursor fade. @min 0.1 @max 5 */
  cursorBlinkDuration?: number;

  elementProps?: {
    headline?: { className?: string };
    animatedText?: { className?: string };
    playButton?: { className?: string };
  };
};

export const defaultProps = {
  mode: 'word',
  sentence: 'Great ideas [start] with a spark.',
  words: [{ word: 'stop' }, { word: 'now' }, { word: 'bring' }],
  sentences: [
    { text: 'Great ideas start with a spark.' },
    { text: 'Make something unexpected.' },
    { text: 'One word at a time.' },
  ],
  tag: 'h2',
  typingSpeed: 75,
  deletingSpeed: 30,
  pauseDuration: 1500,
  initialDelay: 0,
  humanLikeSpeed: false,
  minSpeed: 40,
  maxSpeed: 120,
  autoPlay: true,
  loop: true,
  startOnVisible: false,
  reverseMode: false,
  pauseButtonVisibility: 'showOnHover',
  showCursor: true,
  hideCursorWhileTyping: false,
  cursorCharacter: '|',
  cursorBlinkDuration: 0.5,
} as const satisfies Omit<TypewriterTextProps, 'id' | 'className'>;
