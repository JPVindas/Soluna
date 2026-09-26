# Inicio y logo — 26 de septiembre de 2026

## Cambios

- El contenedor del logo tenía 100 px de altura, una imagen de 94 px y padding vertical heredado. La parte inferior quedaba fuera del encabezado. Ahora tiene 120 px, padding vertical cero y una imagen de 104 px centrada, conservando el archivo original y el enlace al inicio.
- El perfume del hero abre su ficha mediante un botón accesible. Las diapositivas ocultas no reciben foco.
- Se añadió un acceso a favoritos y una sección de exploración por hombre, mujer y presupuesto de hasta ₡50.000. Son enlaces a las rutas y filtros reales del catálogo.
- Se mantienen fotografías optimizadas, controles manuales del carrusel, animaciones discretas y preferencias de movimiento reducido. No se añadieron dependencias.
- En móvil se simplificaron los controles del carrusel para conservar objetivos táctiles de 44 px.

## Archivos de implementación

- `app/boutique.css`
- `components/storefront.tsx`

## Verificación

- TypeScript `--noEmit`: correcto.
- `scripts/check-catalog-state.cjs`: correcto; incluye catálogo, filtros, serialización de URL, carrito y totales.
- `vinext build`: correcto, salida para Cloudflare Worker. Sin despliegue.
- Navegador sobre Wrangler local: presupuesto devuelve 36 fragancias y conserva el filtro al recargar; hombre devuelve 82; mujer devuelve 40; favoritos devuelve 5.
- Logo de escritorio y móvil: vuelve al inicio. Producto destacado: abre ficha de Bleu de Chanel y Good Girl Blush; pestaña Hombre muestra Sauvage. CTA de Mujer abre su colección.
- Sin errores ni advertencias en la consola de la pestaña de producción durante estas pruebas.
- Mediciones del inicio a 320×568, 360×800, 375×812, 390×844, 430×932, 768×1024, 1366×768, 1440×900 y 1920×1080: sin desbordamiento horizontal, fotografía cargada y logo contenido dentro del encabezado. Inspección visual adicional de escritorio y móviles de 320/390 px.
- `git diff --check`: correcto.
- Lint no está limpio: el componente ya contenía avisos de dependencias de hooks, actualización de estado en un efecto, etiquetas semánticas, img, autofocus y eventos del carrusel. No se afirma que el lint pase.

Estas comprobaciones corresponden al código local compilado; el dominio público no se ha actualizado.
