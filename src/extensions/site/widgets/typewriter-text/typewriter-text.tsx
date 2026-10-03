import React, { type FC, createElement, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import reactToWebComponent from 'react-to-webcomponent';
import TextType from './TextType';
import { parseSettings, splitTemplate, SETTING_KEYS, type TypewriterSettings } from './config';
import styles from './typewriter-text.module.css';
import { useAppAccess } from '../../../../access/use-app-access';
import { useIsEditorOrPreview } from '../../../../access/use-is-preview';

// Every setting arrives as a raw string attribute (e.g. `typing-speed="75"`).
type RawProps = Partial<Record<keyof TypewriterSettings, string>>;

const TypewriterContent: FC<RawProps> = (raw) => {
  const s = parseSettings(raw);

  // Stable object so the typing effect doesn't restart on every render.
  const variableSpeed = useMemo(
    () =>
      s.variableSpeedEnabled
        ? { min: Math.min(s.variableSpeedMin, s.variableSpeedMax), max: Math.max(s.variableSpeedMin, s.variableSpeedMax) }
        : undefined,
    [s.variableSpeedEnabled, s.variableSpeedMin, s.variableSpeedMax]
  );

  const template = splitTemplate(s.sentenceTemplate, s.words);
  const textStyle = { fontSize: `${s.fontSize}px`, textAlign: s.textAlign, textDecoration: s.textDecoration };

  // Animation options shared by both modes.
  const typingProps = {
    typingSpeed: s.typingSpeed,
    initialDelay: s.initialDelay,
    pauseDuration: s.pauseDuration,
    deletingSpeed: s.deletingSpeed,
    variableSpeed,
    loop: s.loop,
    startOnVisible: s.startOnVisible,
    reverseMode: s.reverseMode,
    showCursor: s.showCursor,
    hideCursorWhileTyping: s.hideCursorWhileTyping,
    cursorCharacter: s.cursorCharacter,
    cursorBlinkDuration: s.cursorBlinkDuration,
    cursorClassName: styles.cursor,
    textColors: s.textColors,
  };

  return (
    <div
      className={styles.root}
      style={{
        ...(s.font ? { font: s.font } : {}),
        color: s.textColor,
        ...(s.cursorColor ? { ['--cursor-color' as string]: s.cursorColor } : {}),
        justifyContent: s.textAlign === 'center' ? 'center' : s.textAlign === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {s.mode === 'word' ? (
        createElement(
          s.as,
          { className: styles.text, style: textStyle },
          template.before,
          <TextType
            {...typingProps}
            as="span"
            className={styles.word}
            style={s.wordColor ? { color: s.wordColor } : undefined}
            text={template.rotation}
          />,
          template.after
        )
      ) : (
        <TextType {...typingProps} as={s.as} className={styles.text} style={textStyle} text={s.text} />
      )}
    </div>
  );
};

const TypewriterText: FC<RawProps> = (raw) => {
  const access = useAppAccess();
  // Owners can animate in the editor and Preview; published sites require access.
  const isEditorOrPreview = useIsEditorOrPreview();
  return access.allowed || isEditorOrPreview ? <TypewriterContent {...raw} /> : null;
};

export default reactToWebComponent(TypewriterText, React, ReactDOM, {
  props: Object.fromEntries(SETTING_KEYS.map((key) => [key, 'string'])) as Record<keyof RawProps, 'string'>,
});
