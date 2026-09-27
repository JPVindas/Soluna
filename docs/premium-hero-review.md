# Logo y hero editorial — 26 septiembre 2026

## Revisión posterior: simplificación solicitada

La versión actual sustituye el selector numerado, las flechas, autoplay y el indicador de scroll del hero por tres botones de colección encima de la fotografía. La acción Descubrir pasa a una franja junto al nombre; ya no se superpone al perfume. Se eliminaron los temporizadores de reproducción. El fondo es más neutro y la fotografía ocupa un área propia.

Verificación de esta revisión: TypeScript y build correctos; selector Mujer, ficha Good Girl Blush y CTA hacia sus 40 productos comprobados. Sin overflow del inicio a 320, 390, 768 y 1440 px; revisión adicional del inglés a 320 px. Las notas siguientes describen la iteración anterior y sus pruebas.

## Implementación

- Se sustituyó `public/soluna-logo-original.png` con el PNG adjunto, sin reconstrucción ni modificación. SHA-256 idéntico al original: `217825D62687336FF0F2AEE709A8113DF3078A16E94DB64F9F5EA7BC8D2F5ECE`. Dimensiones 1580×995; `object-fit: contain`. Header, navegación móvil y footer reutilizan esta ruta. El logo muestra FRAGRANCE.
- No se encontraron referencias textuales a «Soluna Fragance» en app/components/lib. El dominio y usuario de Instagram conservan su escritura real para no romper enlaces.
- Hero: composición de luz cálida y sombra, producto de mayor tamaño, integración del fondo fotográfico mediante mezcla de color, selector numerado, ficha clicable, transiciones de 550–650 ms, entrada escalonada y enlace de scroll funcional.
- Las flechas y selección manual detienen autoplay. El movimiento reducido desactiva las animaciones del hero. Sin nuevas librerías ni servicios externos.
- Se reutilizaron las fotografías optimizadas existentes. El PNG de marca se conserva original (704.853 bytes); no se afirma una mejora medida de Core Web Vitals.

## Verificación realizada

- TypeScript y pruebas `check-catalog-state.cjs`: pasan. Build final de Vinext para Cloudflare: pasa.
- Sin desbordamiento horizontal del inicio en 320, 390, 768, 1440 y 1920 px. Fotografías cargadas; revisión visual móvil, tablet y escritorio. Los elementos de animación usan espacio reservado; no se realizó una medición instrumental de CLS/LCP.
- Flechas del hero: Bleu → Sauvage → Good Girl Blush, y regreso. Ficha del producto abre correctamente. El scroll hook llega a `#descubrir`.
- Búsqueda móvil de Prada: 9 resultados; combinada con Mujer: 4; limpiar: 122.
- Worker compilado: CTA del hero abre catálogo de 122 productos. Dolce & Gabbana filtra 8 productos y mantiene estado al recargar.
- Carrito en Worker local: agregar Bleu, aumentar a dos unidades (₡220.000) y eliminar el producto de prueba; terminó vacío. No se envió pedido ni mensaje de WhatsApp.
- Rutas `/`, `/perfumes`, `/hombre`, `/mujer`, `/mas-vendidos`, `/hombre/dolce-gabbana`, `/mujer/prada` y filtro por query responden HTTP 200; logo HTTP 200. `/perfumes/dolce-gabbana` es una ruta no admitida y devuelve 404; el catálogo general usa query parameters.
- Consola de la pestaña final sin errores ni advertencias.
- Se verificaron los flujos indicados, no cada combinación posible de filtros ni cada enlace individual del catálogo.

Archivos de implementación: `components/storefront.tsx`, `app/boutique.css`, `public/soluna-logo-original.png`. Sin despliegue a Cloudflare.
