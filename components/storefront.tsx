'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  MessageCircle,
  Search,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Heart,
  BadgeCheck,
  SprayCan,
  Plus,
  Minus,
  Trash2,
  X,
  ArrowUpRight,
  SlidersHorizontal,
  Globe,
  Check,
} from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

import { HomeCategories } from '@/components/home-categories';
import { HowToShop } from '@/components/how-to-shop';
import { useCart } from '@/components/cart-provider';
import { useLanguage } from '@/components/language-provider';
import { SolunaFooter } from '@/components/soluna-footer';
import { SolunaPromise } from '@/components/soluna-promise';
import { BestsellerSpotlight } from '@/components/bestseller-spotlight';
import { CatalogFilters } from '@/components/catalog-filters';
import {
  CatalogPagination,
  CATALOG_PAGE_SIZE,
} from '@/components/catalog-pagination';

import {
  products,
  menProducts,
  womenProducts,
  filterProducts,
  updateCart,
  money,
  productName,
  orderMessage,
  cartSummary,
  sortProducts,
  slugify,
  type Product,
  type SortOrder,
} from '@/lib/catalog';

import {
  applyFilters,
  brandOf,
  concentrationOf,
  filterCount,
  emptyFilters,
  readCatalogState,
  writeCatalogState,
  type CatalogState,
  type Filters,
} from '@/lib/catalog-filters';

import { ProductPhoto } from '@/components/product-photo';
import { ResponsiveImage } from '@/components/responsive-image';
import {
  CollectionHero,
  collectionThemes,
} from '@/components/collection-hero';

import { useScrollReveal } from '@/lib/use-scroll-reveal';
import { usePointerDepth } from '@/lib/use-pointer-depth';
import { SiteNavigation } from '@/components/site-navigation';
import { ScrollStrip } from '@/components/scroll-strip';
import { startNavigation } from '@/components/route-transition';
import { CatalogSort } from '@/components/catalog-sort';

const paths: Record<string, string> = {
  Hombre: '/hombre',
  Mujer: '/mujer',
  Todos: '/perfumes',
  'Más vendidos': '/mas-vendidos',
};

const whatsapp = (text: string) =>
  'https://wa.me/50686190302?text=' + encodeURIComponent(text);

