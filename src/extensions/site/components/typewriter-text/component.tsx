// This file wires your component with its default props and exports it for use by the extension.
// Please do not modify the structure or logic of this file

import { withDefaults } from '@wix/react-component-utils';
import Component from './typewriter-text';
import { defaultProps } from './typewriter-text.props';

const TypewriterText = withDefaults(
  Component,
  defaultProps
);

export default TypewriterText;
