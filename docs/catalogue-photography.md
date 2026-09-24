# Catalogue photography

The current inventory contains 122 unique products with local photographs. Source URLs and reference titles are retained in `lib/product-images.json`; updated Afnan 9PM Elixir and Armaf Odyssey Homme White Edition sources are documented in `inventory-update.md`. Product names, prices, volumes and availability come from the owner, not image suppliers.

`python scripts/optimize-images.py` creates 320/640/960-pixel WebP product derivatives and 768/1440/1920-pixel hero derivatives, limited to each source resolution. It preserves source artwork and transparency. `lib/image-variants.json` supplies intrinsic dimensions and responsive srcsets. Images use contained sizing; below-fold photographs load lazily. The original Soluna logo is served unchanged.

125 unique product and hero images: 23,718,385 original bytes; 4,061,438 bytes for the largest WebP derivatives (82.9% reduction). Smaller screens select smaller derivatives. This measures asset size, not field Core Web Vitals.
