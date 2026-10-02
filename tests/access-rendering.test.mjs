import assert from 'node:assert/strict';
import { test } from 'node:test';
import Module from 'node:module';
import path from 'node:path';
import { build } from 'esbuild';

// Exercise the real render branches while replacing only Wix hosts and billing transport.
const compiled = await build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import Widget from './src/extensions/site/widgets/typewriter-text/typewriter-text';
      import Component from './src/extensions/site/components/typewriter-text/typewriter-text';
      import Panel from './src/extensions/site/widgets/typewriter-text/typewriter-text.panel';
      import { defaultProps } from './src/extensions/site/components/typewriter-text/typewriter-text.props';
      export const renderWidget = (props = {}) => renderToStaticMarkup(React.createElement(Widget, props));
      export const renderComponent = (props = {}) => renderToStaticMarkup(React.createElement(Component, { ...defaultProps, id: 'test', ...props }));
      export const renderPanel = () => renderToStaticMarkup(React.createElement(Panel));
    `,
    resolveDir: process.cwd(),
    loader: 'tsx',
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  jsx: 'automatic',
  plugins: [{
    name: 'wix-test-host',
    setup(builder) {
      builder.onResolve({ filter: /use-app-access$/ }, () => ({ path: 'access', namespace: 'test-host' }));
      builder.onResolve({ filter: /^@wix\/react-component-utils$/ }, () => ({ path: 'context', namespace: 'test-host' }));
      builder.onResolve({ filter: /^react-to-webcomponent$/ }, () => ({ path: 'webcomponent', namespace: 'test-host' }));
      builder.onResolve({ filter: /^@wix\/editor$/ }, () => ({ path: 'editor', namespace: 'test-host' }));
      builder.onResolve({ filter: /^@wix\/design-system$/ }, () => ({ path: 'wds', namespace: 'test-host' }));
      builder.onResolve({ filter: /\.css$/ }, () => ({ path: 'css', namespace: 'test-host' }));
      builder.onLoad({ filter: /.*/, namespace: 'test-host' }, ({ path: name }) => {
        const sources = {
          access: `export const useAppAccess = () => globalThis.__typewriterAccessTest;`,
          context: `export const useIsEditMode = () => globalThis.__typewriterEditorTest; export const useReducedMotion = () => false;`,
          webcomponent: `export default (Component) => Component;`,
          editor: `export const widget = {}; export const inputs = {};`,
          css: `export default {};`,
          wds: `
            import React from 'react';
            const Wrapper = ({ children }) => React.createElement('div', null, children);
            export const SidePanel = Object.assign(Wrapper, { Header: Wrapper, Content: Wrapper, Footer: Wrapper, Field: Wrapper, Section: Wrapper });
            export const SegmentedToggle = Object.assign(Wrapper, { Button: Wrapper });
            export const WixDesignSystemProvider = Wrapper, Box = Wrapper, Button = Wrapper, Dropdown = Wrapper, FillPreview = Wrapper, FormField = Wrapper, InputArea = Wrapper, NumberInput = Wrapper, Slider = Wrapper, Text = Wrapper, TextButton = Wrapper, ToggleSwitch = Wrapper;
            export const accordionItemBuilder = (value) => value;
            export const Accordion = ({ items }) => React.createElement('div', null, items.map((item, i) => React.createElement('div', { key: i }, item.children)));
          `,
        };
        return { contents: sources[name], loader: 'js', resolveDir: process.cwd() };
      });
    },
  }],
});
const bundlePath = path.join(process.cwd(), 'tests/access-rendering-bundle.cjs');
const bundled = new Module(bundlePath);
bundled._compile(compiled.outputFiles[0].text, bundlePath);
const { renderWidget, renderComponent, renderPanel } = bundled.exports;

function setAccess(status, editor = false) {
  globalThis.__typewriterEditorTest = editor;
  globalThis.__typewriterAccessTest = {
    status,
    allowed: status === 'pro' || status === 'trial',
    instanceId: 'installation-a',
    refresh: async () => {},
    canAccess: () => status === 'pro' || status === 'trial',
  };
}

test('live widgets expose no text, notices or enabled playback while access is unconfirmed or blocked', () => {
  for (const status of ['loading', 'blocked', 'error']) {
    setAccess(status);
    assert.equal(renderWidget({ text: '["PRIVATE CONTENT"]', allowed: 'true', pro: 'true' }), '');
    const component = renderComponent({ sentence: 'PRIVATE [CONTENT]', isPro: true });
    assert.doesNotMatch(component, /PRIVATE|Pro required|Unable to verify|text-type__content/);
    assert.match(component, /display:none/);
    assert.match(component, /disabled=""/);
  }
});

test('Pro and trial render saved text and interactive typewriters on both surfaces', () => {
  for (const status of ['pro', 'trial']) {
    setAccess(status);
    assert.match(renderWidget({ mode: 'word', sentenceTemplate: 'Saved [word] remains.' }), /Saved /);
    assert.match(renderComponent({ sentence: 'Saved [word] remains.' }), /Saved /);
    assert.match(renderComponent(), /text-type__content/);
    assert.doesNotMatch(renderComponent(), /Pro required/);
  }
});

test('editor-only notices provide Wix upgrade and retry paths without displaying saved paid text', () => {
  setAccess('blocked', true);
  const component = renderComponent({ sentence: 'PRIVATE [CONTENT]' });
  assert.match(component, /Pro required/);
  assert.match(component, /https:\/\/www.wix.com\/apps\/upgrade\//);
  assert.match(component, /appInstanceId=installation-a/);
  assert.doesNotMatch(component, /PRIVATE/);
  assert.match(renderPanel(), /Pro required/);
  assert.doesNotMatch(renderPanel(), /Reset to defaults|Change font/);
  setAccess('error', true);
  assert.match(renderComponent(), /Unable to verify app access/);
  assert.match(renderPanel(), /Retry/);
  assert.doesNotMatch(renderPanel(), /View Pro plans/);
});

test('restoring entitlement reopens settings and retains their configured defaults', () => {
  setAccess('pro', true);
  assert.match(renderPanel(), /Reset to defaults/);
  assert.doesNotMatch(renderPanel(), /Pro required/);
});
