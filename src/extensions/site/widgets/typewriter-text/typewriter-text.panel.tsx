import React, { type FC, type ReactNode, useState, useEffect, useCallback } from 'react';
import { widget, inputs } from '@wix/editor';
import {
  SidePanel,
  WixDesignSystemProvider,
  Accordion,
  accordionItemBuilder,
  Box,
  Button,
  Dropdown,
  FillPreview,
  FormField,
  InputArea,
  NumberInput,
  SegmentedToggle,
  Slider,
  Text,
  TextButton,
  ToggleSwitch,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { useAppAccess } from '../../../../access/use-app-access';
import { AccessNotice } from '../../../../access/access-notice';
import {
  ALIGN_OPTIONS,
  CURSOR_OPTIONS,
  DEFAULTS,
  MODE_OPTIONS,
  SETTING_KEYS,
  TAG_OPTIONS,
  parseSettings,
  serialize,
  toAttr,
  validateTemplate,
  type AlignOption,
  type CursorOption,
  type ModeOption,
  type TagOption,
  type TypewriterSettings,
} from './config';

/** Label + ⓘ tooltip wrapper used by every control in the panel. */
const Field: FC<{
  label: string;
  tooltip: ReactNode;
  inline?: boolean;
  warning?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}> = ({
  label,
  tooltip,
  inline,
  warning,
  error,
  children,
}) => (
  <SidePanel.Field>
    <FormField
      label={label}
      infoContent={tooltip}
      {...(error
        ? { status: 'error' as const, statusMessage: error }
        : warning
          ? { status: 'warning' as const, statusMessage: warning }
          : {})}
      labelPlacement={inline ? 'left' : 'top'}
      stretchContent={!inline}
    >
      {children}
    </FormField>
  </SidePanel.Field>
);

const MODE_LABELS: Record<ModeOption, string> = { word: 'Rotating word', sentences: 'Full sentences' };

const Swatch: FC<{ color: string; onClick: () => void }> = ({ color, onClick }) => (
  <Box width="36px">
    <FillPreview fill={color || 'transparent'} onClick={onClick} />
  </Box>
);

const Panel: FC = () => {
  const access = useAppAccess();
  const [settings, setSettings] = useState<TypewriterSettings>(DEFAULTS);
  const [textDraft, setTextDraft] = useState(DEFAULTS.text.join('\n'));
  const [wordsDraft, setWordsDraft] = useState(DEFAULTS.words.join('\n'));

  useEffect(() => {
    Promise.all(SETTING_KEYS.map((key) => widget.getProp(toAttr(key))))
      .then((values) => {
        const loaded = parseSettings(Object.fromEntries(SETTING_KEYS.map((key, i) => [key, values[i]])));
        setSettings(loaded);
        setTextDraft(loaded.text.join('\n'));
        setWordsDraft(loaded.words.join('\n'));
      })
      .catch((error) => console.error('Failed to load typewriter settings:', error));
  }, []);

  const update = useCallback(<K extends keyof TypewriterSettings>(key: K, value: TypewriterSettings[K]) => {
    if (!access.canAccess()) return;
    setSettings((prev) => ({ ...prev, [key]: value }));
    widget.setProp(toAttr(key), serialize(value))
      .catch((error) => console.error(`Failed to save ${key}:`, error));
    if (key === 'font' && typeof value === 'string') {
      widget.setPreloadFonts(value ? [value] : [])
        .catch((error) => console.error('Failed to preload the selected font:', error));
    }
  }, [access.canAccess]);

  const onNumber = <K extends keyof TypewriterSettings>(key: K) => (value: number | null) => {
    if (value !== null) update(key, value as TypewriterSettings[K]);
  };

  const pickColor = (current: string, onPicked: (color: string) => void) =>
    inputs.selectColor(current || undefined, {
      onChange: (value) => {
        if (value) onPicked(value);
      },
    }).catch((error) => console.error('Failed to open the color picker:', error));

  const resetAll = () => {
    if (!access.canAccess()) return;
    setSettings(DEFAULTS);
    setTextDraft(DEFAULTS.text.join('\n'));
    setWordsDraft(DEFAULTS.words.join('\n'));
    Promise.all(SETTING_KEYS.map((key) => widget.setProp(toAttr(key), serialize(DEFAULTS[key]))))
      .catch((error) => console.error('Failed to reset typewriter settings:', error));
    widget.setPreloadFonts([])
      .catch((error) => console.error('Failed to reset preloaded fonts:', error));
  };

  const s = settings;
  const isWordMode = s.mode === 'word';
  const templateError = validateTemplate(s.sentenceTemplate);

  if (!access.allowed) {
    return (
      <WixDesignSystemProvider>
        <SidePanel width="300" height="100vh">
          <SidePanel.Header title="Typewriter Text" />
          <SidePanel.Content>
            <AccessNotice access={access} onRetry={() => { void access.refresh(); }} />
          </SidePanel.Content>
        </SidePanel>
      </WixDesignSystemProvider>
    );
  }

  return (
    <WixDesignSystemProvider>
      <SidePanel width="300" height="100vh">
        <SidePanel.Header title="Typewriter Text" subtitle="Hover the ⓘ icons for details" />
        <SidePanel.Content noPadding stretchVertically>
          {/* All sections start closed; open one at a time to keep the panel short. */}
          <Accordion
            skin="light"
            hideShadow
            size="small"
            contentPadding="none"
            items={[
              // ---------- Content ----------
              accordionItemBuilder({
                title: 'Content',
                children: (
                  <>
                    <Field
                      label="Mode"
                      tooltip="Rotating word: one sentence stays on screen and only the [bracketed] word is typed, deleted and swapped for the next word. Full sentences: whole sentences are typed and deleted one after another."
                    >
                      <SegmentedToggle
                        size="small"
                        selected={s.mode}
                        onClick={(_, value) => update('mode', value as ModeOption)}
                      >
                        {MODE_OPTIONS.map((mode) => (
                          <SegmentedToggle.Button key={mode} value={mode}>
                            {MODE_LABELS[mode]}
                          </SegmentedToggle.Button>
                        ))}
                      </SegmentedToggle>
                    </Field>
                    {isWordMode ? (
                  <>
                        <Field
                          label="Sentence"
                          tooltip="Wrap the word to animate in square brackets, e.g. Great ideas [start] with a spark. The rest of the sentence stays still."
                          error={templateError ?? undefined}
                        >
                          <InputArea
                            rows={2}
                            autoGrow
                            status={templateError ? 'error' : undefined}
                    value={s.sentenceTemplate}
                            onChange={(e) => update('sentenceTemplate', e.target.value)}
                          />
                        </Field>
                        <Field
                          label="Rotating words"
                          tooltip="One word or phrase per line. They replace the bracketed word in turn; the bracketed word is shown first."
                        >
                          <InputArea
                            rows={3}
                            autoGrow
                            value={wordsDraft}
                            onChange={(e) => {
                              setWordsDraft(e.target.value);
                              update('words', e.target.value.split('\n').filter((line) => line.trim() !== ''));
                            }}
                          />
                        </Field>
                        <Field inline label="Word color" tooltip="Highlight color for the animated word. Leave empty to match the text color.">
                          <Box gap="SP1" verticalAlign="middle">
                            <Swatch color={s.wordColor} onClick={() => pickColor(s.wordColor, (c) => update('wordColor', c))} />
                            {s.wordColor && (
                              <TextButton size="small" onClick={() => update('wordColor', '')}>
                                Clear
                              </TextButton>
                            )}
                          </Box>
                        </Field>
                  </>
                ) : (
                  <Field
                    label="Sentences"
                    tooltip="Write one sentence per line. Each line is typed out, held, deleted, and then the next line is typed."
                  >
                    <InputArea
                      rows={4}
                      autoGrow
                      value={textDraft}
                      onChange={(e) => {
                        setTextDraft(e.target.value);
                        update('text', e.target.value.split('\n').filter((line) => line.trim() !== ''));
                      }}
                    />
                  </Field>
                )}
                <Field
                  label="HTML tag"
                  tooltip="The HTML element the text is rendered as. Use a heading (H1–H6) for titles to help SEO and screen readers, or P/DIV/SPAN for regular text."
                >
                  <Dropdown
                    size="small"
                    selectedId={s.as}
                    options={TAG_OPTIONS.map((tag) => ({ id: tag, value: tag.toUpperCase() }))}
                    onSelect={(option) => update('as', option.id as TagOption)}
                  />
                </Field>
                  </>
                ),
              }),

              // ---------- Timing ----------
              accordionItemBuilder({
                title: 'Timing',
                children: (
                  <>
                    <Field label="Typing speed (ms)" tooltip="Milliseconds between each typed character. Lower is faster.">
                      <NumberInput size="small" min={1} max={2000} step={5} value={s.typingSpeed} onChange={onNumber('typingSpeed')} />
                    </Field>
                    <Field label="Deleting speed (ms)" tooltip="Milliseconds between each deleted character. Lower is faster.">
                      <NumberInput size="small" min={1} max={2000} step={5} value={s.deletingSpeed} onChange={onNumber('deletingSpeed')} />
                    </Field>
                    <Field
                      label="Pause duration (ms)"
                      tooltip="How long a fully typed sentence stays on screen before it starts deleting."
                    >
                      <NumberInput size="small" min={0} max={20000} step={100} value={s.pauseDuration} onChange={onNumber('pauseDuration')} />
                    </Field>
                    <Field
                      label="Initial delay (ms)"
                      tooltip="Wait time before the first character of each sentence is typed. Useful to let the page settle first."
                    >
                      <NumberInput size="small" min={0} max={20000} step={100} value={s.initialDelay} onChange={onNumber('initialDelay')} />
                    </Field>
                    <Field
                      inline
                      label="Human-like speed"
                      tooltip="Randomizes the delay of each character between the min and max values below, so typing feels natural instead of mechanical. Overrides Typing speed."
                    >
                      <ToggleSwitch
                        size="small"
                        checked={s.variableSpeedEnabled}
                        onChange={(e) => update('variableSpeedEnabled', e.target.checked)}
                      />
                    </Field>
                    {s.variableSpeedEnabled && (
                  <>
                        <Field label="Min speed (ms)" tooltip="Fastest possible delay between characters when Human-like speed is on.">
                          <NumberInput size="small" min={1} max={2000} step={5} value={s.variableSpeedMin} onChange={onNumber('variableSpeedMin')} />
                        </Field>
                        <Field label="Max speed (ms)" tooltip="Slowest possible delay between characters when Human-like speed is on.">
                          <NumberInput size="small" min={1} max={2000} step={5} value={s.variableSpeedMax} onChange={onNumber('variableSpeedMax')} />
                        </Field>
                  </>
                )}
                  </>
                ),
              }),

              // ---------- Behavior ----------
              accordionItemBuilder({
                title: 'Behavior',
                children: (
                  <>
                    <Field
                      inline
                      label="Loop"
                      tooltip="When on, starts again from the first sentence after the last one. When off, the last sentence stays on screen."
                    >
                      <ToggleSwitch size="small" checked={s.loop} onChange={(e) => update('loop', e.target.checked)} />
                    </Field>
                    <Field
                      inline
                      label="Start when visible"
                      tooltip="Waits until the widget scrolls into view before typing starts, so visitors don't miss the animation."
                    >
                      <ToggleSwitch size="small" checked={s.startOnVisible} onChange={(e) => update('startOnVisible', e.target.checked)} />
                    </Field>
                    <Field
                      inline
                      label="Reverse mode"
                      tooltip="Types each sentence backwards, starting from its last character."
                    >
                      <ToggleSwitch size="small" checked={s.reverseMode} onChange={(e) => update('reverseMode', e.target.checked)} />
                    </Field>
                  </>
                ),
              }),

              // ---------- Cursor ----------
              accordionItemBuilder({
                title: 'Cursor',
                children: (
                  <>
                    <Field inline label="Show cursor" tooltip="Shows a blinking cursor after the text.">
                      <ToggleSwitch size="small" checked={s.showCursor} onChange={(e) => update('showCursor', e.target.checked)} />
                    </Field>
                    {s.showCursor && (
                  <>
                        <Field
                          inline
                          label="Hide while typing"
                          tooltip="Hides the cursor while characters are being typed or deleted; it only appears during pauses."
                        >
                          <ToggleSwitch
                            size="small"
                            checked={s.hideCursorWhileTyping}
                            onChange={(e) => update('hideCursorWhileTyping', e.target.checked)}
                          />
                        </Field>
                        <Field label="Cursor character" tooltip="The symbol shown as the cursor after the text.">
                          <Dropdown
                            size="small"
                            selectedId={s.cursorCharacter}
                            options={CURSOR_OPTIONS.map(({ char, label }) => ({ id: char, value: `${char}   ${label}` }))}
                            onSelect={(option) => update('cursorCharacter', option.id as CursorOption)}
                          />
                        </Field>
                        <Field
                          label="Blink duration (s)"
                          tooltip="Seconds for the cursor to fade out (and the same to fade back in). Lower blinks faster."
                        >
                          <NumberInput
                            size="small"
                            min={0.1}
                            max={5}
                            step={0.1}
                            value={s.cursorBlinkDuration}
                            onChange={onNumber('cursorBlinkDuration')}
                          />
                        </Field>
                        <Field inline label="Cursor color" tooltip="Color of the cursor. Leave empty to match the text color.">
                          <Box gap="SP1" verticalAlign="middle">
                            <Swatch color={s.cursorColor} onClick={() => pickColor(s.cursorColor, (c) => update('cursorColor', c))} />
                            {s.cursorColor && (
                              <TextButton size="small" onClick={() => update('cursorColor', '')}>
                                Clear
                              </TextButton>
                            )}
                          </Box>
                        </Field>
                  </>
                )}
                  </>
                ),
              }),

              // ---------- Style ----------
              accordionItemBuilder({
                title: 'Style',
                children: (
                  <>
                    <Field inline label="Text color" tooltip={`Default color of the text. Overridden by ${isWordMode ? 'Word color and Word colors' : 'Sentence colors'} when set.`}>
                      <Swatch color={s.textColor} onClick={() => pickColor(s.textColor, (c) => update('textColor', c))} />
                    </Field>
                    <Field
                      label={isWordMode ? 'Word colors' : 'Sentence colors'}
                      tooltip={
                        isWordMode
                          ? 'Give each rotating word its own color. Colors are used in order and repeat if there are more words than colors. Overrides Word color.'
                          : 'Give each sentence its own color. Colors are used in order and repeat if there are more sentences than colors. Leave empty to use Text color.'
                      }
                    >
                      <Box direction="vertical" gap="SP1">
                        <Box gap="SP1" style={{ flexWrap: 'wrap' }}>
                          {s.textColors.map((color, i) => (
                            <Box key={i} direction="vertical" align="center" gap="SP0">
                              <Swatch
                                color={color}
                                onClick={() =>
                                  pickColor(color, (c) => update('textColors', s.textColors.map((old, j) => (j === i ? c : old))))
                                }
                              />
                              <TextButton
                                size="tiny"
                                onClick={() => update('textColors', s.textColors.filter((_, j) => j !== i))}
                              >
                                Remove
                              </TextButton>
                            </Box>
                          ))}
                        </Box>
                        <TextButton
                          size="small"
                          onClick={() => pickColor(s.textColor, (c) => update('textColors', [...s.textColors, c]))}
                        >
                          + Add color
                        </TextButton>
                      </Box>
                    </Field>
                    <Field label="Font" tooltip="Opens the Editor font picker to choose the font family and style.">
                      <Box direction="vertical" gap="SP1">
                        <Button
                          size="small"
                          priority="secondary"
                          onClick={() =>
                            inputs.selectFont(s.font ? { font: s.font, textDecoration: s.textDecoration } : undefined, {
                              onChange: (value) => {
                                update('font', value.font);
                                update('textDecoration', value.textDecoration || '');
                              },
                            }).catch((error) => console.error('Failed to open the font picker:', error))
                          }
                        >
                          Change font
                        </Button>
                        {s.font && (
                          <TextButton size="small" onClick={() => {
                            update('font', '');
                            update('textDecoration', '');
                          }}>
                            Use site default
                          </TextButton>
                        )}
                      </Box>
                    </Field>
                    <Field label={`Font size (${s.fontSize}px)`} tooltip="Size of the text in pixels. Overrides the size chosen in the font picker.">
                      <Slider
                        min={10}
                        max={120}
                        step={1}
                        value={s.fontSize}
                        displayMarks={false}
                        onChange={(value) => update('fontSize', Array.isArray(value) ? value[0] : value)}
                      />
                    </Field>
                    <Field label="Alignment" tooltip="Horizontal alignment of the text inside the widget.">
                      <SegmentedToggle
                        size="small"
                        selected={s.textAlign}
                        onClick={(_, value) => update('textAlign', value as AlignOption)}
                      >
                        {ALIGN_OPTIONS.map((align) => (
                          <SegmentedToggle.Button key={align} value={align}>
                            {align[0].toUpperCase() + align.slice(1)}
                          </SegmentedToggle.Button>
                        ))}
                      </SegmentedToggle>
                    </Field>
                  </>
                ),
              }),
            ]}
          />
        </SidePanel.Content>
        <SidePanel.Footer>
          <Box align="space-between" verticalAlign="middle">
            <TextButton size="small" onClick={resetAll}>
              Reset to defaults
            </TextButton>
          </Box>
        </SidePanel.Footer>
      </SidePanel>
    </WixDesignSystemProvider>
  );
};

export default Panel;
