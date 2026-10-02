import React, { createElement, useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import classNames from 'classnames';
import { useIsEditMode, useReducedMotion } from '@wix/react-component-utils';
import TextType from '../../widgets/typewriter-text/TextType';
import { splitTemplate, validateTemplate } from '../../widgets/typewriter-text/config';
import { ARIA_LABELS } from './constants';
import styles from './typewriter-text.module.css';
import type { TypewriterTextProps } from './typewriter-text.props';

const PlayIcon: FC = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon: FC = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
);

const TypewriterText: FC<TypewriterTextProps> = (props) => {
  const {
    id,
    className,
    direction,
    mode,
    sentence = '',
    words = [],
    sentences = [],
    tag = 'h2',
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    initialDelay,
    humanLikeSpeed,
    minSpeed = 40,
    maxSpeed = 120,
    autoPlay,
    loop,
    startOnVisible,
    reverseMode,
    pauseButtonVisibility,
    showCursor,
    hideCursorWhileTyping,
    cursorCharacter,
    cursorBlinkDuration,
    elementProps,
  } = props;

  const isEditMode = useIsEditMode();
  const reducedMotion = useReducedMotion();

  // Reduced motion starts paused; a visitor can still press play.
  const [isPlayOn, setIsPlayOn] = useState(() => (autoPlay ?? true) && !reducedMotion);
  const previousAutoPlay = useRef(autoPlay);
  useEffect(() => {
    if (previousAutoPlay.current !== autoPlay) {
      setIsPlayOn((autoPlay ?? true) && !reducedMotion);
    } else if (reducedMotion) {
      setIsPlayOn(false);
    }
    previousAutoPlay.current = autoPlay;
  }, [autoPlay, reducedMotion]);

  // Stable object so the typing effect doesn't restart on every render.
  const variableSpeed = useMemo(
    () => (humanLikeSpeed ? { min: Math.min(minSpeed, maxSpeed), max: Math.max(minSpeed, maxSpeed) } : undefined),
    [humanLikeSpeed, minSpeed, maxSpeed]
  );

  const isWordMode = mode !== 'sentences';
  const template = splitTemplate(sentence, words.map((w) => w.word));
  const lines = sentences.map((s) => s.text).filter((text) => text.trim() !== '');
  const rotation = isWordMode ? template.rotation : lines.length > 0 ? lines : [''];
  const before = isWordMode ? template.before : '';
  const after = isWordMode ? template.after : '';

  // Screen readers get the full text once instead of every typed character.
  const fullText = isWordMode
    ? `${template.before}${template.rotation.filter(Boolean).join(', ')}${template.after}`
    : lines.join(' ');

  const templateError = isEditMode && isWordMode ? validateTemplate(sentence) : null;

  return (
    <div
      id={id}
      dir={direction}
      data-pause-button-visibility={pauseButtonVisibility ?? 'showOnHover'}
      className={classNames('typewriter-text', styles.root, styles.fallbackDirection, className)}
    >
      <div className={styles.content}>
        {createElement(
          tag,
          {
            ...elementProps?.headline,
            className: classNames('typewriter-text-headline', styles.headline, elementProps?.headline?.className),
          },
          <span className={styles.visuallyHidden}>{fullText}</span>,
          <span aria-hidden="true">
            {before}
            <span
              {...elementProps?.animatedText}
              className={classNames(
                'typewriter-text-animated-text',
                styles.animatedText,
                elementProps?.animatedText?.className
              )}
            >
              {isPlayOn ? (
                <TextType
                  as="span"
                  text={rotation}
                  typingSpeed={typingSpeed}
                  deletingSpeed={deletingSpeed}
                  pauseDuration={pauseDuration}
                  initialDelay={initialDelay}
                  variableSpeed={variableSpeed}
                  loop={loop}
                  startOnVisible={startOnVisible}
                  reverseMode={reverseMode}
                  showCursor={showCursor}
                  hideCursorWhileTyping={hideCursorWhileTyping}
                  cursorCharacter={cursorCharacter}
                  cursorBlinkDuration={cursorBlinkDuration}
                  cursorClassName={styles.cursor}
                />
              ) : (
                rotation[0]
              )}
            </span>
            {after}
          </span>
        )}
        {templateError && <p className={styles.editorError}>{templateError}</p>}
      </div>
      <button
        type="button"
        {...elementProps?.playButton}
        className={classNames('typewriter-text-play-button', styles.playButton, elementProps?.playButton?.className)}
        onClick={() => setIsPlayOn((on) => !on)}
        aria-label={isPlayOn ? ARIA_LABELS.pauseButton : ARIA_LABELS.playButton}
      >
        {isPlayOn ? <PauseIcon /> : <PlayIcon />}
      </button>
    </div>
  );
};

export default TypewriterText;
