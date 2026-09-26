'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  ChevronRight,
  Menu,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';

import { useLanguage } from '@/components/language-provider';

type NavigationItem = {
  label: string;
  href: string;
  active: boolean;
};

export function SiteNavigation({
  items,
  count,
  onSearch,
  onCart,
}: {
  items: NavigationItem[];
  count: number;
  onSearch: () => void;
  onCart: () => void;
}) {
  const { t,language,setLanguage } = useLanguage();

  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);

  const sentinel = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (
      !sentinel.current ||
      !('IntersectionObserver' in window)
    ) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setPinned(
        !entry.isIntersecting &&
          entry.boundingClientRect.top < 0,
      );
    });

    observer.observe(sentinel.current);

    return () => observer.disconnect();
  }, []);

  function backToTop() {
    document
      .querySelector<HTMLAnchorElement>('.masthead .brand')
      ?.focus({
        preventScroll: true,
      });

    window.scrollTo({
      top: 0,
      behavior: window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
        ? 'instant'
        : 'smooth',
    });
  }

  function handleMobileNavigation() {
    setOpen(false);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <span
        ref={sentinel}
        className="navigation-sentinel"
        aria-hidden="true"
      />

      <nav
        className={`soluna-navigation ${
          pinned ? 'is-pinned' : ''
        }`}
        aria-label={t(
          'Navegación principal',
          'Main navigation',
        )}
      >
        {/* Navegación desktop */}
        <div className="navigation-desktop">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={
                item.active ? 'active' : undefined
              }
              aria-current={
                item.active ? 'page' : undefined
              }
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Botón del menú móvil */}
        <SheetTrigger
          className="navigation-menu-button"
          aria-label={t(
            'Abrir menú de colecciones',
            'Open collections menu',
          )}
        >
          <Menu size={20} />
          <span>{t('Menú', 'Menu')}</span>
        </SheetTrigger>

        <a className="navigation-brand" href="/" aria-label={t('Soluna, inicio','Soluna, home')}>
          <img src="/soluna-logo-original.png" width="1580" height="995" alt="Soluna Fragrance"/>
        </a>

        {/* Acciones */}
        <div className="navigation-actions">
          <button
            type="button"
            onClick={onSearch}
            aria-label={t(
              'Buscar perfumes',
              'Search fragrances',
            )}
          >
            <Search size={21} />
          </button>

          <button
            type="button"
            className="navigation-cart"
            onClick={onCart}
            aria-label={t(
              `Abrir carrito, ${count} ${
                count === 1
                  ? 'producto'
                  : 'productos'
              }`,
              `Open cart, ${count} ${
                count === 1 ? 'item' : 'items'
              }`,
            )}
          >
            <ShoppingBag size={21} />
            <span>{count}</span>
          </button>
        </div>
      </nav>

      {/* Botón volver arriba */}
      {pinned && (
        <button
          type="button"
          className="back-to-top"
          onClick={backToTop}
          aria-label={t(
            'Volver al inicio de la página',
            'Back to top',
          )}
          title={t(
            'Volver arriba',
            'Back to top',
          )}
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* Menú móvil */}
      <SheetContent
        side="left"
        className="navigation-panel"
        showCloseButton={false}
      >
        <SheetClose
          className="modal-close"
          aria-label={t(
            'Cerrar menú',
            'Close menu',
          )}
        >
          <X size={20} />
        </SheetClose>

        <SheetTitle className="panel-title">
          {t(
            'Explora Soluna',
            'Explore Soluna',
          )}
        </SheetTitle>

        <SheetDescription>
          {t(
            'Encuentra tu próxima fragancia.',
            'Find your next fragrance.',
          )}
        </SheetDescription>

        <div className="navigation-menu-links">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={
                item.active ? 'page' : undefined
              }
              onClick={handleMobileNavigation}
            >
              <span>{item.label}</span>
              <ChevronRight size={16} />
            </a>
          ))}
        </div>
        <div className="menu-language" role="group" aria-label={t('Idioma','Language')}>
          <span>{t('Idioma','Language')}</span>
          <button type="button" aria-pressed={language==='es'} onClick={()=>setLanguage('es')}>Español</button>
          <button type="button" aria-pressed={language==='en'} onClick={()=>setLanguage('en')}>English</button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
