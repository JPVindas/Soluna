'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from './language-provider';

// A single-line strip that is interactive everywhere: native swipe on touch; on desktop,
// arrows plus drag-to-scroll with a little momentum (the release velocity is projected
// forward, then native smooth scroll settles it). Edge fades appear only where there is
// more to see. The active item is brought into view on arrival. Vertical wheel is never
// hijacked: the page keeps scrolling normally.
export function ScrollStrip({ className, label, children, ...rest }: { className: string; label: string; children: ReactNode } & Record<`data-${string}`, unknown>) {
  const { t } = useLanguage();
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  const measure = () => {
    const el = track.current;
    if (!el) return;
    const start = el.scrollLeft <= 2;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  };

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    // Bring the current brand into view without moving the page.
    const current = el.querySelector<HTMLElement>('[aria-current]');
    if (current) el.scrollLeft = Math.max(0, current.offsetLeft - el.offsetLeft - el.clientWidth / 2 + current.offsetWidth / 2);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Mouse drag with momentum; a drag never turns into a click on a link.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let down = false; let moved = false; let startX = 0; let startScroll = 0;
    let lastX = 0; let lastT = 0; let velocity = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = lastX = e.clientX; startScroll = el.scrollLeft; lastT = performance.now(); velocity = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; el.setPointerCapture(e.pointerId); el.dataset.dragging = ''; }
      if (!moved) return;
      const now = performance.now();
      velocity = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX; lastT = now;
      el.scrollLeft = startScroll - dx;
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      if (!moved) return;
      delete el.dataset.dragging;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      // Momentum: project the release velocity forward (decelerating), then glide there.
      const projected = (velocity * 1000 * 0.998) / (1 - 0.998) / 1000;
      if (Math.abs(projected) > 8) el.scrollBy({ left: -projected, behavior: 'smooth' });
    };
    // Window capture runs before any other listener (including navigation feedback).
    const onClick = (e: MouseEvent) => {
      if (!moved || !el.contains(e.target as Node)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      moved = false;
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    window.addEventListener('click', onClick, true);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      window.removeEventListener('click', onClick, true);
    };
  }, []);

  const page = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  return (
    <div className="strip" data-at-start={edge.start || undefined} data-at-end={edge.end || undefined}>
      <button type="button" className="strip-arrow is-prev" onClick={() => page(-1)} disabled={edge.start} aria-label={t(`${label}: anteriores`, `${label}: previous`)}>
        <ChevronLeft size={18} strokeWidth={1.5} />
      </button>
      <div ref={track} className={`strip-track ${className}`} onScroll={measure} {...rest}>
        {children}
      </div>
      <button type="button" className="strip-arrow is-next" onClick={() => page(1)} disabled={edge.end} aria-label={t(`${label}: siguientes`, `${label}: next`)}>
        <ChevronRight size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}
