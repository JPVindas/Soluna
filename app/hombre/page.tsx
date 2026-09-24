import Storefront from '@/components/storefront';
import {siteMetadata} from '@/lib/site-metadata';
export const metadata=siteMetadata('/hombre','Hombre | Soluna Fragrance','Descubre perfumes originales para hombre en Soluna. Explora por marca, presentación y precio y consulta tu pedido por WhatsApp.');
export default function Page(){return <Storefront collection='Hombre'/>;}
