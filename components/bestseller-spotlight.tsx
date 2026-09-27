'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useLanguage } from './language-provider';
import { ProductPhoto } from './product-photo';
import { money, type Cart, type Product } from '@/lib/catalog';
import { concentrationOf } from '@/lib/catalog-filters';
import { usePointerDepth } from '@/lib/use-pointer-depth';

// Each bestseller gets its own light: the whole stage takes the tint of the bottle.
const tints: Record<string, string> = {
  bleu: '#dde2e8',
  sauvage: '#e0e4e8',
  acqua: '#e2e2dc',
  'good-girl': '#e5e1ea',
  'black-opium': '#e9e0de',
};

type Props = {
  items: Product[];
  cart: Cart;
  onAdd: (id: string) => void;
  onDetail: (product: Product, source?: HTMLElement | null) => void;
};

// "The ones everybody wants": one bottle at a time, large and lit, with an index of the five.
// Desktop: slides are stacked and cross over (direction-aware). Phone: the same slides become a
// native scroll-snap carousel, so swipe, momentum and snapping are the platform's own.
export function BestsellerSpotlight({ items, cart, onAdd, onDetail }: Props) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLElement>(null);
  const count = items.length;

  const isCarousel = () => {
    const el = track.current;
    return !!el && el.scrollWidth > el.clientWidth + 4;
  };

  const go = useCallback((index: number) => {
    const next = (index + count) % count;
    setActive(next);
    const el = track.current;
    if (el && el.scrollWidth > el.clientWidth + 4) {
      const slide = el.children[next] as HTMLElement | undefined;
      el.scrollTo({
        left: slide ? slide.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft || '0') : 0,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    }
  }, [count]);

  // Carousel mode: the slide nearest the start edge is the active one.
  const frame = useRef(0);
  function onScroll() {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const el = track.current;
      if (!el || !isCarousel()) return;
      const first = el.children[0] as HTMLElement | undefined;
      const second = el.children[1] as HTMLElement | undefined;
      const step = first && second ? second.offsetLeft - first.offsetLeft : el.clientWidth;
      const index = Math.max(0, Math.min(count - 1, Math.round(el.scrollLeft / step)));
      setActive((current) => (current === index ? current : index));
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = (active + (event.key === 'ArrowRight' ? 1 : -1) + count) % count;
    go(next);
    // Focus follows the selection when moving through the index (roving focus).
    const list = event.currentTarget.closest('.spot-index');
    list?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
  }

  // Desktop pointer depth: the bottle leans toward the cursor, its light the other way.
  usePointerDepth(stage, [['.spot-media .product-image', 10, 7], ['.spot-light', -16, -12]]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  if (!count) return null;
  const tint = tints[items[active]?.id] ?? 'var(--paper-2)';
  const concentration = (p: Product) => ({ edp: 'Eau de Parfum', edt: 'Eau de Toilette', parfum: 'Parfum', '': '' })[concentrationOf(p)];

  return (
    <section className="spot" id="coleccion" tabIndex={-1} aria-labelledby="spot-title" style={{ '--tint': tint, '--active': active } as CSSProperties}>
      <div className="spot-inner">
        <header className="spot-head" data-reveal>
          <p className="eyebrow">{t('Los más vendidos', 'Bestsellers')}</p>
          <h2 id="spot-title">{t('Los que', 'The ones')} <em>{t('todos quieren.', 'everyone wants.')}</em></h2>
          <Link className="text-link" href="/mas-vendidos">{t('Ver los favoritos', 'See all favourites')}<ArrowUpRight size={16} aria-hidden="true" /></Link>
        </header>

        <section
          className="spot-stage"
          ref={stage}
          aria-roledescription={t('carrusel', 'carousel')}
          aria-label={t('Los perfumes más vendidos', 'Bestselling fragrances')}
        >
          <div className="spot-rank" aria-hidden="true">
            <span className="spot-rank-label">N.º</span>
            <span className="spot-rank-window">
              <span className="spot-rank-digits">
                {items.map((p, i) => <span key={p.id}>{String(i + 1).padStart(2, '0')}</span>)}
              </span>
            </span>
            <span className="spot-rank-total">/ {String(count).padStart(2, '0')}</span>
          </div>

          <div className="spot-track" ref={track} onScroll={onScroll}>
            {items.map((p, i) => {
              const inCart = cart[p.id] ?? 0;
              const place = i === active ? 'is-active' : i < active ? 'is-before' : 'is-after';
              return (
                <article
                  key={p.id}
                  className={`spot-slide ${place}`}
                  aria-roledescription={t('diapositiva', 'slide')}
                  aria-label={`${i + 1} ${t('de', 'of')} ${count}: ${p.name}`}
                >
                  <button
                    type="button"
                    className="spot-media"
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={(e) => (i === active ? onDetail(p, e.currentTarget) : go(i))}
                  >
                    <span className="spot-light" />
                    <ProductPhoto product={p} eager={i === 0} sizes="(max-width: 899px) 78vw, 46vw" />
                    <span className="spot-floor" />
                  </button>
                  <div className="spot-info">
                    <p className="spot-brand">{p.brand}</p>
                    <h3 className="spot-name"><span>{p.name}</span></h3>
                    <p className="spot-meta">{[concentration(p), p.size].filter(Boolean).join(' · ') || t('Perfume original', 'Authentic fragrance')}</p>
                    <p className="spot-price">{p.price === null ? t('Consultar precio', 'Price on request') : money(p.price)}</p>
                    <div className="spot-actions">
                      <button type="button" className="button button-ink" data-in-cart={inCart > 0 || undefined} onClick={() => onAdd(p.id)}>
                        <span key={inCart ? 'in' : 'out'}>{inCart ? t(`En tu carrito · ${inCart}`, `In your cart · ${inCart}`) : t('Agregar al carrito', 'Add to cart')}</span>
                        {inCart ? <Check size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
                      </button>
                      <button type="button" className="text-link" onClick={(e) => onDetail(p, e.currentTarget.closest('.spot-slide')?.querySelector<HTMLElement>('.spot-media'))}>
                        {t('Ver detalles', 'View details')}<ArrowUpRight size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="spot-arrows">
            <button type="button" onKeyDown={onKeyDown} onClick={() => go(active - 1)} aria-label={t('Perfume anterior', 'Previous fragrance')}><ChevronLeft size={20} strokeWidth={1.5} /></button>
            <button type="button" onKeyDown={onKeyDown} onClick={() => go(active + 1)} aria-label={t('Perfume siguiente', 'Next fragrance')}><ChevronRight size={20} strokeWidth={1.5} /></button>
          </div>
        </section>

        <ol className="spot-index" aria-label={t('Elegir perfume', 'Choose a fragrance')}>
          {items.map((p, i) => (
            <li key={p.id}>
              <button type="button" aria-current={i === active ? 'true' : undefined} onKeyDown={onKeyDown} onClick={() => go(i)}>
                <span className="spot-index-bar" aria-hidden="true" />
                <span className="spot-index-no">{String(i + 1).padStart(2, '0')}</span>
                <span className="spot-index-thumb" aria-hidden="true"><ProductPhoto product={p} sizes="56px" /></span>
                <span className="spot-index-name"><small>{p.brand}</small>{p.name}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
