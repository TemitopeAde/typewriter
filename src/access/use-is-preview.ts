import { useEffect, useState } from 'react';
import { window as wixWindow } from '@wix/site-window';

// Editor and Preview let owners try the animation; Site remains gated.
// Resolved once per page; failures keep the live-site access check in place.
let previewPromise: Promise<boolean> | undefined;
const checkPreview = () =>
  (previewPromise ??= wixWindow.viewMode().then((mode) => mode === 'Preview' || mode === 'Editor', () => false));

export function useIsEditorOrPreview() {
  const [isPreview, setIsPreview] = useState(false);
  useEffect(() => {
    let active = true;
    void checkPreview().then((value) => { if (active) setIsPreview(value); });
    return () => { active = false; };
  }, []);
  return isPreview;
}
