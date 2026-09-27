'use client';
import Link from 'next/link';
import {useLanguage} from './language-provider';
import {brandsFor,brandHref} from '@/lib/catalog';

const brands=brandsFor();

// Every house set in the same type: a mix of logos and plain names read as unfinished.
export function BrandCarousel(){
 const {t}=useLanguage();
 return <section className="marquee" aria-label={t('Marcas de nuestro catálogo','Brands in our catalogue')}>
  <div className="marquee-track">
   {[0,1].map(copy=><ul className="marquee-group" key={copy} aria-hidden={copy===1?true:undefined}>
    {brands.map(name=><li key={name}><Link tabIndex={copy?-1:0} href={brandHref(name)} aria-label={`${t('Ver perfumes de','View fragrances by')} ${name}`}>{name}</Link></li>)}
   </ul>)}
  </div>
 </section>;
}