// The rectangle an <img> actually paints (object-fit: contain + object-position), in viewport px.
function paintedRect(img: HTMLImageElement) {
  const box = img.getBoundingClientRect();
  const naturalWidth = img.naturalWidth || box.width;
  const naturalHeight = img.naturalHeight || box.height;
  const scale = Math.min(box.width / naturalWidth, box.height / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  const [x = '50%', y = '50%'] = getComputedStyle(img).objectPosition.split(' ');
  const fx = parseFloat(x) / 100;
  const fy = parseFloat(y) / 100;
  return {
    left: box.left + (box.width - width) * (Number.isFinite(fx) ? fx : 0.5),
    top: box.top + (box.height - height) * (Number.isFinite(fy) ? fy : 0.5),
    width,
    height,
  };
}

export default function Storefront({
  collection,
  initialBrand,
}: {
  collection?: string;
  initialBrand?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const catalogState = useMemo(() => readCatalogState(new URLSearchParams(searchKey), initialBrand), [searchKey, initialBrand]);
  const {sort, query, filters} = catalogState;

  const listingRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  const { t, language, setLanguage } = useLanguage();
  const { cart, setCart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');

  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [detail, setDetail] = useState<Product | null>(null);
  // Shared element: the bottle flies from the card that opened it into the product sheet.
  const [sharedOpen, setSharedOpen] = useState(false);
  const sharedFrom = useRef<{ left: number; top: number; width: number; height: number; src: string } | null>(null);
  function openDetail(product: Product, source?: HTMLElement | null) {
    const img = source?.querySelector<HTMLImageElement>('img');
    const shared =
      !!img && img.complete && img.naturalWidth > 0 &&
      !matchMedia('(prefers-reduced-motion: reduce), (max-width: 700px)').matches &&
      document.documentElement.dataset.motion !== 'reduced';
    sharedFrom.current = shared && img ? { ...paintedRect(img), src: img.currentSrc || img.src } : null;
    setSharedOpen(shared);
    setDetail(product);
  }
  useEffect(() => {
    if (!detail || !sharedOpen) return;
    const from = sharedFrom.current;
    let ghost: HTMLImageElement | null = null;
    let flight: Animation | null = null;
    let timer = 0;
    let safety = 0;
    let tries = 0;
    const land = () => { setSharedOpen(false); ghost?.remove(); ghost = null; };
    // Tasks, not frames: frames stall while the sheet mounts. Retry until the target
    // bottle is laid out; if it never appears, simply reveal it.
    const attempt = () => {
        const target = document.querySelector<HTMLImageElement>('.product-sheet-media img');
        if (!target || target.getBoundingClientRect().width === 0) {
          if (++tries < 24) timer = window.setTimeout(attempt, 16);
          else land();
          return;
        }
        if (!from) { land(); return; }
        const to = paintedRect(target);
        ghost = document.createElement('img');
        ghost.src = from.src;
        ghost.alt = '';
        ghost.className = 'shared-ghost';
        Object.assign(ghost.style, { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` });
        document.body.appendChild(ghost);
        const dx = from.left + from.width / 2 - (to.left + to.width / 2);
        const dy = from.top + from.height / 2 - (to.top + to.height / 2);
        flight = ghost.animate(
          [{ transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width})` }, { transform: 'none' }],
          { duration: 520, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' },
        );
        flight.onfinish = land;
        // Never leave the sheet without its bottle, even if the animation is throttled.
        safety = window.setTimeout(land, 900);
    };
    timer = window.setTimeout(attempt, 0);
    return () => { window.clearTimeout(timer); window.clearTimeout(safety); flight?.cancel(); ghost?.remove(); };
  }, [detail, sharedOpen]);
  const [notice, setNotice] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  // The floating WhatsApp button waits until the opening screen is behind the visitor,
  // so it never sits on top of the hero actions at any screen size.
  const [fabVisible, setFabVisible] = useState(false);
  useEffect(() => {
    const opening = document.querySelector('main > section');
    if (!opening) {
      const frame = requestAnimationFrame(() => setFabVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(([entry]) => setFabVisible(entry.intersectionRatio < 0.35), { threshold: [0, 0.35, 1] });
    observer.observe(opening);
    return () => observer.disconnect();
  }, [collection]);

  const [slide, setSlide] = useState(0);
  // Touch: a horizontal flick on the hero changes collection. Distance or velocity is
  // enough (a quick flick counts); vertical intent is left to the browser (pan-y).
  const heroRef = useRef<HTMLElement>(null);
  usePointerDepth(heroRef, [['.home-hero-scene img', -14, -9], ['.home-hero-copy', 4, 3]], 0.06);
  const heroSwipe = useRef<{ x: number; y: number; t: number } | null>(null);
  const heroSwipeHandlers = {
    onPointerDown: (e: ReactPointerEvent) => {
      if (e.pointerType !== 'mouse') heroSwipe.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    },
    onPointerUp: (e: ReactPointerEvent) => {
      const start = heroSwipe.current;
      heroSwipe.current = null;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const velocity = Math.abs(dx) / Math.max(1, performance.now() - start.t);
      if (Math.abs(dx) > Math.abs(dy) * 1.4 && (Math.abs(dx) > 56 || velocity > 0.35)) {
        setSlide((current) => (current + (dx < 0 ? 1 : -1) + 3) % 3);
      }
    },
    onPointerCancel: () => { heroSwipe.current = null; },
  };

  const category = collection ?? 'Más vendidos';
  const isBestsellers = category === 'Más vendidos';
  const theme = collectionThemes[category];

  function updateCatalogue(patch:Partial<CatalogState>, replace=false) {
    const next={...catalogState,...patch,page:patch.page??1};
    const params=writeCatalogState(next);
    const href=`${paths[category]??'/perfumes'}${params.size?'?'+params.toString():''}`;
    if(initialBrand){startNavigation('quiet');router.push(href,{scroll:false});return;}
    // Vinext observes the native History API: no duplicated filter state or RSC request.
    if(href===window.location.pathname+window.location.search)return;
    window.history[replace?'replaceState':'pushState'](null,'',href);
  }
  const setFilters=(value:Filters)=>updateCatalogue({filters:value});
  const setQuery=(value:string)=>updateCatalogue({query:value},true);
  const setSort=(value:SortOrder)=>updateCatalogue({sort:value});
  const clearCatalogue=()=>updateCatalogue({filters:emptyFilters(),query:'',sort:'recommended'});

  const categoryLabel = (value: string) =>
    ({
      Hombre: t('Hombre', 'Men'),
      Mujer: t('Mujer', 'Women'),
      Todos: t('Catálogo completo', 'Full catalogue'),
      'Más vendidos': t('Más vendidos', 'Bestsellers'),
    })[value] ?? value;

  const sizeText = (p: Product) => p.size;

  const concentrationText = (p: Product) =>
    ({
      edp: 'Eau de Parfum · EDP',
      edt: 'Eau de Toilette · EDT',
      parfum: 'Parfum',
      '': '',
    })[concentrationOf(p)];

  const priceText = (p: Product) =>
    p.price === null
      ? t('Consultar precio', 'Price on request')
      : money(p.price);

  const scope = useMemo(
    () =>
      filterProducts(category),
    [category],
  );

  const selected = useMemo(
    () =>
      sortProducts(
        applyFilters(
          filterProducts(category, query),
          collection ? filters : emptyFilters(),
        ),
        sort,
      ),
    [category, query, initialBrand, collection, filters, sort],
  );

  const searchMatches = useMemo(
    () =>
      searchQuery.trim()
        ? filterProducts('Todos', searchQuery)
        : [],
    [searchQuery],
  );

  // Only brands that exist in this collection (Más vendidos has five, not twenty).
  const collectionBrands = useMemo(
    () => [...new Set(scope.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, 'es')),
    [scope],
  );
  const activeBrand = initialBrand ?? (filters.brands.length === 1 ? filters.brands[0] : null);
  // Optimistic selection in the catalogue rows: the chip you press takes the active look at
  // once. It is tied to the location it was pressed on, so it clears itself on arrival.
  const locationKey = `${collection}|${initialBrand ?? ''}|${searchKey}`;
  const [pendingNav, setPendingNav] = useState<{ key: string; row: 'category' | 'brand'; href: string } | null>(null);
  const pendingIn = (row: 'category' | 'brand') => (pendingNav && pendingNav.key === locationKey && pendingNav.row === row ? pendingNav.href : null);
  const press = (row: 'category' | 'brand', href: string, current: boolean) => { if (!current) setPendingNav({ key: locationKey, row, href }); };
  // Hombre and Mujer have dedicated brand pages; the other collections filter by query.
  const brandLink = (brand: string, target: string) =>
    target === 'Hombre' || target === 'Mujer'
      ? `${paths[target]}/${slugify(brand)}`
      : `${paths[target]}?marca=${slugify(brand)}`;
  const categoryLinks = (['Todos', 'Hombre', 'Mujer', 'Más vendidos'] as const).map((key) => {
    const items = filterProducts(key);
    // Switching category keeps the chosen brand when that brand exists there.
    const keepsBrand = activeBrand && items.some((p) => p.brand === activeBrand);
    return {
      key,
      label: key === 'Todos' ? t('Todo', 'All') : categoryLabel(key),
      href: keepsBrand ? brandLink(activeBrand, key) : paths[key],
      count: keepsBrand ? items.filter((p) => p.brand === activeBrand).length : items.length,
      active: category === key,
    };
  });

  const activeFilters = filterCount(filters) + (query.trim() ? 1 : 0);

  const paginationKey = JSON.stringify([
    category,
    initialBrand,
    query,
    filters,
    sort,
  ]);

  const pageCount = Math.max(
    1,
    Math.ceil(selected.length / CATALOG_PAGE_SIZE),
  );

  const currentPage = Math.min(catalogState.page, pageCount);

  const visibleProducts = selected.slice(
    (currentPage - 1) * CATALOG_PAGE_SIZE,
    currentPage * CATALOG_PAGE_SIZE,
  );

  useScrollReveal(
    surfaceRef,
    `${paginationKey}:${currentPage}`,
  );

  function changePage(page: number) {
    if (
      page < 1 ||
      page > pageCount ||
      page === currentPage
    )
      return;

    updateCatalogue({page});

    requestAnimationFrame(() => {
      listingRef.current?.focus({
        preventScroll: true,
      });

      listingRef.current?.scrollIntoView({
        behavior: window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches
          ? 'instant'
          : 'smooth',
        block: 'start',
      });
    });
  }

  const {
    items: cartProducts,
    subtotal,
    hasUnpriced,
  } = cartSummary(cart);

  const count = Object.values(cart).reduce(
    (n, q) => n + q,
    0,
  );

  const contactUrl = whatsapp(
    t(
      '¡Hola, Soluna! Me gustaría recibir asesoría para elegir un perfume.',
      'Hello, Soluna! I would love some help choosing a fragrance.',
    ),
  );

  const order = orderMessage(cart, language);

  const slides = [
    {
      first: t('Fragancias que', 'Fragrances that'),
      second: t('dejan', 'leave an'),
      accent: t('huella.', 'impression.'),
      subtitle: t(
        'Perfumes 100% originales de las grandes casas, elegidos para ti y enviados a todo Costa Rica.',
        '100% authentic perfumes from the great houses, chosen for you and shipped across Costa Rica.',
      ),
      cta: t('Explorar catálogo', 'Explore the catalogue'),
      image: '/images/hero-soluna-signature.webp',
      product: 'bleu',
      category: 'Todos',
    },
    {
      first: t('Tu esencia.', 'Your essence.'),
      second: t('Tu', 'Your'),
      accent: t('estilo.', 'signature.'),
      subtitle: t(
        'Maderas, especias y frescura. Encuentra el aroma que habla de ti.',
        'Woods, spice and freshness. Find the scent that speaks for you.',
      ),
      cta: t('Ver perfumes de hombre', 'Shop men'),
      image: '/images/hero-gold-splash.png',
      product: 'sauvage',
      category: 'Hombre',
    },
    {
      first: t('Un aroma', 'A scent'),
      second: t('para', 'to'),
      accent: t('recordar.', 'remember.'),
      subtitle: t(
        'Flores, vainilla y notas que se quedan contigo. Descubre la colección de mujer.',
        'Florals, vanilla and notes that stay with you. Discover the collection for her.',
      ),
      cta: t('Ver perfumes de mujer', 'Shop women'),
      image: '/images/hero-rose.png',
      product: 'good-girl-blush',
      category: 'Mujer',
    },
  ];
  const featured = products.find((p) => p.id === slides[slide].product);

  function browse(value: string) {
    setSearchOpen(false);
    if ((paths[value] ?? '/perfumes') !== location.pathname) startNavigation('splash', paths[value] ?? '/perfumes');
    router.push(paths[value] ?? '/perfumes');
  }

  function add(id: string) {
    setCart((current) =>
      updateCart(current, id, 1),
    );
    setLastAdded(id);
    setNotice(true);
  }


  useEffect(() => {
    if (
      !collection &&
      (location.hash === '#hombre' ||
        location.hash === '#mujer')
    ) {
      router.replace(
        location.hash === '#hombre'
          ? '/hombre'
          : '/mujer',
      );
    }
  }, [collection, router]);

  useEffect(() => {
    document.title = collection
      ? `${initialBrand ? initialBrand + ' · ' : ''}${categoryLabel(collection)} | Soluna Fragrance`
      : t(
          'Soluna Perfumería | Fragancias que dejan huella',
          'Soluna Fragrance | Fragrances that leave an impression',
        );
  }, [language, collection, initialBrand]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(
      () => setNotice(false),
      3000,
    );

    return () => clearTimeout(timer);
  }, [notice, count]);

  useEffect(() => {
    type Tool = {
      name: string;
      description: string;
      inputSchema: object;
      annotations: {
        readOnlyHint: boolean;
      };
      execute: (
        input: unknown,
      ) => unknown;
    };

    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: Tool,
            options: {
              signal: AbortSignal;
            },
          ) =>
            | void
            | Promise<void>;
        };
      }
    ).modelContext;

    if (!context?.registerTool) return;

    const lifecycle =
      new AbortController();

    const tool: Tool = {
      name: 'filter_perfume_catalog',

      description:
        'Navigate to a Soluna collection with an optional name or brand search. Does not modify the cart or place an order.',

      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: Object.keys(paths),
          },
          query: {
            type: 'string',
          },
        },
        required: ['category'],
        additionalProperties: false,
      },

      annotations: {
        readOnlyHint: false,
      },

      execute(input) {
        const value = input as {
          category: string;
          query?: string;
        };

        if (
          !value ||
          !Object.hasOwn(
            paths,
            value.category,
          ) ||
          (value.query !== undefined &&
            typeof value.query !==
              'string')
        ) {
          throw new Error(
            'Invalid filter',
          );
        }

        router.push(
          paths[value.category] +
            '?q=' +
            encodeURIComponent(
              value.query ?? '',
            ),
        );

        return {
          category: value.category,
          products: filterProducts(
            value.category,
            value.query ?? '',
          ).map((p) => ({
            id: p.id,
            name: p.name,
            price: 'Consultar precio',
          })),
        };
      },
    };

    try {
      void Promise.resolve(
        context.registerTool(tool, {
          signal:
            lifecycle.signal,
        }),
      ).catch(() => {});
    } catch {}

    return () =>
      lifecycle.abort();
  }, [router]);

  const closeDialog = (
    <DialogClose
      className="modal-close"
      aria-label={t(
        'Cerrar',
        'Close',
      )}
    >
      <X size={20} />
    </DialogClose>
  );

  const renderProduct = (
    p: Product,
    index: number,
    rank?: number,
  ) => {
    const inCart = cart[p.id] ?? 0;
    return (
      <article className="p-card" key={p.id} data-reveal data-reveal-index={index}>
        <div className="p-card-media">
          {rank ? (
            <span className="p-card-rank">N.º {rank}</span>
          ) : (
            p.featured && <span className="p-card-tag">{t('Destacado', 'Featured')}</span>
          )}
          <ProductPhoto
            product={p}
            sizes={collection ? '(max-width: 640px) 46vw, (max-width: 1100px) 30vw, 300px' : '(max-width: 640px) 72vw, 320px'}
          />
        </div>
        <div className="p-card-body">
          <p className="p-card-brand">{brandOf(p)}</p>
          <h3>
            <button type="button" onClick={(e) => openDetail(p, e.currentTarget.closest('.p-card')?.querySelector<HTMLElement>('.p-card-media'))}>{p.name}</button>
          </h3>
          <p className="p-card-meta">
            {p.size && <span>{sizeText(p)}</span>}
            <strong className={p.price === null ? 'is-on-request' : undefined}>{priceText(p)}</strong>
          </p>
        </div>
        <button
          type="button"
          className="p-card-add"
          data-in-cart={inCart > 0 || undefined}
          onClick={() => add(p.id)}
          aria-label={inCart ? t(`Agregar otro ${p.name}, ${inCart} en el carrito`, `Add another ${p.name}, ${inCart} in cart`) : t(`Agregar ${p.name} al carrito`, `Add ${p.name} to cart`)}
        >
          <span key={inCart ? 'in' : 'out'}>
            {inCart ? t(`En tu carrito · ${inCart}`, `In your cart · ${inCart}`) : t('Agregar al carrito', 'Add to cart')}
          </span>
          {inCart ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
        </button>
      </article>
    );
  };


  const collectionTitle =
    category === 'Todos'
      ? t(
          'Todas las fragancias',
          'All fragrances',
        )
      : category === 'Hombre'
        ? t(
            'Perfumes de hombre',
            'Fragrances for him',
          )
        : category === 'Mujer'
          ? t(
              'Perfumes de mujer',
              'Fragrances for her',
            )
          : categoryLabel(category);

  return (
    <div ref={surfaceRef}>
      <a
        className="skip-link"
        href="#coleccion"
      >
        {t(
          'Saltar al catálogo',
          'Skip to catalogue',
        )}
      </a>

      <SiteNavigation
        items={[
          { label: t('Inicio', 'Home'), href: '/', active: !collection },
          { label: t('Hombre', 'Men'), href: '/hombre', active: collection === 'Hombre', note: String(menProducts.length), desktop: true },
          { label: t('Mujer', 'Women'), href: '/mujer', active: collection === 'Mujer', note: String(womenProducts.length), desktop: true },
          { label: t('Más vendidos', 'Bestsellers'), href: '/mas-vendidos', active: collection === 'Más vendidos', desktop: true },
          { label: t('Catálogo completo', 'Full catalogue'), href: '/perfumes', active: collection === 'Todos', note: String(products.length), desktop: true },
          { label: t('Contacto', 'Contact'), href: '#contacto', active: false },
        ]}
        count={count}
        contactUrl={contactUrl}
        onSearch={() => {
          setSearchQuery(query);
          setSearchOpen(true);
        }}
        onCart={() => setCartOpen(true)}
      />

      <main>
        {collection && theme ? (
          <CollectionHero
            category={category}
            brand={initialBrand}
            items={scope}
            onProduct={setDetail}
          />
        ) : (
          collection && (
            <section className="collection-intro content">
              <div>
                <div className="collection-breadcrumb">
                  <Link href="/">
                    {t(
                      'Inicio',
                      'Home',
                    )}
                  </Link>
                  <span>/</span>
                  <span>
                    {categoryLabel(
                      category,
                    )}
                  </span>
                </div>

                <div className="collection-editorial-copy">
                  <p className="collection-kicker">
                    Soluna Fragrance
                  </p>

                  <h1>
                    {collectionTitle}
                  </h1>
                </div>
              </div>
            </section>
          )
        )}

        {!collection && (
          <section ref={heroRef} className="home-hero" data-slide={slide} {...heroSwipeHandlers} aria-label={t('Colecciones Soluna','Soluna collections')}>
            <div className="home-hero-media" aria-hidden="true">
              {slides.map((item,i)=><div key={item.image} className={`home-hero-scene ${slide===i?'is-active':''}`}>
                <ResponsiveImage src={item.image} alt="" priority={i===0} sizes="100vw"/>
              </div>)}
            </div>
            <div className="home-hero-inner content">
              <div className="home-hero-copy" key={slide}>
                <p className="home-hero-eyebrow">Soluna Fragrance <span>· Costa Rica</span></p>
                <h1>{slides[slide].first} {slides[slide].second} <em>{slides[slide].accent}</em></h1>
                <p className="home-hero-description">{slides[slide].subtitle}</p>
                <div className="home-hero-actions">
                  <Link className="button button-gold" href={paths[slides[slide].category]}>
                    {slides[slide].cta}<ArrowUpRight size={17} aria-hidden="true"/>
                  </Link>
                  <Link className="home-hero-secondary" href="/mas-vendidos">
                    {t('Los más vendidos','Bestsellers')}<ChevronRight size={16} aria-hidden="true"/>
                  </Link>
                </div>
                <ul className="home-hero-trust">
                  <li><ShieldCheck size={15} aria-hidden="true"/>{t('100% originales','100% authentic')}</li>
                  <li><Truck size={15} aria-hidden="true"/>{t('Envíos a todo el país','Nationwide shipping')}</li>
                  <li>{t('Pago con SINPE Móvil','Pay with SINPE Móvil')}</li>
                </ul>
              </div>
              <div className="home-hero-footer">
                <fieldset className="home-hero-tabs" aria-label={t('Cambiar colección','Change collection')} style={{'--active':slide} as CSSProperties}>
                  {slides.map((item,i)=><button type="button" key={item.category} aria-pressed={slide===i} onClick={()=>setSlide(i)}><small>0{i+1}</small>{i===0?t('La selección','Our selection'):categoryLabel(item.category)}</button>)}
                  <span className="home-hero-tabs-indicator" aria-hidden="true"/>
                </fieldset>
                {featured && <button className="home-hero-featured" type="button" key={featured.id} onClick={(e)=>openDetail(featured, e.currentTarget)} aria-label={`${t('Ver detalles de','View details of')} ${featured.name}`}>
                  <ProductPhoto product={featured} sizes="56px"/>
                  <span><small>{t('Destacado','Featured')} · {featured.brand}</small><strong>{featured.name}</strong></span>
                  <ArrowUpRight size={18} aria-hidden="true"/>
                </button>}
              </div>
            </div>
          </section>
        )}
        {!collection && (
          <>
            <HomeCategories />
            <BestsellerSpotlight items={selected} cart={cart} onAdd={add} onDetail={openDetail} />
          </>
        )}
        {collection && (
        <section
          className={`catalog content ${
            collection
              ? 'collection-page'
              : 'home-bestsellers'
          } ${
            collection
              ? 'all-catalog'
              : ''
          } ${
            isBestsellers
              ? 'bestsellers-showcase'
              : ''
          }`}
          id="coleccion"
          tabIndex={-1}
        >
          {query && (
            <div className="catalog-heading">
              <h2 className="section-title">{t(`Resultados para “${query}”`, `Results for “${query}”`)}</h2>
            </div>
          )}

          {collection && (
            <nav className="catalog-nav" data-nav-quiet aria-label={t('Explorar el catálogo', 'Explore the catalogue')}>
              {/* Navigation, not filtering: one category and one brand at a time, as real links.
                  Combining several brands stays in the Filters panel. */}
              <div className="catalog-nav-row">
                <span className="catalog-nav-label">{t('Categoría', 'Category')}</span>
                <div className="catalog-categories" data-has-pending={pendingIn('category') ? true : undefined}>
                  {categoryLinks.map((item) => (
                    <Link key={item.key} href={item.href} prefetch scroll={false} aria-current={item.active ? 'page' : undefined} data-pending={pendingIn('category') === item.href ? true : undefined} onClick={() => press('category', item.href, item.active)}>
                      {item.label}
                      <small>{item.count}</small>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="catalog-nav-row">
                <span className="catalog-nav-label">{t('Explora por marca', 'Explore by brand')}</span>
                <ScrollStrip className="catalog-brand-links" label={t('Marcas', 'Brands')} data-has-pending={pendingIn('brand') ? true : undefined}>
                  <Link href={paths[category]} scroll={false} aria-current={!activeBrand ? 'true' : undefined} data-pending={pendingIn('brand') === paths[category] ? true : undefined} onClick={() => press('brand', paths[category], !activeBrand)}>
                    {t('Todas', 'All')}
                    <small>{scope.length}</small>
                  </Link>
                  {collectionBrands.map((brand) => (
                    <Link
                      key={brand}
                      href={activeBrand === brand ? paths[category] : brandLink(brand, category)}
                      scroll={false}
                      aria-current={activeBrand === brand ? 'true' : undefined}
                      data-pending={pendingIn('brand') === (activeBrand === brand ? paths[category] : brandLink(brand, category)) ? true : undefined}
                      onClick={() => press('brand', activeBrand === brand ? paths[category] : brandLink(brand, category), false)}
                    >
                      {brand}
                      <small>{scope.filter((p) => p.brand === brand).length}</small>
                    </Link>
                  ))}
                </ScrollStrip>
              </div>
            </nav>
          )}

          {collection && (
            <div className="catalog-toolbar">
              <p
                role="status"
                aria-atomic="true"
              >
                {selected.length}{' '}
                {selected.length ===
                1
                  ? t(
                      'fragancia',
                      'fragrance',
                    )
                  : t(
                      'fragancias',
                      'fragrances',
                    )}

                {activeFilters >
                0
                  ? ` · ${activeFilters} ${
                      activeFilters ===
                      1
                        ? t(
                            'filtro',
                            'filter',
                          )
                        : t(
                            'filtros',
                            'filters',
                          )
                    }`
                  : ''}
              </p>

              <label className="collection-search">
                <Search size={17} />

                <input
                  aria-label={t(
                    'Buscar perfume o marca',
                    'Search fragrance or brand',
                  )}
                  placeholder={t(
                    'Buscar perfume o marca…',
                    'Search fragrance or brand…',
                  )}
                  value={query}
                  onChange={(e) =>
                    setQuery(
                      e.target
                        .value,
                    )
                  }
                />

                {query && (
                  <button
                    aria-label={t(
                      'Limpiar búsqueda',
                      'Clear search',
                    )}
                    onClick={() =>
                      setQuery('')
                    }
                  >
                    <X size={16} />
                  </button>
                )}
              </label>

              <CatalogSort
                value={sort}
                onChange={setSort}
              />

              <button
                className="mobile-filter-toggle"
                onClick={() =>
                  setFilterOpen(
                    true,
                  )
                }
              >
                <SlidersHorizontal
                  size={16}
                />
                {t(
                  'Filtros',
                  'Filters',
                )}{' '}
                ({activeFilters})
              </button>
            </div>
          )}

          <div
            className={
              collection
                ? 'catalog-layout'
                : 'catalog-results-wrap'
            }
          >
            {collection && (
              <aside className="desktop-filters">
                <CatalogFilters
                  filters={
                    filters
                  }
                  onChange={
                    setFilters
                  }
                  items={scope}
                  activeCount={activeFilters}
                  onClear={clearCatalogue}
                />
              </aside>
            )}

            <div
              className="catalog-results"
              ref={listingRef}
              tabIndex={-1}
              aria-label={t(
                'Listado de perfumes',
                'Fragrance listing',
              )}
            >
              <div
                className={`product-grid ${
                  collection
                    ? 'filtered-products'
                    : ''
                }`}
              >
                {visibleProducts.map(
                  (p, i) => renderProduct(p, i),
                )}
              </div>

              {selected.length ===
              0 ? (
                <div className="empty-state">
                  <Search />

                  <h3>
                    {t(
                      'No encontramos esa fragancia',
                      'No fragrances found',
                    )}
                  </h3>

                  <p>
                    {t(
                      'Prueba con otra marca o ajusta los filtros.',
                      'Try another brand or adjust your filters.',
                    )}
                  </p>

                  <button
                    className="button button-ink"
                    onClick={clearCatalogue}
                  >
                    {t(
                      'Limpiar búsqueda y filtros',
                      'Clear search and filters',
                    )}
                  </button>
                </div>
              ) : (
                <CatalogPagination
                  page={
                    currentPage
                  }
                  total={
                    selected.length
                  }
                  onPageChange={
                    changePage
                  }
                />
              )}
            </div>
          </div>
        </section>
        )}

        {!collection && (
          <>
            <SolunaPromise />
            <HowToShop contactUrl={contactUrl} />
          </>
        )}

        {collection && (
          <section className="contact-band" id="contacto" tabIndex={-1} aria-labelledby="contact-band-title">
            <div>
              <p className="eyebrow">{t('¿Dudas o consultas?', 'Need a little guidance?')}</p>
              <h2 id="contact-band-title">{t('Te ayudamos a encontrar', 'Let us help you find')} <em>{t('un aroma que se sienta tuyo.', 'a scent that feels like you.')}</em></h2>
            </div>
            <a className="button button-gold" href={contactUrl} target="_blank" rel="noopener noreferrer">
              {t('Escribir por WhatsApp', 'Chat on WhatsApp')}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </section>
        )}
      </main>

      <SolunaFooter />

      <a
        className="fab-whatsapp"
        data-visible={fabVisible || undefined}
        tabIndex={fabVisible ? undefined : -1}
        href={contactUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('Consultar o comprar por WhatsApp', 'Ask or shop on WhatsApp')}
      >
        <MessageCircle size={24} strokeWidth={1.6} />
      </a>

      <output className="toast-region" aria-live="polite">
        {notice && lastAdded && (() => {
          const added = products.find((p) => p.id === lastAdded);
          if (!added) return null;
          return (
            <div className="toast">
              <ProductPhoto product={added} sizes="48px" />
              <p key={`${lastAdded}-${cart[lastAdded] ?? 0}`}>
                <small>{t('Agregado', 'Added')}</small>
                {added.name}
              </p>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(true);
                  setNotice(false);
                }}
              >
                {t('Ver carrito', 'View cart')}
              </button>
            </div>
          );
        })()}
      </output>


      <Sheet
        open={cartOpen}
        onOpenChange={setCartOpen}
      >
        <SheetContent
          className="cart-panel"
          showCloseButton={false}
        >
          <SheetClose
            className="modal-close"
            aria-label={t(
              'Cerrar carrito',
              'Close cart',
            )}
          >
            <X size={20} />
          </SheetClose>

          <SheetTitle className="panel-title">
            {t(
              'Tu carrito',
              'Your cart',
            )}{' '}
            <span>({count})</span>
          </SheetTitle>

          <SheetDescription>
            {t(
              'Una selección que deja huella.',
              'A selection that leaves an impression.',
            )}
          </SheetDescription>

          {count === 0 ? (
            <div className="empty-state">
              <ShoppingBag />

              <h3>
                {t(
                  'Tu próxima fragancia te espera',
                  'Your next fragrance awaits',
                )}
              </h3>

              <p>
                {t(
                  'Explora la colección y agrega tus favoritos.',
                  'Explore the collection and add your favourites.',
                )}
              </p>

              <button
                className="button button-ink"
                onClick={() => {
                  setCartOpen(false);
                  browse('Todos');
                }}
              >
                {t(
                  'Explorar perfumes',
                  'Explore fragrances',
                )}
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartProducts.map(
                  (p) => (
                    <div
                      className="cart-item"
                      key={p.id}
                    >
                      <ProductPhoto
                        product={p}
                        sizes="85px"
                      />

                      <div>
                        <h3>
                          {productName(
                            p,
                          )}
                        </h3>

                        <p>
                          {[
                            sizeText(
                              p,
                            ),
                            priceText(
                              p,
                            ),
                          ]
                            .filter(
                              Boolean,
                            )
                            .join(
                              ' · ',
                            )}
                        </p>

                        <div className="quantity">
                          <button
                            aria-label={`${t('Reducir cantidad de', 'Decrease quantity for')} ${p.name}`}
                            onClick={() =>
                              setCart(
                                (
                                  c,
                                ) =>
                                  updateCart(
                                    c,
                                    p.id,
                                    -1,
                                  ),
                              )
                            }
                          >
                            <Minus
                              size={
                                14
                              }
                            />
                          </button>

                          <span>
                            {
                              cart[
                                p
                                  .id
                              ]
                            }
                          </span>

                          <button
                            disabled={
                              cart[
                                p
                                  .id
                              ] >=
                              99
                            }
                            aria-label={`${t('Aumentar cantidad de', 'Increase quantity for')} ${p.name}`}
                            onClick={() =>
                              setCart(
                                (
                                  c,
                                ) =>
                                  updateCart(
                                    c,
                                    p.id,
                                    1,
                                  ),
                              )
                            }
                          >
                            <Plus
                              size={
                                14
                              }
                            />
                          </button>

                          <button
                            className="remove"
                            aria-label={`${t('Eliminar', 'Remove')} ${p.name}`}
                            onClick={() =>
                              setCart(
                                (
                                  c,
                                ) =>
                                  updateCart(
                                    c,
                                    p.id,
                                    -c[
                                      p
                                        .id
                                    ],
                                  ),
                              )
                            }
                          >
                            <Trash2
                              size={
                                15
                              }
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="cart-bottom">
                {subtotal > 0 && (
                  <div className="cart-order-subtotal">
                    <span>{hasUnpriced ? t('Subtotal de productos con precio', 'Subtotal of priced items') : t('Subtotal', 'Subtotal')}</span>
                    <strong>{money(subtotal)}</strong>
                  </div>
                )}
                <p className="cart-note">
                  {t(
                    'Tu pedido se abre en WhatsApp para que lo revises antes de enviarlo. Confirmamos disponibilidad, envío y pago por SINPE Móvil.',
                    'Your order opens in WhatsApp so you can review it before sending. We confirm availability, delivery and SINPE Móvil payment.',
                  )}
                </p>
                <a className="button button-gold checkout-button" href={whatsapp(order)} target="_blank" rel="noopener noreferrer">
                  {t('Enviar pedido por WhatsApp', 'Send order on WhatsApp')}
                  <MessageCircle size={17} aria-hidden="true" />
                </a>
                <button className="text-button" type="button" onClick={() => setCartOpen(false)}>
                  {t('Seguir comprando', 'Continue shopping')}
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet
        open={filterOpen}
        onOpenChange={
          setFilterOpen
        }
      >
        <SheetContent
          side="left"
          className="filter-panel"
          showCloseButton={false}
        >
          <SheetClose
            className="modal-close"
            aria-label={t(
              'Cerrar filtros',
              'Close filters',
            )}
          >
            <X size={20} />
          </SheetClose>

          <SheetTitle className="panel-title">
            {t(
              'Encuentra tu fragancia',
              'Find your fragrance',
            )}
          </SheetTitle>

          <SheetDescription>
            {t(
              'Filtra por marca, género, precio y tamaño.',
              'Filter by brand, gender, price and size.',
            )}
          </SheetDescription>

          <CatalogFilters
            filters={filters}
            onChange={setFilters}
            items={scope}
            activeCount={activeFilters}
            onClear={clearCatalogue}
          />

          <p
            className="filter-live-results"
            role="status"
            aria-atomic="true"
          >
            {selected.length}{' '}
            {selected.length ===
            1
              ? t(
                  'fragancia',
                  'fragrance',
                )
              : t(
                  'fragancias',
                  'fragrances',
                )}
          </p>

          <SheetClose className="button button-ink">
            {t(
              'Ver resultados',
              'View results',
            )}
          </SheetClose>
        </SheetContent>
      </Sheet>

      <Dialog
        open={searchOpen}
        onOpenChange={
          setSearchOpen
        }
      >
        <DialogContent
          className="search-dialog"
          showCloseButton={false}
        >
          {closeDialog}

          <DialogTitle className="panel-title">
            {t(
              'Encuentra tu fragancia',
              'Find your fragrance',
            )}
          </DialogTitle>

          <DialogDescription>
            {t(
              'Busca por nombre o marca.',
              'Search by name or brand.',
            )}
          </DialogDescription>

          <form
            onSubmit={(e) => {
              e.preventDefault();

              setSearchOpen(false);
              if (location.pathname !== '/perfumes') startNavigation('splash', '/perfumes');

              router.push(
                '/perfumes?q=' +
                  encodeURIComponent(
                    searchQuery,
                  ),
              );
            }}
          >
            <label
              htmlFor="perfume-search"
              className="sr-only"
            >
              {t(
                'Nombre o marca del perfume',
                'Fragrance name or brand',
              )}
            </label>

            <div className="search-input">
              <Search size={20} />

              <input
                id="perfume-search"
                placeholder={t(
                  'Prueba con Dior, Chanel…',
                  'Try Dior, Chanel…',
                )}
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target
                      .value,
                  )
                }
                autoComplete="off"
                autoFocus
              />
            </div>

            {searchQuery.trim() && (
              <div className="search-preview">
                <p role="status">
                  {
                    searchMatches.length
                  }{' '}
                  {searchMatches.length ===
                  1
                    ? t(
                        'fragancia',
                        'fragrance',
                      )
                    : t(
                        'fragancias',
                        'fragrances',
                      )}
                </p>

                <ul>
                  {searchMatches
                    .slice(0, 5)
                    .map(
                      (
                        product,
                      ) => (
                        <li
                          key={
                            product.id
                          }
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              const source = e.currentTarget;
                              setSearchOpen(false);
                              openDetail(product, source);
                            }}
                          >
                            <ProductPhoto
                              product={
                                product
                              }
                              sizes="54px"
                            />

                            <span>
                              <small>
                                {
                                  product.brand
                                }
                              </small>

                              {
                                product.name
                              }

                              <strong>
                                {priceText(
                                  product,
                                )}
                              </strong>
                            </span>

                            <ArrowUpRight
                              size={
                                15
                              }
                            />
                          </button>
                        </li>
                      ),
                    )}
                </ul>

                {!searchMatches.length && (
                  <p>
                    {t(
                      'Prueba otro nombre o marca.',
                      'Try another name or brand.',
                    )}
                  </p>
                )}
              </div>
            )}

            <button
              className="button button-ink"
              type="submit"
            >
              {t(
                'Ver resultados',
                'View results',
              )}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) {
            setDetail(null);
            setSharedOpen(false);
          }
        }}
      >
        <DialogContent className="product-sheet" data-shared={sharedOpen || undefined} showCloseButton={false}>
          {closeDialog}
          {detail && (
            <>
              <div className="product-sheet-media">
                <ProductPhoto product={detail} sizes="(max-width: 700px) 70vw, 420px" eager />
              </div>
              <div className="product-sheet-body">
                <p className="eyebrow">{detail.brand} · {categoryLabel(detail.category)}</p>
                <DialogTitle className="product-sheet-title">{detail.name}</DialogTitle>
                <DialogDescription className="product-sheet-meta">
                  {[concentrationText(detail), sizeText(detail)].filter(Boolean).join(' · ') || t('Perfume original', 'Authentic fragrance')}
                </DialogDescription>
                <p className="product-sheet-price">{priceText(detail)}</p>
                <ul className="product-sheet-facts">
                  <li>{t('100% original', '100% authentic')}</li>
                  <li>{t('Pago por SINPE Móvil', 'Pay by SINPE Móvil')}</li>
                  <li>{t('Envío a todo Costa Rica', 'Delivery across Costa Rica')}</li>
                </ul>
                <div className="product-sheet-actions">
                  <button
                    type="button"
                    className="button button-ink"
                    onClick={() => {
                      add(detail.id);
                      setDetail(null);
                      setCartOpen(true);
                    }}
                  >
                    {t('Agregar al carrito', 'Add to cart')}
                    <Plus size={17} aria-hidden="true" />
                  </button>
                  <a
                    className="button button-line"
                    href={whatsapp(
                      t(
                        `¡Hola, Soluna! Me interesa ${productName(detail)}${detail.size ? ` (${detail.size})` : ''}. ¿Está disponible?`,
                        `Hello, Soluna! I'm interested in ${productName(detail)}${detail.size ? ` (${detail.size})` : ''}. Is it available?`,
                      ),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('Preguntar por WhatsApp', 'Ask on WhatsApp')}
                    <MessageCircle size={17} aria-hidden="true" />
                  </a>
                </div>
                <p className="product-sheet-note">{t('Confirmamos disponibilidad y precio final antes de tu pago.', 'We confirm availability and final price before you pay.')}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
