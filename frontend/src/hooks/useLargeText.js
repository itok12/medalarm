import { useEffect, useState } from 'react';

// Android's font-size setting scales the WebView's root font size (16px at 100%).
// Treat 125% and above as "large text" so dense layouts can adapt.
const LARGE_TEXT_ROOT_PX = 20;

function readRootFontPx() {
  if (typeof window === 'undefined') return 16;
  return parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
}

export default function useLargeText() {
  const [large, setLarge] = useState(() => readRootFontPx() >= LARGE_TEXT_ROOT_PX);

  useEffect(() => {
    const update = () => setLarge(readRootFontPx() >= LARGE_TEXT_ROOT_PX);
    // The WebView re-lays out when the system font scale changes.
    window.addEventListener('resize', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.removeEventListener('resize', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return large;
}
