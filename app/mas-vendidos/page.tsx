import Storefront from '@/components/storefront';
import {siteMetadata} from '@/lib/site-metadata';
export const metadata=siteMetadata('/mas-vendidos','Más vendidos | Soluna Fragrance','Explora los perfumes favoritos de Soluna, añade tu selección al carrito y consulta disponibilidad y precio final por WhatsApp.');
export default function Page(){return <Storefront collection='Más vendidos'/>;}
