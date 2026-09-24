import {notFound} from 'next/navigation';
import Storefront from '@/components/storefront';
import {brandsFor,slugify} from '@/lib/catalog';
import {siteMetadata} from '@/lib/site-metadata';

type Props={params:Promise<{category:string;brand:string}>};
function resolve(category:string,slug:string){
 const collection=category==='hombre'?'Hombre':category==='mujer'?'Mujer':null;
 const brand=collection?brandsFor(collection).find(name=>slugify(name)===slug):null;
 return collection&&brand?{collection,brand}:null;
}
export function generateStaticParams(){return ['Hombre','Mujer'].flatMap(category=>brandsFor(category).map(brand=>({category:category.toLowerCase(),brand:slugify(brand)})))}
export async function generateMetadata({params}:Props){const {category,brand}=await params;const match=resolve(category,brand);if(!match)return {};return siteMetadata(`/${category}/${brand}`,`${match.brand} para ${category} | Soluna Fragrance`,`Explora perfumes ${match.brand} para ${category}. Presentaciones y precios en colones. Consulta tu pedido con Soluna por WhatsApp.`)}
export default async function BrandPage({params}:Props){const {category,brand}=await params;const match=resolve(category,brand);if(!match)notFound();return <Storefront collection={match.collection} initialBrand={match.brand}/>}
