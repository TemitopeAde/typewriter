// The app's real settings panel. ?open=<section title> opens a section, ?scroll=<px> scrolls the panel.
import React from 'react';
import { createRoot } from 'react-dom/client';
import Panel from '../../src/extensions/site/widgets/typewriter-text/typewriter-text.panel';

const params = new URLSearchParams(location.search);
createRoot(document.getElementById('root')!).render(<Panel />);

const open = params.get('open');
const scroll = Number(params.get('scroll') ?? 0);
const leafWithText = (text: string) =>
  [...document.querySelectorAll<HTMLElement>('body *')].find((el) => el.children.length === 0 && el.textContent?.trim() === text);

const settle = () => {
  if (open) leafWithText(open)?.click();
  setTimeout(() => {
    const scroller = [...document.querySelectorAll<HTMLElement>('body *')].find(
      (el) => el.scrollHeight > el.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(el).overflowY),
    );
    if (scroller) scroller.scrollTop = scroll;
  }, 400);
};
// Wait for the panel to load its settings (one async round) before opening a section.
const wait = setInterval(() => {
  if (leafWithText('Content')) {
    clearInterval(wait);
    setTimeout(settle, 200);
  }
}, 50);
