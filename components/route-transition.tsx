'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';

type Mode = 'splash' | 'quiet';

// Programmatic navigations (router.push) announce themselves. `quiet` is for small moves
// inside the shop (filters from a brand page): progress line only, no brand moment.
export function startNavigation(mode: Mode = 'splash') {
  window.dispatchEvent(new CustomEvent<Mode>('soluna:navigate', { detail: mode }));
}

// The choreography needs ~680ms before it can leave; the exit takes ~320ms (≈ 1s total).
// If the page arrives earlier, nothing waits longer than the choreography itself; if the
// page is slower, the scene simply holds (breathing) until it has actually rendered.
const EXIT_AFTER_MS = 680;
const EXIT_AFTER_REDUCED_MS = 240;
const EXIT_MS = 340;
const SAFETY_MS = 8000;

// Droplets thrown from the bottle's base: [x px, peak y px, landing y px, size px, delay ms].
// Fixed values: identical on server and client, no per-frame JavaScript.
const drops: [number, number, number, number, number][] = [
  [-150, -120, -40, 6, 0], [-112, -176, -70, 4, 30], [-78, -210, -118, 5, 60], [-46, -150, -96, 3, 20],
  [-22, -236, -170, 4, 80], [18, -198, -150, 3, 40], [44, -244, -178, 5, 10], [76, -168, -104, 4, 70],
  [108, -214, -120, 6, 30], [146, -138, -52, 4, 50], [-188, -72, 6, 3, 90], [192, -80, 10, 3, 60],
];

export function RouteTransition() {
  const pathname = usePathname();
  const committed = useRef(pathname);
  const [phase, setPhase] = useState<'idle' | 'play' | 'exit'>('idle');
  const [run, setRun] = useState(0);
  const [quiet, setQuiet] = useState(false);
  const phaseRef = useRef<'idle' | 'play' | 'exit'>('idle');
  const startedAt = useRef(0);
  const timers = useRef<number[]>([]);
  const readyRef = useRef<() => void>(() => {});

  useEffect(() => {
    const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
    const clear = () => { timers.current.forEach(window.clearTimeout); timers.current = []; };
    const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    const setP = (next: 'idle' | 'play' | 'exit') => { phaseRef.current = next; setPhase(next); };

    const exit = () => {
      if (phaseRef.current !== 'play') return;
      setP('exit');
      later(() => setP('idle'), EXIT_MS);
    };

    const begin = (mode: Mode) => {
      // From the first in-site navigation on, pages enter with the short entrance.
      document.documentElement.dataset.navigated = '';
      if (mode === 'quiet') {
        if (phaseRef.current === 'idle') { setQuiet(true); later(() => setQuiet(false), SAFETY_MS); }
        return;
      }
      if (phaseRef.current !== 'idle') return;
      clear();
      startedAt.current = performance.now();
      setRun((value) => value + 1);
      setP('play');
      later(exit, SAFETY_MS);
    };

    // Called when the new route has rendered.
    const ready = () => {
      setQuiet(false);
      if (phaseRef.current !== 'play') return;
      const min = reduced() ? EXIT_AFTER_REDUCED_MS : EXIT_AFTER_MS;
      // A short beat so the new page has painted under the veil: never a white frame.
      const wait = Math.max(60, min - (performance.now() - startedAt.current));
      later(exit, wait);
    };
    readyRef.current = ready;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      // Small moves inside the catalogue (category row, brand chips) stay quiet.
      begin(anchor.closest('[data-nav-quiet]') ? 'quiet' : 'splash');
    };
    // Back/forward should feel instant: quiet.
    const onPop = () => { if (location.pathname !== committed.current) begin('quiet'); };
    const onProgrammatic = (event: Event) => begin((event as CustomEvent<Mode>).detail ?? 'splash');

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPop);
    window.addEventListener('soluna:navigate', onProgrammatic);
    return () => {
      clear();
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('soluna:navigate', onProgrammatic);
    };
  }, []);

  // The new route has rendered.
  useEffect(() => {
    if (pathname === committed.current) return;
    committed.current = pathname;
    const task = window.setTimeout(() => readyRef.current(), 0);
    return () => window.clearTimeout(task);
  }, [pathname]);

  return (
    <>
      <div className="route-feedback" data-pending={quiet || undefined} aria-hidden="true" />
      <div className="rt" data-phase={phase} aria-hidden="true">
        <div className="rt-veil" />
        {/* Remounted per navigation so every keyframe starts from zero. */}
        <div className="rt-stage" key={run}>
          <span className="rt-glow" />
          <div className="rt-bottle">
            <img src="/images/transition-bottle.webp" width="480" height="570" alt="" decoding="async" fetchPriority="low" />
            <span className="rt-sheen" />
          </div>
          <div className="rt-splash">
            <span className="rt-ring" />
            <span className="rt-ring rt-ring-late" />
            {drops.map(([x, peak, land, size, delay], i) => (
              <i
                key={i}
                style={{ '--x': `${x}px`, '--peak': `${peak}px`, '--land': `${land}px`, '--size': `${size}px`, '--delay': `${delay}ms` } as CSSProperties}
              />
            ))}
          </div>
          <img className="rt-logo" src="/soluna-logo-light.webp" width="720" height="453" alt="" decoding="async" />
        </div>
      </div>
    </>
  );
}
