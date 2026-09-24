'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  Pause,
  Play,
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
import { ResponsiveImage } from '@/components/responsive-image';
import { HowToShop } from '@/components/how-to-shop';
import { useCart } from '@/components/cart-provider';
import { useLanguage } from '@/components/language-provider';
import { SolunaFooter } from '@/components/soluna-footer';
import { BrandCarousel } from '@/components/brand-carousel';
import { CatalogFilters } from '@/components/catalog-filters';
import {
  CatalogPagination,
  CATALOG_PAGE_SIZE,
} from '@/components/catalog-pagination';

import {
  products,
  filterProducts,
  updateCart,
  money,
  productName,
  orderMessage,
  cartSummary,
  sortProducts,
  brandsFor,
  brandHref,
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
  type Filters,
} from '@/lib/catalog-filters';

import { ProductPhoto } from '@/components/product-photo';
import {
  CollectionHero,
  collectionThemes,
} from '@/components/collection-hero';

import { useScrollReveal } from '@/lib/use-scroll-reveal';
import { SiteNavigation } from '@/components/site-navigation';
import { CatalogSort } from '@/components/catalog-sort';

const paths: Record<string, string> = {
  Hombre: '/hombre',
  Mujer: '/mujer',
  Todos: '/perfumes',
  'Más vendidos': '/mas-vendidos',
};

const whatsapp = (text: string) =>
  'https://wa.me/50686190302?text=' + encodeURIComponent(text);

