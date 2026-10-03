// App Market listing images (1200x900). ?shot=<name> picks one. The widget is the app's real
// <typewriter-text> custom element and the panel is the real settings panel (panel.html).
import React, { createElement, type CSSProperties, type FC, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import TypewriterElement from '../../src/extensions/site/widgets/typewriter-text/typewriter-text';
import { DEFAULTS, serialize, toAttr, type TypewriterSettings } from '../../src/extensions/site/widgets/typewriter-text/config';

customElements.define('typewriter-text', TypewriterElement as unknown as CustomElementConstructor);

// Freeze each shot mid-typing: once the widget shows the target text, its pending timers are
// dropped, the cursor blink stops, and the cursor is shown fully.
const FREEZE_AT: Record<string, string> = {
  main: 'Headlines that type them',
  'site-word': 'webs',
  'site-sentences': 'Fresh roasts every mor',
  'settings-content': 'websi',
  'settings-style': 'Make something unex',
};
let frozen = false;
const realSetTimeout = window.setTimeout.bind(window);
window.setTimeout = ((fn: (...args: unknown[]) => void, ms?: number, ...args: unknown[]) =>
  realSetTimeout(() => { if (!frozen) fn(...args); }, ms)) as typeof window.setTimeout;
const target = FREEZE_AT[new URLSearchParams(location.search).get('shot') ?? 'main'];
const watch = setInterval(() => {
  const content = document.querySelector('.text-type__content');
  if (!target || content?.textContent !== target) return;
  frozen = true;
  clearInterval(watch);
  gsap.globalTimeline.pause();
  document.querySelectorAll<HTMLElement>('.text-type__cursor').forEach((el) => { el.style.opacity = '1'; });
}, 4);

const brand = { bg: '#151a21', text: '#f4f1ea', accent: '#8fe3cf', cursor: '#ffb86b', dots: '#444449', muted: '#6b6c72' };
const wds = { text: '#000624', secondary: '#44485f', divider: '#dfe5eb', stage: '#eceff3', primary: '#116dff' };
const siteFont = 'Madefor, "Helvetica Neue", Helvetica, Arial, sans-serif';
const serif = "600 40px/1.4 'Playfair Display', serif";
const violet = '#6b4eff';
const coral = '#f2613f';

type Settings = Partial<TypewriterSettings>;
const attrs = (s: Settings) => {
  const full = { ...DEFAULTS, ...s };
  return Object.fromEntries((Object.keys(s) as (keyof TypewriterSettings)[]).map((k) => [toAttr(k), serialize(full[k])]));
};

/** The real widget, sized like it is on the Wix stage. */
const Widget: FC<{ s: Settings; style?: CSSProperties }> = ({ s, style }) => (
  <div style={{ display: 'flex', ...style }}>{createElement('typewriter-text', { ...attrs(s), style: { display: 'block', width: '100%', height: '100%' } })}</div>
);

/** The real panel, in a frame so its 100vh fills the given height. */
const RealPanel: FC<{ s: Settings; open: string; scroll?: number; height: number }> = ({ s, open, scroll = 0, height }) => (
  <iframe
    title="panel"
    src={`panel.html?${new URLSearchParams({ props: JSON.stringify(attrs(s)), open, scroll: String(scroll) })}`}
    style={{ width: 300, height, border: 0, display: 'block' }}
  />
);

// ---------- Frame: caption + a window holding a 1280x720 scene scaled to 1080 wide.
const SCENE = { w: 1280, h: 720 };
const K = 1080 / SCENE.w;

const Caption: FC<{ title: string; accent: string; sub: string }> = ({ title, accent, sub }) => (
  <div style={{ position: 'absolute', left: 60, top: 58, width: 1080, fontFamily: 'Roboto, sans-serif', color: '#fff' }}>
    <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.4 }}>
      {title} <span style={{ color: brand.accent }}>{accent}</span>
    </div>
    <div style={{ marginTop: 12, fontSize: 22, color: '#c9cad0' }}>{sub}</div>
  </div>
);

