'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowUpRight, Menu, MessageCircle, Search, ShoppingBag, X } from 'lucide-react';

import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { useLanguage } from '@/components/language-provider';

type NavigationItem = {
  label: string;
  href: string;
  active: boolean;
  note?: string;
  desktop?: boolean;
};

// One header for every page. It floats over the dark opening image, turns into a
// solid bar once the page scrolls, and steps out of the way while reading downwards.
export function SiteNavigation({
  items,
  count,
  contactUrl,
  onSearch,
  onCart,
}: {
  items: NavigationItem[];
  count: number;
  contactUrl: string;
  onSearch: () => void;
  onCart: () => void;
}) {
  const { t, language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [bump, setBump] = useState(0);
  // Optimistic tab: the tab you press lights up at once, before the next page has arrived.
  // (The header remounts with the new page, so this resets by itself.)
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const lastCount = useRef(count);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 12);
      setShowBackToTop(y > 600);
      // Small deltas are ignored so a resting thumb on the screen does not flicker the bar.
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 520);
        last = y;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // The bag answers every addition, so the action is confirmed where the result lives.
  useEffect(() => {
    if (count > lastCount.current) {
      setBump((value) => value + 1);
      setHidden(false);
    }
    lastCount.current = count;
  }, [count]);

  const cartLabel = t(
    `Abrir carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`,
    `Open cart, ${count} ${count === 1 ? 'item' : 'items'}`,
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {showBackToTop && !open && <button className="back-to-top" type="button" aria-label={t('Volver arriba','Back to top')} onClick={()=>{
        setHidden(false);
        window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
        document.querySelector<HTMLAnchorElement>('.site-header-logo')?.focus({preventScroll:true});
      }}><ArrowUp size={20} aria-hidden="true"/></button>}
      <header
        className="site-header"
        data-scrolled={scrolled || undefined}
        data-hidden={(hidden && !open) || undefined}
      >
        <div className="site-header-bar">
          <nav className="site-header-links" data-has-pending={pendingHref ? true : undefined} aria-label={t('Navegación principal', 'Main navigation')}>
            {items
              .filter((item) => item.desktop)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  aria-current={item.active ? 'page' : undefined}
                  data-pending={pendingHref === item.href ? true : undefined}
                  onClick={() => { if (!item.active) setPendingHref(item.href); }}
                >
                  {item.label}
                </Link>
              ))}
          </nav>

          <SheetTrigger className="site-header-icon site-header-menu" aria-label={t('Abrir menú', 'Open menu')}>
            <Menu size={22} strokeWidth={1.5} />
          </SheetTrigger>

          <Link className="site-header-logo" href="/" aria-label={t('Soluna, inicio', 'Soluna, home')}>
            <img src="/soluna-logo-light.webp" width="720" height="453" alt="Soluna Fragrance" />
          </Link>

          <div className="site-header-actions">
            <fieldset className="site-header-language" aria-label={t('Idioma', 'Language')}>
              {(['es', 'en'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={language === value}
                  aria-label={value === 'es' ? 'Español' : 'English'}
                  onClick={() => setLanguage(value)}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </fieldset>
            <a className="site-header-whatsapp" href={contactUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} strokeWidth={1.6} aria-hidden="true" />
              8619 0302
            </a>
            <button type="button" className="site-header-icon" onClick={onSearch} aria-label={t('Buscar perfumes', 'Search fragrances')}>
              <Search size={21} strokeWidth={1.5} />
            </button>
            <button type="button" className="site-header-icon site-header-cart" onClick={onCart} aria-label={cartLabel}>
              <ShoppingBag size={21} strokeWidth={1.5} />
              {count > 0 && (
                <span key={bump} className="site-header-count" aria-hidden="true">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <SheetContent side="left" className="menu-sheet" showCloseButton={false}>
        <div className="menu-sheet-top">
          <SheetClose className="site-header-icon" aria-label={t('Cerrar menú', 'Close menu')}>
            <X size={22} strokeWidth={1.5} />
          </SheetClose>
          <img src="/soluna-logo-light.webp" width="720" height="453" alt="" aria-hidden="true" />
        </div>
        <SheetTitle className="sr-only">{t('Menú', 'Menu')}</SheetTitle>
        <SheetDescription className="sr-only">{t('Encuentra tu próxima fragancia.', 'Find your next fragrance.')}</SheetDescription>

        <nav className="menu-sheet-links" aria-label={t('Menú', 'Menu')}>
          {items.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              onClick={() => setOpen(false)}
              style={{ '--i': index } as CSSProperties}
            >
              <span>{item.label}</span>
              {item.note && <small>{item.note}</small>}
            </Link>
          ))}
        </nav>

        <div className="menu-sheet-bottom">
          <fieldset className="menu-sheet-language" aria-label={t('Idioma', 'Language')}>
            <button type="button" aria-pressed={language === 'es'} onClick={() => setLanguage('es')}>Español</button>
            <button type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>English</button>
          </fieldset>
          <a className="menu-sheet-whatsapp" href={contactUrl} target="_blank" rel="noopener noreferrer">
            <span>
              <small>{t('Asesoría por WhatsApp', 'Advice on WhatsApp')}</small>
              +506 8619 0302
            </span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
