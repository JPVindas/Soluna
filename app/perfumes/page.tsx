import Storefront from '@/components/storefront';
import {siteMetadata} from '@/lib/site-metadata';
export const metadata=siteMetadata('/perfumes','Catálogo completo | Soluna Fragrance','Perfumes para hombre y mujer, marcas originales y precios en colones costarricenses. Explora el catálogo de Soluna.');
export default function Page(){return <Storefront collection='Todos'/>;}
