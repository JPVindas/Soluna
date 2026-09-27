'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { ResponsiveImage } from './responsive-image';

// Total length of the CSS timeline in app/intro.css (keep in sync).
const INTRO_MS = 1723;
// Reveal immediately at the end; the underlying content has no delayed entrance.
const SETTLE_MS = 0;

// Deterministic pseudo-random values: identical on server and client, no hydration drift.
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}
const random = seeded(20260926);
const between = (min: number, max: number) => Math.round(min + random() * (max - min));

// Fine atomizer droplets travel from the nozzle and settle into the logo;
// a few large, soft "bokeh" droplets drift behind them for depth.
const droplets = Array.from({ length: 22 }, (_, i) => ({
  ox: between(-150, 150), oy: between(-56, 56),
  bx: between(-70, 70), by: between(-60, 40),
  size: i < 17 ? between(15, 34) / 10 : between(10, 22),
  delay: between(0, 260), duration: between(820, 1120),
  soft: i >= 17,
}));

export function PerfumeIntro() {
  const pathname = usePathname();
  // Decided once: the intro belongs to the first landing on the home page only.
  const [active, setActive] = useState(pathname === '/');
  const [leaving, setLeaving] = useState(false);
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    // The inline head script already decided (session, reduced motion, route).
    // CSS already hides it in that case; unmount on the next tick.
    if (root.dataset.intro !== 'on') {
      const timer = window.setTimeout(() => setActive(false), 0);
      return () => window.clearTimeout(timer);
    }
    try { sessionStorage.setItem('soluna-intro', '1'); } catch {}

    // The CSS timeline may still be waiting for the photograph (html[data-intro-wait]),
    // so the end is taken from the animation itself, not from a timer set at hydration.
    const life = scene.current?.getAnimations().find((a) => (a as CSSAnimation).animationName === 'intro-life');
    const timers: number[] = [];
    const settle = () => { root.dataset.intro = 'done'; setActive(false); };
    timers.push(window.setTimeout(settle, INTRO_MS + 650));
    const onEnd = (event: AnimationEvent) => {
      if (event.animationName === 'intro-life') timers.push(window.setTimeout(settle, SETTLE_MS));
    };
    const node = scene.current;
    node?.addEventListener('animationend', onEnd);
    if (life?.playState === 'finished') timers.push(window.setTimeout(settle, SETTLE_MS));

    // Never hold the visitor: any intent to act ends the intro in 200ms.
    const skip = () => {
      if (Number(life?.currentTime ?? INTRO_MS) > INTRO_MS - 450) return;
      root.dataset.intro = 'done';
      setLeaving(true);
      timers.push(window.setTimeout(() => setActive(false), 220));
    };
    const options = { once: true, passive: true } as const;
    window.addEventListener('pointerdown', skip, options);
    window.addEventListener('wheel', skip, options);
    window.addEventListener('touchstart', skip, options);
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      node?.removeEventListener('animationend', onEnd);
      timers.forEach(window.clearTimeout);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchstart', skip);
      window.removeEventListener('keydown', skip);
    };
  }, [active]);

  if (!active) return null;
  return (
    <div ref={scene} className={`soluna-intro${leaving ? ' is-leaving' : ''}`} aria-hidden="true">
      <div className="intro-ground" />
      {/* Same image, classes and sizes as the first hero scene: one download, and the
          last frame of the intro is pixel-identical to the hero underneath. */}
      <div className="home-hero-media intro-media">
        <div className="home-hero-scene is-active">
          <ResponsiveImage src="/images/hero-soluna-signature.webp" alt="" priority sizes="100vw" />
        </div>
      </div>
      <div className="intro-vignette" />
      <div className="intro-sweep" />
      <div className="intro-veil" />
      <div className="intro-spray">
        <span className="intro-flash" />
        <span className="intro-cone" />
        {droplets.map((drop, i) => (
          <i
            key={i}
            className={drop.soft ? 'intro-drop is-soft' : 'intro-drop'}
            style={{
              '--ox': `${drop.ox}px`, '--oy': `${drop.oy}px`,
              '--bx': `${drop.bx}px`, '--by': `${drop.by}px`,
              '--s': `${drop.size}px`, '--t': `${drop.delay}ms`, '--d': `${drop.duration}ms`,
            } as CSSProperties}
          />
        ))}
      </div>
      <div className="intro-bloom" />
      <div className="intro-logo">
        <div className="intro-logo-mark">
          <img src="/soluna-logo-light.webp" width="720" height="453" alt="" decoding="sync" fetchPriority="high" />
          <span className="intro-gleam" />
        </div>
        <span className="intro-rule" />
      </div>
    </div>
  );
}
