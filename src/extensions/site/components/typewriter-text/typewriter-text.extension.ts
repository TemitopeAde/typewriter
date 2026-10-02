import { extensions } from '@wix/astro/builders'
import { LAYOUT } from '@wix/react-component-schema';
import { withEditorElementDefaults } from '@wix/react-component-utils';
import merge from 'deepmerge';
import { editorElement } from './typewriter-text.generated';
import { defaultProps } from './typewriter-text.props';
import { CURSOR_OPTIONS } from '../../widgets/typewriter-text/config';
import componentUrl from './component.tsx?url';
import componentPreviewUrl from './component.preview.tsx?url';

const editorElementWithDefaults = withEditorElementDefaults(
  editorElement,
  defaultProps
);

// Replace generated arrays (e.g. enum options) instead of appending to them.
const overwriteArrays = (_target: unknown[], source: unknown[]) => source;

const selectablePart = { behaviors: { selectable: true, removable: false } };

// Friendlier panel labels than the ones derived from prop names.
const dataOverrides = {
  mode: {
    displayName: 'Mode',
    textEnum: {
      options: [
        { value: 'word', displayName: 'Rotating word' },
        { value: 'sentences', displayName: 'Full sentences' },
      ],
    },
  },
  sentence: { displayName: 'Sentence (wrap the animated [word] in brackets)' },
  words: { displayName: 'Rotating words' },
  tag: { displayName: 'HTML tag' },
  typingSpeed: { displayName: 'Typing speed (ms)' },
  deletingSpeed: { displayName: 'Deleting speed (ms)' },
  pauseDuration: { displayName: 'Pause duration (ms)' },
  initialDelay: { displayName: 'Initial delay (ms)' },
  humanLikeSpeed: { displayName: 'Human-like speed' },
  minSpeed: { displayName: 'Min speed (ms)' },
  maxSpeed: { displayName: 'Max speed (ms)' },
  autoPlay: { displayName: 'Play automatically' },
  startOnVisible: { displayName: 'Start when visible' },
  pauseButtonVisibility: {
    displayName: 'Play/pause button',
    textEnum: {
      options: [
        { value: 'showOnHover', displayName: 'Show on hover' },
        { value: 'showAlways', displayName: 'Always show' },
      ],
    },
  },
  hideCursorWhileTyping: { displayName: 'Hide cursor while typing' },
  cursorCharacter: {
    displayName: 'Cursor character',
    textEnum: {
      options: CURSOR_OPTIONS.map(({ char, label }) => ({ value: char, displayName: `${char}  ${label}` })),
    },
  },
  cursorBlinkDuration: { displayName: 'Cursor blink duration (s)' },
};

export default extensions.editorReactComponent({
  id: 'f553cfdb-5d82-4d48-a0a2-c6865387b546',
  type: 'typewriter.TypewriterText',
  displayName: 'Typewriter Text',
  description: 'Animated headline that types, deletes and retypes text. Rotate one highlighted word inside a fixed sentence, or cycle through whole sentences.',
  editorElement: merge(
    editorElementWithDefaults,
    {
      displayName: 'Typewriter Text',
      data: dataOverrides,
      elements: {
        typewriterTextHeadline: {
          inlineElement: {
            displayName: 'Text',
            ...selectablePart,
            elements: {
              typewriterTextAnimatedText: { inlineElement: { displayName: 'Animated text', ...selectablePart } },
            },
          },
        },
        typewriterTextPlayButton: { inlineElement: { displayName: 'Play/pause button', ...selectablePart } },
      },
      layout: {
        resizeDirection: LAYOUT.RESIZE_DIRECTION.horizontal,
        contentResizeDirection: LAYOUT.CONTENT_RESIZE_DIRECTION.vertical,
      },
      displayGroups: {
        content: {
          displayName: 'Content',
          groupType: 'data',
          data: { items: ['mode', 'tag'] },
        },
        rotatingWord: {
          displayName: 'Rotating word mode',
          groupType: 'data',
          data: { items: ['sentence', 'words'] },
        },
        fullSentences: {
          displayName: 'Full sentences mode',
          groupType: 'data',
          data: { items: ['sentences'] },
        },
        timing: {
          displayName: 'Timing',
          groupType: 'data',
          data: {
            items: ['typingSpeed', 'deletingSpeed', 'pauseDuration', 'initialDelay', 'humanLikeSpeed', 'minSpeed', 'maxSpeed'],
          },
        },
        behavior: {
          displayName: 'Behavior',
          groupType: 'data',
          data: { items: ['autoPlay', 'loop', 'startOnVisible', 'reverseMode', 'pauseButtonVisibility'] },
        },
        cursor: {
          displayName: 'Cursor',
          groupType: 'data',
          data: { items: ['showCursor', 'hideCursorWhileTyping', 'cursorCharacter', 'cursorBlinkDuration'] },
        },
      },
    },
    { arrayMerge: overwriteArrays }
  ),
  installation: {
    staticContainer: 'HOMEPAGE',
    initialSize: {
      width: {
        sizingType: LAYOUT.SIZING_TYPE.pixels,
        pixels: 600,
      },
      height: {
        sizingType: LAYOUT.SIZING_TYPE.content,
      },
    },
  },
  resources: {
    client: {
      componentUrl,
    },
    editor: {
      componentUrl: componentPreviewUrl,
    },
  },
});