export default function Storefront({
  collection,
  initialBrand,
}: {
  collection?: string;
  initialBrand?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';

  const listingRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  const { t, language, setLanguage } = useLanguage();
  const { cart, setCart } = useCart();

  const [sort, setSort] = useState<SortOrder>('recommended');
  const [query, setQuery] = useState(urlQuery);
  const [searchQuery, setSearchQuery] = useState('');

  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [detail, setDetail] = useState<Product | null>(null);
  const [notice, setNotice] = useState(false);

  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [interacting, setInteracting] = useState(false);

  const category = collection ?? 'Más vendidos';
  const isBestsellers = category === 'Más vendidos';
  const theme = collectionThemes[category];

  const [pagination, setPagination] = useState({
    key: '',
    page: 1,
  });

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
      filterProducts(category).filter(
        (p) => !initialBrand || p.brand === initialBrand,
      ),
    [category, initialBrand],
  );

  const selected = useMemo(
    () =>
      sortProducts(
        applyFilters(
          filterProducts(category, query).filter(
            (p) => !initialBrand || p.brand === initialBrand,
          ),
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

  const collectionBrands = useMemo(
    () =>
      brandsFor(
        collection === 'Hombre' || collection === 'Mujer'
          ? collection
          : undefined,
      ),
    [collection],
  );

  const urlBrand = searchParams.get('marca') ?? '';
  const activeFilters = filterCount(filters);

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

  const currentPage =
    pagination.key === paginationKey
      ? Math.min(pagination.page, pageCount)
      : 1;

  const visibleProducts = selected.slice(
    (currentPage - 1) * CATALOG_PAGE_SIZE,
    currentPage * CATALOG_PAGE_SIZE,
  );

  useScrollReveal(
    surfaceRef,
    `${paginationKey}:${currentPage}`,
  );

  useEffect(() => {
    setPagination({
      key: paginationKey,
      page: 1,
    });
  }, [paginationKey]);

  function changePage(page: number) {
    if (
      page < 1 ||
      page > pageCount ||
      page === currentPage
    )
      return;

    setPagination({
      key: paginationKey,
      page,
    });

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
        'Perfumes 100% originales.',
        '100% authentic perfumes.',
      ),
      category: 'Todos',
    },
    {
      first: t('Tu esencia.', 'Your essence.'),
      second: t('Tu', 'Your'),
      accent: t('estilo.', 'signature.'),
      subtitle: t(
        'Encuentra el aroma que habla de ti.',
        'Find the scent that speaks for you.',
      ),
      category: 'Hombre',
    },
    {
      first: t('Un aroma', 'A scent'),
      second: t('para', 'to'),
      accent: t('recordar.', 'remember.'),
      subtitle: t(
        'Descubre nuestra colección de mujer.',
        'Discover our collection for her.',
      ),
      category: 'Mujer',
    },
  ];

  function browse(value: string) {
    setSearchOpen(false);
    router.push(paths[value] ?? '/perfumes');
  }

  function add(id: string) {
    setCart((current) =>
      updateCart(current, id, 1),
    );
    setNotice(true);
  }

  useEffect(() => {
    setQuery(urlQuery);
  }, [collection, urlQuery]);

  useEffect(() => {
    const brand = brandsFor().find(
      (name) => slugify(name) === urlBrand,
    );

    setFilters({
      ...emptyFilters(),
      brands: brand ? [brand] : [],
    });
  }, [collection, initialBrand, urlBrand]);

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
  }, [notice]);

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    if (reduced.matches) setPlaying(false);

    const change = () => {
      if (reduced.matches) setPlaying(false);
    };

    reduced.addEventListener('change', change);

    return () =>
      reduced.removeEventListener(
        'change',
        change,
      );
  }, []);

  useEffect(() => {
    if (
      collection ||
      !playing ||
      interacting
    )
      return;

    const timer = setInterval(() => {
      if (!document.hidden) {
        setSlide((s) => (s + 1) % 3);
      }
    }, 6500);

    return () => clearInterval(timer);
  }, [collection, playing, interacting]);

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

        setQuery(value.query ?? '');

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
  ) => (
    <article
      className="product"
      key={p.id}
      data-reveal
      data-reveal-index={index}
    >
      {isBestsellers && (
        <span className="bestseller-badge">
          <Heart size={12} />
          {t(
            'Más vendido',
            'Bestseller',
          )}
        </span>
      )}

      <button
        className="product-photo-button"
        aria-label={`${t('Ver', 'View')} ${p.name}`}
        onClick={() => setDetail(p)}
      >
        <ProductPhoto
          product={p}
          sizes={
            collection
              ? '(max-width: 360px) 80vw, (max-width: 960px) 40vw, 300px'
              : '(max-width: 360px) 80vw, (max-width: 640px) 40vw, (max-width: 1100px) 27vw, 220px'
          }
        />

        <span className="product-discover">
          {t(
            'Descubrir',
            'Discover',
          )}
          <ArrowUpRight size={14} />
        </span>
      </button>

      <span className="product-brand">
        {brandOf(p)}
      </span>

      <h3>
        <button
          onClick={() =>
            setDetail(p)
          }
        >
          {p.name}
        </button>
      </h3>

      {collection &&
        !isBestsellers &&
        p.featured && (
          <span className="featured-label">
            ★{' '}
            {t(
              'Destacado',
              'Featured',
            )}
          </span>
        )}

      {p.size && (
        <p className="product-size">
          {sizeText(p)}
        </p>
      )}

      <strong
        className={
          p.price === null
            ? 'price-on-request'
            : 'product-price'
        }
      >
        {priceText(p)}
      </strong>

      <button
        className={`add-button ${cart[p.id] ? 'has-in-cart' : ''}`}
        onClick={() => add(p.id)}
      >
        {!!cart[p.id] && (
          <Check
            size={14}
            aria-hidden="true"
          />
        )}

        {cart[p.id]
          ? t(
              `Agregar otro · ${cart[p.id]} en carrito`,
              `Add another · ${cart[p.id]} in cart`,
            )
          : t(
              'Agregar al carrito',
              'Add to cart',
            )}
      </button>
    </article>
  );

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

      <header className="masthead">
        <div className="shipping">
          <Truck size={18} />
          <span>
            {t(
              'Envíos a todo Costa Rica',
              'Delivery across Costa Rica',
            )}{' '}
            🇨🇷
          </span>
        </div>

        <Link
          className="brand"
          href="/"
          aria-label={t(
            'Soluna, inicio',
            'Soluna, home',
          )}
        >
          <img
            src="/soluna-logo-original.png"
            width="1580"
            height="995"
            alt="Soluna Fragrance"
          />
        </Link>

        <div className="header-actions">
          <a
            className="whatsapp-top"
            href={contactUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={17} />
            +506 8619 0302
          </a>

          <div
            className="language-switch"
            role="group"
            aria-label={t(
              'Idioma',
              'Language',
            )}
          >
            <Globe size={14} />

            {(
              ['es', 'en'] as const
            ).map((value) => (
              <button
                key={value}
                onClick={() =>
                  setLanguage(value)
                }
                aria-pressed={
                  language === value
                }
                aria-label={
                  value === 'es'
                    ? 'Español'
                    : 'English'
                }
              >
                {value.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <SiteNavigation
        items={[
          {
            label: t(
              'Inicio',
              'Home',
            ),
            href: '/',
            active: !collection,
          },
          {
            label: t(
              'Catálogo Completo',
              'Full Catalogue',
            ),
            href: '/perfumes',
            active:
              collection ===
              'Todos',
          },
          {
            label: t(
              'Hombre',
              'Men',
            ),
            href: '/hombre',
            active:
              collection ===
              'Hombre',
          },
          {
            label: t(
              'Mujer',
              'Women',
            ),
            href: '/mujer',
            active:
              collection ===
              'Mujer',
          },
          {
            label: t(
              'Más vendidos',
              'Bestsellers',
            ),
            href: '/mas-vendidos',
            active:
              collection ===
              'Más vendidos',
          },
          {
            label: t(
              'Contacto',
              'Contact',
            ),
            href: '#contacto',
            active: false,
          },
        ]}
        count={count}
        onSearch={() => {
          setSearchQuery(query);
          setSearchOpen(true);
        }}
        onCart={() =>
          setCartOpen(true)
        }
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
          <>
            <section
              className="hero cinematic-hero"
              id="inicio"
              aria-roledescription={t(
                'carrusel',
                'carousel',
              )}
              aria-label={t(
                'Colecciones Soluna',
                'Soluna collections',
              )}
              onMouseEnter={() =>
                setInteracting(true)
              }
              onMouseLeave={() =>
                setInteracting(false)
              }
              onFocusCapture={() =>
                setInteracting(true)
              }
              onBlurCapture={(e) => {
                if (
                  !e.currentTarget.contains(
                    e.relatedTarget as Node,
                  )
                ) {
                  setInteracting(
                    false,
                  );
                }
              }}
            >
              <div
                className={`hero-layer ${slide === 0 ? 'is-visible' : ''}`}
                aria-hidden="true"
              >
                <ResponsiveImage
                  className="hero-bg hero-generic"
                  src="/images/hero-soluna-signature.webp"
                  alt=""
                  sizes="100vw"
                  priority
                />
              </div>

              <div
                className={`hero-layer ${slide === 1 ? 'is-visible' : ''}`}
                aria-hidden="true"
              >
                <ResponsiveImage
                  className="hero-bg"
                  src="/images/hero-gold-splash.png"
                  alt=""
                  sizes="100vw"
                />
              </div>

              <div
                className={`hero-layer ${slide === 2 ? 'is-visible' : ''}`}
                aria-hidden="true"
              >
                <ResponsiveImage
                  className="hero-bg"
                  src="/images/hero-rose.png"
                  alt=""
                  sizes="100vw"
                />
              </div>

              <div className="hero-shade" />

              <div
                className="hero-copy"
                key={slide}
              >
                <p className="eyebrow">
                  {t(
                    'Soluna perfumería',
                    'Soluna fragrance',
                  )}{' '}
                  <span>—</span>
                </p>

                <h1>
                  {slides[slide].first}
                  <br />
                  {
                    slides[slide]
                      .second
                  }{' '}
                  <em>
                    {
                      slides[slide]
                        .accent
                    }
                  </em>
                </h1>

                <p className="hero-subtitle">
                  {
                    slides[slide]
                      .subtitle
                  }
                </p>

                <Link
                  className="gold-button"
                  href={
                    paths[
                      slides[slide]
                        .category
                    ]
                  }
                >
                  {t(
                    'Ver colección',
                    'Explore collection',
                  )}
                  <ArrowUpRight
                    size={15}
                  />
                </Link>
              </div>

              <button
                className="hero-arrow previous"
                aria-label={t(
                  'Colección anterior',
                  'Previous collection',
                )}
                onClick={() =>
                  setSlide(
                    (s) =>
                      (s + 2) %
                      3,
                  )
                }
              >
                <ChevronLeft />
              </button>

              <button
                className="hero-arrow next"
                aria-label={t(
                  'Siguiente colección',
                  'Next collection',
                )}
                onClick={() =>
                  setSlide(
                    (s) =>
                      (s + 1) %
                      3,
                  )
                }
              >
                <ChevronRight />
              </button>

              <div className="carousel-bottom">
                <span className="slide-counter">
                  0{slide + 1}
                  <i />
                  03
                </span>

                <div className="dots">
                  {slides.map(
                    (_, i) => (
                      <button
                        key={i}
                        className={
                          i ===
                          slide
                            ? 'selected'
                            : ''
                        }
                        aria-label={t(
                          `Ver colección ${i + 1}`,
                          `View collection ${i + 1}`,
                        )}
                        aria-pressed={
                          i ===
                          slide
                        }
                        onClick={() =>
                          setSlide(
                            i,
                          )
                        }
                      />
                    ),
                  )}
                </div>

                <button
                  className="carousel-play"
                  aria-label={
                    playing
                      ? t(
                          'Pausar carrusel',
                          'Pause carousel',
                        )
                      : t(
                          'Reanudar carrusel',
                          'Play carousel',
                        )
                  }
                  aria-pressed={
                    !playing
                  }
                  onClick={() =>
                    setPlaying(
                      !playing,
                    )
                  }
                >
                  {playing ? (
                    <Pause
                      size={14}
                    />
                  ) : (
                    <Play
                      size={14}
                    />
                  )}
                </button>
              </div>
            </section>
          </>
        )}

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
          {collection &&
            theme && (
              <div
                className="collection-list-heading"
                data-reveal
              >
                <div>
                  <span className="collection-kicker">
                    {isBestsellers
                      ? t(
                          'Los favoritos',
                          'The favourites',
                        )
                      : t(
                          'La colección',
                          'The collection',
                        )}
                  </span>

                  <h2>
                    {initialBrand ??
                      (isBestsellers
                        ? t(
                            'Encuentra tu imprescindible.',
                            'Find your signature.',
                          )
                        : t(
                            'Elige tu próxima esencia.',
                            'Choose your next essence.',
                          ))}
                  </h2>
                </div>

                <span className="collection-list-note">
                  {t(
                    'Perfumes 100% originales',
                    '100% authentic fragrances',
                  )}
                </span>
              </div>
            )}

          <div className="catalog-heading">
            {!collection && (
              <span className="collection-kicker">
                {t(
                  'Selección Soluna',
                  'The Soluna selection',
                )}
              </span>
            )}

            <h2 className="section-title">
              {query
                ? t(
                    `Resultados para “${query}”`,
                    `Results for “${query}”`,
                  )
                : categoryLabel(
                    category,
                  )}
            </h2>

            {!collection && (
              <Link
                className="view-all"
                href="/mas-vendidos"
              >
                {t(
                  'Explorar selección',
                  'Explore the selection',
                )}
                <ArrowUpRight
                  size={15}
                />
              </Link>
            )}
          </div>

          {collection && (
            <div className="catalog-brand-navigation">
              <span>
                {t(
                  'Explora por marca',
                  'Explore by brand',
                )}
              </span>

              <div className="catalog-brand-links">
                <Link
                  className={
                    !initialBrand &&
                    !filters.brands
                      .length
                      ? 'is-active'
                      : ''
                  }
                  href={
                    paths[category]
                  }
                >
                  {t(
                    'Todas',
                    'All',
                  )}
                </Link>

                {collectionBrands.map(
                  (brand) => (
                    <Link
                      key={brand}
                      className={
                        initialBrand ===
                          brand ||
                        filters.brands.includes(
                          brand,
                        )
                          ? 'is-active'
                          : ''
                      }
                      href={brandHref(
                        brand,
                        collection,
                      )}
                    >
                      {brand}
                    </Link>
                  ),
                )}
              </div>
            </div>
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
                  renderProduct,
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
                    className="gold-button"
                    onClick={() => {
                      setQuery('');
                      setFilters(
                        emptyFilters(),
                      );
                    }}
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

        {!collection && (
          <>
            <HomeCategories />
            <BrandCarousel />
            <HowToShop />

            <section
              className="benefits"
              aria-label={t(
                'Beneficios',
                'Benefits',
              )}
            >
              {[
                {
                  Icon: SprayCan,
                  title: t(
                    '100% originales',
                    '100% authentic',
                  ),
                  a: t(
                    'Garantizamos la autenticidad',
                    'Authenticity you can trust',
                  ),
                  b: t(
                    'de todos nuestros perfumes.',
                    'in every fragrance.',
                  ),
                },
                {
                  Icon: Truck,
                  title: t(
                    'Envíos rápidos',
                    'Fast delivery',
                  ),
                  a: t(
                    'Mensajería privada',
                    'Private courier',
                  ),
                  b: t(
                    'en todo Costa Rica.',
                    'across Costa Rica.',
                  ),
                },
                {
                  Icon: ShieldCheck,
                  title: t(
                    'Compra segura',
                    'Shop with confidence',
                  ),
                  a: t(
                    'Atención y confianza',
                    'Personal service',
                  ),
                  b: t(
                    'en cada compra.',
                    'with every purchase.',
                  ),
                },
                {
                  Icon:
                    MessageCircle,
                  title: t(
                    'Atención personalizada',
                    'Personal attention',
                  ),
                  a: t(
                    'Escríbenos por WhatsApp',
                    'Message us on WhatsApp',
                  ),
                  b: t(
                    'y te asesoramos.',
                    'and find your fragrance.',
                  ),
                },
              ].map(
                ({
                  Icon,
                  title,
                  a,
                  b,
                }) => (
                  <div
                    className="benefit"
                    key={title}
                  >
                    <span className="benefit-icon">
                      <Icon />
                    </span>

                    <div>
                      <h3>
                        {title}
                      </h3>

                      <p>
                        {a}
                        <br />
                        {b}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </section>
          </>
        )}

        <section
          className="contact-strip"
          id="contacto"
        >
          <MessageCircle className="contact-icon" />

          <div>
            <p>
              {t(
                '¿Dudas o consultas?',
                'Need a little guidance?',
              )}
            </p>

            <h2>
              {t(
                'Tu próxima fragancia empieza aquí.',
                'Your next fragrance starts here.',
              )}
            </h2>

            <span>
              {t(
                'Te ayudamos a encontrar un aroma que se sienta tuyo.',
                'Let us help you find a scent that feels like you.',
              )}
            </span>
          </div>

          <a
            className="gold-button"
            href={contactUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t(
              'Escribir por WhatsApp',
              'Chat on WhatsApp',
            )}
            <ArrowUpRight
              size={15}
            />
          </a>
        </section>
      </main>

      <SolunaFooter />

      <a
        className="floating-whatsapp"
        href={contactUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t(
          'Consultar o comprar por WhatsApp',
          'Ask or shop on WhatsApp',
        )}
      >
        <MessageCircle />
      </a>

      <div
        className="announcement"
        role="status"
        aria-live="polite"
      >
        {notice && (
          <span>
            <BadgeCheck
              size={18}
            />
            {t(
              'Perfume agregado al carrito',
              'Fragrance added to cart',
            )}

            <button
              onClick={() => {
                setCartOpen(
                  true,
                );
                setNotice(false);
              }}
            >
              {t(
                'Ver carrito',
                'View cart',
              )}
            </button>
          </span>
        )}
      </div>

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
                className="gold-button"
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
                    <span>
                      {hasUnpriced
                        ? t(
                            'Subtotal de productos con precio',
                            'Subtotal of priced items',
                          )
                        : t(
                            'Subtotal',
                            'Subtotal',
                          )}
                    </span>

                    <strong>
                      {money(
                        subtotal,
                      )}
                    </strong>
                  </div>
                )}

                <p className="cart-consultation-title">
                  {count}{' '}
                  {count === 1
                    ? t(
                        'producto para consultar',
                        'item to enquire about',
                      )
                    : t(
                        'productos para consultar',
                        'items to enquire about',
                      )}
                </p>

                <p>
                  {t(
                    'Envío por coordinar. Confirma disponibilidad y precio final con Soluna.',
                    'Shipping to be arranged. Confirm availability and final price with Soluna.',
                  )}
                </p>

                <p className="cart-payment">
                  SINPE Móvil
                </p>

                <p>
                  {t(
                    'Revisa productos y cantidades. Checkout abre tu consulta en WhatsApp para que puedas revisarla antes de enviarla.',
                    'Review products and quantities. Checkout opens your enquiry in WhatsApp for review before sending.',
                  )}
                </p>

                <a
                  className="gold-button checkout-button"
                  href={whatsapp(
                    order,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Checkout
                  <MessageCircle
                    size={17}
                  />
                </a>

                <button
                  className="text-button"
                  onClick={() =>
                    setCartOpen(
                      false,
                    )
                  }
                >
                  {t(
                    'Seguir comprando',
                    'Continue shopping',
                  )}
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

          <SheetClose className="gold-button">
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
              setQuery(searchQuery);

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
                            onClick={() => {
                              setSearchOpen(
                                false,
                              );
                              setDetail(
                                product,
                              );
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
              className="gold-button"
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
          }
        }}
      >
        <DialogContent
          className="detail-dialog"
          showCloseButton={false}
        >
          {closeDialog}

          {detail && (
            <>
              <ProductPhoto
                product={detail}
                sizes="(max-width: 640px) 180px, 210px"
                eager
              />

              <DialogTitle className="panel-title">
                {productName(
                  detail,
                )}
              </DialogTitle>

              <DialogDescription>
                {[
                  categoryLabel(
                    detail.category,
                  ),
                  concentrationText(
                    detail,
                  ),
                  sizeText(detail),
                ]
                  .filter(Boolean)
                  .join(' · ')}
                .{' '}
                {t(
                  'Consulta la disponibilidad con nuestro equipo.',
                  'Check availability with our team.',
                )}
              </DialogDescription>

              <strong className="detail-price">
                {priceText(
                  detail,
                )}
              </strong>

              <button
                className="gold-button"
                onClick={() => {
                  add(detail.id);
                  setDetail(null);
                  setCartOpen(
                    true,
                  );
                }}
              >
                {t(
                  'Agregar al carrito',
                  'Add to cart',
                )}
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}