'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from './language-provider';
import { ResponsiveImage } from './responsive-image';
import { ProductPhoto } from './product-photo';
import variants from '@/lib/image-variants.json';
import { products, menProducts, womenProducts, type Product } from '@/lib/catalog';

type Mode = 'splash' | 'quiet';
type Destination = 'home' | 'him' | 'her' | 'favourites' | 'catalogue';

// Programmatic navigations (router.push) announce themselves. `quiet` is for small moves
// inside the shop (filters from a brand page): progress line only.
export function startNavigation(mode: Mode = 'splash', href?: string) {
  window.dispatchEvent(new CustomEvent<{ mode: Mode; href?: string }>('soluna:navigate', { detail: { mode, href } }));
}

// "The section arrives before the page": the destination's own scene rises from the bottom
// at once, then lifts away to reveal the page (whose hero, for Hombre/Mujer/Inicio, is the
// very same photograph, so the handoff has no cut). The rise needs ~520ms before it can
// leave; the exit takes ~520ms. If the page is ready earlier nothing waits longer; if it is
// slower, the scene simply holds until it has actually rendered.
const EXIT_AFTER_MS = 520;
const EXIT_AFTER_REDUCED_MS = 200;
const EXIT_MS = 560;
const SAFETY_MS = 8000;

const destinationOf = (path: string): Destination | null => {
  if (path === '/') return 'home';
  if (path === '/hombre' || path.startsWith('/hombre/')) return 'him';
  if (path === '/mujer' || path.startsWith('/mujer/')) return 'her';
  if (path === '/mas-vendidos') return 'favourites';
  if (path === '/perfumes') return 'catalogue';
  return null;
};

const scenes: Partial<Record<Destination, string>> = {
  home: '/images/hero-soluna-signature.webp',
  him: '/images/hero-gold-splash.png',
  her: '/images/hero-rose.png',
};
const pick = (ids: string[]) => ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);
const lineups: Partial<Record<Destination, Product[]>> = {
  favourites: products.filter((p) => p.bestseller).slice(0, 5),
  catalogue: pick(['men-jean-paul-gaultier-le-male-elixir', 'coco-mademoiselle', 'libre', 'acqua', 'jadore']),
};

// Warm the destination's images on intent (hover / touch), so the scene is ready on click.
const warmed = new Set<string>();
function warm(dest: Destination) {
  const urls: string[] = [];
  const scene = scenes[dest];
  if (scene) {
    const list = (variants as Record<string, { variants: { src: string; width: number }[] }>)[scene]?.variants ?? [];
    const target = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
    const best = list.find((v) => v.width >= target) ?? list[list.length - 1];
    if (best) urls.push(best.src);
  }
  for (const p of lineups[dest] ?? []) {
    const list = p.image ? (variants as Record<string, { variants: { src: string; width: number }[] }>)[p.image]?.variants : undefined;
    if (list?.[0]) urls.push(list[0].src);
  }
  for (const url of urls) {
    if (warmed.has(url)) continue;
    warmed.add(url);
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  }
}

