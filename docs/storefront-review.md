# Storefront refinement — 22 September 2026

- Home flow: hero, bestsellers, two category cards, brands, shopping steps, benefits, contact, footer.
- Category cards now share a dedicated component and stylesheet. Equal dimensions, contained images, whole-card links, keyboard focus, subtle hover, and reduced-motion support. Removed conflicting legacy category selectors.
- Removed the Nuevos route, links, data flags, hero variant and styles. `/nuevos` returns 404; active collection and brand routes return 200.
- Original logo bytes remain unchanged. Responsive WebP derivatives preserve original photography; 82.9% smaller in aggregate at the largest derivative size. Explicit dimensions, appropriate srcsets, lazy loading and smaller image hints for thumbnails.
- Shared results memoization avoids repeating filtering/sorting on unrelated cart or carousel changes. Removed redundant hidden header controls and obsolete styles. No dependency additions.
- Per-route title, description, canonical and Open Graph metadata; header/main/footer landmarks, visible keyboard focus and larger touch controls.

## Checks

TypeScript and production build pass. Catalogue checks compare all 122 products against the owner's inventory, accounting for the later Mandarin Sky price correction to ₡32.000, and exercise combined filters, sorting, aliases, cart totals and WhatsApp text.

Browser review covered widths 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920. No page-width overflow detected; category cards retain equal dimensions. Inspected desktop/mobile home, tablet category and catalogue, small-screen cards, navigation drawer and keyboard focus.

Checked live search and detail price, cart quantity changes and encoded WhatsApp order without sending it. Removed only the temporary test item afterwards. Combined Prada + Mujer + 90 ml returns three products; reset returns 122. Pagination advances to 13–24 and scrolls below the sticky navigation. Category-to-brand navigation returns the correct four Carolina Herrera products. Supplied logo hash remains unchanged.

The local preview server was restarted after a development-only HMR/AsyncLocalStorage recursion error. Subsequent routes and interactions work. Asset savings are measured file sizes, not a claim of measured field Core Web Vitals.

Publishing remains pending the previously requested authorization to upload this site's source and resources to its Sites repository.