const Window: FC<{ url?: string; children: ReactNode }> = ({ url, children }) => {
  const bar = url ? 36 : 0;
  return (
    <div style={{ position: 'absolute', left: 60, top: 196, width: 1080, height: SCENE.h * K + bar, borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 80px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.08)' }}>
      {url && (
        <div style={{ height: bar, background: '#f1f2f5', borderBottom: '1px solid #e1e3e8', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}>
          {['#ff6058', '#ffbd2e', '#28c940'].map((c) => <div key={c} style={{ width: 11, height: 11, borderRadius: 6, background: c }} />)}
          <div style={{ marginLeft: 14, width: 380, height: 22, borderRadius: 11, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 12px', font: '13px Roboto, sans-serif', color: '#6b6f80' }}>{url}</div>
        </div>
      )}
      <div style={{ position: 'relative', width: SCENE.w, height: SCENE.h, transform: `scale(${K})`, transformOrigin: '0 0', overflow: 'hidden' }}>{children}</div>
    </div>
  );
};

const Ground: FC<{ children: ReactNode }> = ({ children }) => <div style={{ position: 'relative', width: 1200, height: 900, background: brand.bg, overflow: 'hidden' }}>{children}</div>;

// ---------- Demo sites (made up).
const LUMEN_WORD: Settings = { sentenceTemplate: 'We build [websites] that feel alive.', words: ['brands', 'stories'], wordColor: violet, as: 'h1', fontSize: 56, textColor: '#1a1a1a' };

const LumenSite: FC<{ s: Settings; selected?: boolean; width: number }> = ({ s, selected, width }) => (
  <div style={{ width, background: '#fff', fontFamily: siteFont, color: '#1a1a1a' }}>
    <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: '1px solid #efece6' }}>
      <span style={{ fontWeight: 700, fontSize: 20 }}>Lumen Studio</span>
      <span style={{ display: 'flex', gap: 28, fontSize: 15, color: '#5c5c5c' }}>
        <span>Work</span><span>About</span><span>Journal</span><span>Contact</span>
      </span>
    </div>
    <div style={{ background: '#f7f4ef', padding: '56px 40px 64px', position: 'relative' }}>
      <div style={{ fontSize: 13, letterSpacing: 3, color: '#8a8478', fontWeight: 600, marginLeft: 16 }}>CREATIVE STUDIO</div>
      <div style={{ position: 'relative', marginTop: 18, height: 110 }}>
        <Widget s={s} style={{ height: '100%' }} />
        {selected && (
          <div style={{ position: 'absolute', inset: -1, border: `1px solid ${wds.primary}`, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', left: -1, top: -22, height: 21, padding: '0 8px', display: 'flex', alignItems: 'center', background: wds.primary, color: '#fff', font: '12px Roboto, sans-serif', borderRadius: '4px 4px 0 0' }}>Typewriter Text</div>
          </div>
        )}
      </div>
      <div style={{ marginTop: 22, marginLeft: 16, fontSize: 18, lineHeight: 1.6, color: '#5c5c5c', maxWidth: 520 }}>We design brands and websites for small teams with big plans.</div>
      <div style={{ marginTop: 26, marginLeft: 16, display: 'inline-flex', height: 46, padding: '0 26px', alignItems: 'center', background: '#1a1a1a', color: '#fff', fontSize: 16, fontWeight: 600, borderRadius: 23 }}>Start a project</div>
    </div>
    <div style={{ display: 'flex', gap: 20, padding: 32 }}>
      {['#e9e4ff', '#ffe3dc', '#d6f3f0'].map((c) => <div key={c} style={{ flex: 1, height: 220, borderRadius: 10, background: c }} />)}
    </div>
  </div>
);

const CAFE_SENTENCES: Settings = {
  mode: 'sentences',
  text: ['Fresh roasts every morning.', 'Slow coffee, warm bread.', 'Come in, stay a while.'],
  as: 'h1',
  font: serif,
  fontSize: 64,
  textAlign: 'center',
  textColor: '#fdf6ec',
  cursorCharacter: '▌',
  cursorColor: '#f2b84b',
};

const CafeSite: FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: '#fbf6ef', fontFamily: siteFont, color: '#2b211c' }}>
    <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 56px' }}>
      <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 26 }}>Harbor Coffee</span>
      <span style={{ display: 'flex', gap: 32, fontSize: 16, color: '#8a7a6c' }}>
        <span>Menu</span><span>Our beans</span><span>Visit</span><span>Order</span>
      </span>
    </div>
    <div style={{ margin: '0 40px', height: 420, borderRadius: 22, background: 'radial-gradient(80% 90% at 50% 0%, #5a4033 0%, #3b2a22 70%)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 82, width: '100%', textAlign: 'center', fontSize: 14, letterSpacing: 5, color: '#f2b84b', fontWeight: 600 }}>NEIGHBORHOOD ROASTERY · SINCE 2014</div>
      <Widget s={CAFE_SENTENCES} style={{ position: 'absolute', left: 60, right: 60, top: 122, height: 110 }} />
      <div style={{ position: 'absolute', top: 262, width: '100%', textAlign: 'center', fontSize: 18, color: '#d9c8b8' }}>Small-batch beans, roasted by the harbor and brewed with care.</div>
      <div style={{ position: 'absolute', top: 318, width: '100%', display: 'flex', justifyContent: 'center', gap: 16 }}>
        <div style={{ height: 46, padding: '0 28px', display: 'flex', alignItems: 'center', borderRadius: 23, background: '#f2b84b', fontSize: 16, fontWeight: 700 }}>See the menu</div>
        <div style={{ height: 46, padding: '0 28px', display: 'flex', alignItems: 'center', borderRadius: 23, border: '2px solid #d9c8b8', color: '#fdf6ec', fontSize: 16 }}>Find us</div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 24, margin: '28px 40px 0' }}>
      {['#ead9c6', '#d8c2a8', '#c4a98b'].map((c) => <div key={c} style={{ flex: 1, height: 200, borderRadius: 16, background: c }} />)}
    </div>
  </div>
);

