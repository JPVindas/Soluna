import Storefront from '@/components/storefront';
import {siteMetadata} from '@/lib/site-metadata';
export const metadata=siteMetadata('/mujer','Mujer | Soluna Fragrance','Encuentra tu fragancia entre los perfumes de mujer de Soluna. Marcas originales, presentaciones y precios en colones.');
export default function Page(){return <Storefront collection='Mujer'/>;}
