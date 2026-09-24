# Soluna visual assets

Generated with the built-in ImageGen tool for the homepage campaign (unbranded editorial imagery, not catalogue product photography).

## public/images/hero-gold-splash.png
Prompt: Photorealistic unbranded sculptural dark amber glass perfume bottle with gold cap positioned on the right two-thirds, a liquid golden perfume splash crown around its base with suspended droplets, on black marble. Wide 16:9 landscape; left 45% nearly black negative space for a white headline. Dramatic warm gold rim lighting and premium advertising photography. No text, logos, labels or watermarks.

## public/images/hero-rose.png
Prompt: Photorealistic translucent blush pink unbranded perfume bottle positioned on the right two-thirds among soft rose petals in a smoky dark burgundy studio. Wide 16:9 landscape; left 45% deep dark negative space for a headline. Warm gold light, subtle atmospheric burgundy smoke, delicate glass highlights and petal textures. No text, logos, labels or watermarks.

Existing catalogue photo source URLs remain in lib/product-images.json. Unverified product images and inventory attributes are explicitly left unconfirmed; no coupon, shipping-speed or fragrance-family claims were inferred.

Validation: type checking and production build pass. Filters checked for brand and gender intersections, unknown prices and sizes, Arabic brand mapping, clearing and empty results. Home, all-fragrance, men and women routes return 200 and contain the language controls and updated Instagram destination. WebMCP registration was not browser-validated because this environment provides no supported WebMCP test context. Browser UI testing was not requested.
