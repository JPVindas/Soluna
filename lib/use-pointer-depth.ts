'use client';
import { useEffect, type RefObject } from 'react';

// [selector inside the surface, max x offset px, max y offset px]; negative = moves against the cursor.
export type DepthLayer = [selector: string, x: number, y: number];

// Pointer depth for marketing surfaces (hero, bestsellers). Each layer is offset toward
// (or against) the cursor with an eased follow, never 1:1, and returns to rest when the
// pointer leaves. Offsets are written straight to each layer's `translate` (independent of
// any `transform` transition): no inherited custom properties, so no subtree style recalc.
// Only for a precise pointer on wide screens in the full motion tier, only while the
// surface is on screen, never under the brand intro; the loop stops once settled.
export function usePointerDepth(ref: RefObject<HTMLElement | null>, layers: DepthLayer[], follow = 0.09) {
  const key = JSON.stringify(layers);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const capable = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)');
    if (!capable.matches || document.documentElement.dataset.motion !== 'full') return;
    const spec = JSON.parse(key) as DepthLayer[];
    let raf = 0; let tx = 0; let ty = 0; let x = 0; let y = 0; let visible = false;
    const paint = () => {
      for (const [selector, mx, my] of spec) {
        const value = `${(x * mx).toFixed(2)}px ${(y * my).toFixed(2)}px`;
        el.querySelectorAll<HTMLElement>(selector).forEach((node) => { node.style.translate = value; });
      }
    };
    const tick = () => {
      x += (tx - x) * follow;
      y += (ty - y) * follow;
      paint();
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(tick); };
    const move = (event: PointerEvent) => {
      // Stay at rest under the brand intro so its last frame still matches the hero exactly.
      if (document.documentElement.dataset.intro === 'on') return;
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((event.clientX - r.left) / r.width - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, ((event.clientY - r.top) / r.height - 0.5) * 2));
      kick();
    };
    const leave = () => { tx = 0; ty = 0; kick(); };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) { cancelAnimationFrame(raf); raf = 0; }
    });
    io.observe(el);
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [ref, key, follow]);
}
