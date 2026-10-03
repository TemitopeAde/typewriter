// This file is the Editor preview entry point for your component.
// Override or extend it when you need Editor-specific behavior or rendering
// (e.g. mock data, Editor-only interactions, or a different visual state).

import React from 'react';
import type { ComponentProps, FC } from 'react';
import {
  useIsEditMode,
  withDefaults,
  withFallbackPlaceholder,
} from '@wix/react-component-utils';
import Component from './typewriter-text';
import { defaultProps } from './typewriter-text.props';

const TypewriterTextPreview: FC<ComponentProps<typeof Component>> = (props) => {
  const isEditMode = useIsEditMode();
  return (
    <Component
      {...props}
      autoPlay={props.autoPlay}
      pauseButtonVisibility={isEditMode ? 'showAlways' : props.pauseButtonVisibility}
    />
  );
};

const TypewriterTextPreviewWithFallback = withFallbackPlaceholder(TypewriterTextPreview, {
  requiredDataFields: ['sentence'],
  rootClassName: 'typewriter-text',
});

export default withDefaults(
  TypewriterTextPreviewWithFallback,
  defaultProps
);