export function RouteTransition() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const committed = useRef(pathname);
  const [phase, setPhase] = useState<'idle' | 'play' | 'exit'>('idle');
  const [dest, setDest] = useState<Destination>('home');
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

    const begin = (mode: Mode, href?: string) => {
      // From the first in-site navigation on, pages enter with the short entrance.
      document.documentElement.dataset.navigated = '';
      const target = href ? destinationOf(new URL(href, location.href).pathname) : null;
      if (mode === 'quiet' || !target) {
        if (phaseRef.current === 'idle') { setQuiet(true); later(() => setQuiet(false), SAFETY_MS); }
        return;
      }
      if (phaseRef.current !== 'idle') return;
      clear();
      warm(target);
      startedAt.current = performance.now();
      setDest(target);
      setRun((value) => value + 1);
      setP('play');
      later(exit, SAFETY_MS);
    };

    const ready = () => {
      setQuiet(false);
      if (phaseRef.current !== 'play') return;
      const min = reduced() ? EXIT_AFTER_REDUCED_MS : EXIT_AFTER_MS;
      // A short beat so the new page has painted under the panel: never a white frame.
      later(exit, Math.max(60, min - (performance.now() - startedAt.current)));
    };
    readyRef.current = ready;

    const anchorOf = (event: Event) => (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = anchorOf(event);
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      // Small moves inside the catalogue (category row, brand chips) stay quiet.
      begin(anchor.closest('[data-nav-quiet]') ? 'quiet' : 'splash', url.href);
    };
    const onIntent = (event: Event) => {
      const anchor = anchorOf(event);
      if (!anchor || anchor.closest('[data-nav-quiet]')) return;
      const url = new URL(anchor.href, location.href);
      const target = url.origin === location.origin && url.pathname !== location.pathname ? destinationOf(url.pathname) : null;
      if (target) warm(target);
    };
    // Back/forward should feel instant: quiet.
    const onPop = () => { if (location.pathname !== committed.current) begin('quiet'); };
    const onProgrammatic = (event: Event) => {
      const detail = (event as CustomEvent<{ mode: Mode; href?: string }>).detail;
      begin(detail?.mode ?? 'splash', detail?.href);
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('touchstart', onIntent, { passive: true });
    window.addEventListener('popstate', onPop);
    window.addEventListener('soluna:navigate', onProgrammatic);
    return () => {
      clear();
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('pointerover', onIntent);
      document.removeEventListener('touchstart', onIntent);
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

  const copy: Record<Destination, { kicker: string; title: string; accent: string; count: number }> = {
    home: { kicker: 'Soluna Fragrance', title: t('Fragancias que dejan', 'Fragrances that leave an'), accent: t('huella.', 'impression.'), count: products.length },
    him: { kicker: t('Colección', 'Collection'), title: t('Perfumes de', 'Fragrances for'), accent: t('hombre.', 'him.'), count: menProducts.length },
    her: { kicker: t('Colección', 'Collection'), title: t('Perfumes de', 'Fragrances for'), accent: t('mujer.', 'her.'), count: womenProducts.length },
    favourites: { kicker: t('Selección Soluna', 'The Soluna selection'), title: t('Los', 'The'), accent: t('favoritos.', 'favourites.'), count: products.filter((p) => p.bestseller).length },
    catalogue: { kicker: t('Todas las casas', 'Every house'), title: t('Todo el', 'The whole'), accent: t('catálogo.', 'catalogue.'), count: products.length },
  };
  const scene = scenes[dest];
  const lineup = lineups[dest];
  const text = copy[dest];
  const active = phase !== 'idle';

  return (
    <>
      <div className="route-feedback" data-pending={quiet || undefined} aria-hidden="true" />
      <div className="rt" data-phase={phase} data-dest={dest} data-kind={lineup ? 'lineup' : 'scene'} aria-hidden="true">
        {active && (
          <div className="rt-panel" key={run}>
            {scene && (
              <div className="rt-scene">
                <ResponsiveImage src={scene} alt="" priority sizes="100vw" />
              </div>
            )}
            {lineup && (
              <div className="rt-lineup">
                {lineup.map((p, i) => (
                  <span key={p.id} className="rt-item" style={{ '--i': i } as CSSProperties}>
                    <ProductPhoto product={p} sizes="(max-width: 640px) 30vw, 16vw" />
                  </span>
                ))}
              </div>
            )}
            <div className="rt-copy">
              <img className="rt-mark" src="/soluna-logo-light.webp" width="720" height="453" alt="" decoding="async" />
              <span className="rt-kicker">{text.kicker}</span>
              <strong className="rt-title"><span>{text.title} <em>{text.accent}</em></span></strong>
              <span className="rt-count">{text.count} {t('fragancias', 'fragrances')}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
