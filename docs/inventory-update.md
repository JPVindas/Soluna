# Inventory update — 22 September 2026

The public catalogue is sourced exclusively from `lib/inventory.json`: 122 unique products (82 Hombre, 40 Mujer). Prices and millilitre volumes were checked against the owner's supplied inventory. Odyssey Mandarin Sky is one product; the owner corrected the price to ₡32.000 on 22 September 2026 for 100 ml.

Unknown price/volume fields are `null`. Availability remains `on-request` because no stock information was provided. Existing featured and bestseller selections are retained only for products in the new inventory. Older cart entries for removed products are discarded during restoration; exact matches retain their stable IDs. Afnan 9PM Elixir and Odyssey Homme White Edition have new IDs so older variants are not silently substituted in saved carts.

Price and size omissions stay out of public copy. Unknown prices use the existing “Consultar precio” action. Mixed carts distinguish the subtotal of priced products and ask Soluna to confirm the final price and shipping through WhatsApp. Payment remains SINPE Móvil.

Brand pages reuse the catalogue at `/hombre/[brand]` and `/mujer/[brand]`. Filters update immediately; sorting, search and pagination share the same product list. Unisex navigation, collection, filter options and page have been removed.

## Updated product photography

- Afnan 9PM Elixir: https://afnan.com/products/9-pm-elixir — official 100 ml bottle photo, https://afnan.com/cdn/shop/files/9PM_ELIXIR-1.png?v=1753259405&width=2000
- Armaf Odyssey Homme White Edition: https://armaf.com/products/odyssey-homme-white-edition — official photo associated with the 3.4 oz variant, https://armaf.com/cdn/shop/files/Q325BODYSSEYHOMMEWHITEEDITION_ARMAFSERIES_d4304b7d-8f65-4fec-a6c9-dd0195d38aaf.jpg?v=1739111282&width=1600

These are original manufacturer assets; no open reuse licence was established.

## Checks

`node scripts/check-catalog.cjs` verifies counts, uniqueness, images, search aliases, combined filters, sorting, brand routes, cart values and WhatsApp totals. Pass the original inventory text path as the optional first argument to additionally verify all supplied names, categories, prices and presentations against the source.