// ---------- Editor-like stage around the real panel and widget.
const EditorStage: FC<{ s: Settings; open: string; scroll?: number }> = ({ s, open, scroll }) => (
  <div style={{ position: 'absolute', inset: 0, background: wds.stage }}>
    <div style={{ height: 48, background: '#fff', borderBottom: `1px solid ${wds.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px 0 20px', font: '14px Roboto, sans-serif', color: wds.text }}>
      <span style={{ display: 'flex', gap: 22 }}><b>Lumen Studio</b><span style={{ color: wds.secondary }}>Page: Home ▾</span></span>
      <span style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <span style={{ color: wds.primary }}>Preview</span>
        <span style={{ height: 32, padding: '0 18px', display: 'flex', alignItems: 'center', background: wds.primary, color: '#fff', borderRadius: 16 }}>Publish</span>
      </span>
    </div>
    <div style={{ position: 'absolute', left: 0, top: 48, bottom: 0, width: 56, background: '#fff', borderRight: `1px solid ${wds.divider}` }} />
    <div style={{ position: 'absolute', left: 84, top: 72, boxShadow: '0 1px 4px rgba(0,6,36,.08)' }}>
      <LumenSite s={s} selected width={840} />
    </div>
    <div style={{ position: 'absolute', left: 956, top: 60, borderRadius: 8, overflow: 'hidden', boxShadow: '0 6px 24px rgba(0,6,36,.14), 0 0 1px rgba(0,6,36,.3)' }}>
      <RealPanel s={s} open={open} scroll={scroll} height={648} />
    </div>
  </div>
);

// ---------- The images.
const Main: FC = () => (
  <Ground>
    <div style={{ position: 'absolute', left: 70, top: 170, width: 1060, height: 560, boxSizing: 'border-box', borderRadius: 32, background: 'rgba(255,255,255,.035)', border: '2px solid rgba(255,255,255,.07)', padding: '0 76px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 }}>
      <div style={{ position: 'absolute', left: 64, top: 58, display: 'flex', gap: 16 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ width: 20, height: 20, borderRadius: 10, background: brand.dots }} />)}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 64, color: brand.text, letterSpacing: -1 }}>Typewriter Animation</div>
      <Widget
        s={{ mode: 'sentences', text: ['Headlines that type themselves'], loop: false, font: "400 44px/1.3 'JetBrains Mono', monospace", fontSize: 44, textColor: brand.accent, cursorColor: brand.cursor, as: 'p' }}
        style={{ height: 80, marginLeft: -16 }}
      />
      <div style={{ position: 'absolute', right: 64, bottom: 52, fontFamily: "'JetBrains Mono', monospace", fontSize: 22, letterSpacing: '0.22em', color: brand.muted }}>TEXT EFFECT</div>
    </div>
  </Ground>
);

const SiteWord: FC = () => (
  <Ground>
    <Caption title="Rotate one" accent="word in your headline" sub="One sentence stays put while the highlighted word is typed, deleted and swapped." />
    <Window url="lumenstudio.com">
      <LumenSite s={LUMEN_WORD} width={SCENE.w} />
    </Window>
  </Ground>
);

const SiteSentences: FC = () => (
  <Ground>
    <Caption title="Or type" accent="whole sentences" sub="Cycle through lines in your own font, size and colors." />
    <Window url="harborcoffee.com">
      <CafeSite />
    </Window>
  </Ground>
);

const SettingsContent: FC = () => (
  <Ground>
    <Caption title="Set it up in" accent="the Editor" sub="Write your sentence, list the words to rotate and give them a color." />
    <Window>
      <EditorStage s={{ ...LUMEN_WORD, fontSize: 44 }} open="Content" />
    </Window>
  </Ground>
);

const SettingsStyle: FC = () => (
  <Ground>
    <Caption title="Make it" accent="match your site" sub="Speed, cursor, font, size, colors and alignment, all in one panel." />
    <Window>
      <EditorStage
        s={{ mode: 'sentences', text: ['Make something unexpected.', 'Great ideas start with a spark.'], textColors: [coral, violet], font: serif, fontSize: 48, textAlign: 'center', cursorCharacter: '█', cursorColor: coral }}
        open="Style"
        scroll={120}
      />
    </Window>
  </Ground>
);

// ---------- Real Wix Editor screenshots (screens/), cropped to the canvas and panel.
type Crop = { src: string; w: number; h: number; x: number; y: number; cw: number; ch: number };

const Screenshot: FC<{ crop: Crop }> = ({ crop }) => {
  const k = 1080 / crop.cw;
  return (
    <div style={{ position: 'absolute', left: 60, top: 196, width: 1080, height: Math.round(crop.ch * k), borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 80px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.08)' }}>
      <img src={crop.src} alt="" style={{ position: 'absolute', left: -crop.x * k, top: -crop.y * k, width: crop.w * k, height: crop.h * k }} />
    </div>
  );
};

const EDITOR_SECTIONS: Crop = { src: 'screens/editor-sections.png', w: 2352, h: 1240, x: 0, y: 40, cw: 2080, ch: 1200 };
const EDITOR_CONTENT: Crop = { src: 'screens/editor-content.png', w: 2880, h: 1552, x: 520, y: 205, cw: 2080, ch: 1280 };
const EDITOR_STYLE: Crop = { ...EDITOR_CONTENT, src: 'screens/editor-style.png' };

const RealSections: FC = () => (
  <Ground>
    <Caption title="Add it to" accent="any page" sub="Drop Typewriter Text on your site and open its settings right in the Editor." />
    <Screenshot crop={EDITOR_SECTIONS} />
  </Ground>
);

const RealContent: FC = () => (
  <Ground>
    <Caption title="Rotate one" accent="word in your headline" sub="Write your sentence and wrap the word to animate in [brackets]." />
    <Screenshot crop={EDITOR_CONTENT} />
  </Ground>
);

const RealStyle: FC = () => (
  <Ground>
    <Caption title="Make it" accent="match your site" sub="Pick text and word colors and a font that fit your design." />
    <Screenshot crop={EDITOR_STYLE} />
  </Ground>
);

const SHOTS: Record<string, FC> = {
  'real-sections': RealSections,
  'real-content': RealContent,
  'real-style': RealStyle, main: Main, 'site-word': SiteWord, 'site-sentences': SiteSentences, 'settings-content': SettingsContent, 'settings-style': SettingsStyle };
const Shot = SHOTS[new URLSearchParams(location.search).get('shot') ?? 'main'] ?? Main;
createRoot(document.getElementById('root')!).render(<Shot />);
