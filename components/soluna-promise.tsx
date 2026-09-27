'use client';
import {useLanguage} from './language-provider';
import {BrandCarousel} from './brand-carousel';
import {products,brandsFor} from '@/lib/catalog';

const brandCount=brandsFor().length;

// Replaces four icon "benefits" with one statement and the facts that back it.
export function SolunaPromise(){
 const {t}=useLanguage();
 const facts=[
  {value:String(products.length),label:t('fragancias en catálogo','fragrances in the catalogue')},
  {value:String(brandCount),label:t('casas de perfumería','perfume houses')},
  {value:'100%',label:t('originales, sin excepción','authentic, without exception')},
 ];
 return <section className="promise" aria-labelledby="promise-title">
  <div className="promise-inner">
   <p className="eyebrow" data-reveal>{t('Nuestra promesa','Our promise')}</p>
   <h2 id="promise-title" data-reveal>{t('Perfumería 100% original, a precios que','100% authentic perfumery, at prices that')} <em>{t('hacen la diferencia.','make a difference.')}</em></h2>
   <p className="promise-text" data-reveal>{t('Seleccionamos cada perfume para garantizar autenticidad y calidad en cada compra, y trabajamos para que disfrutar de grandes fragancias sea más accesible.','We select every fragrance to guarantee authenticity and quality in every purchase, and we work to make exceptional scents more accessible.')}</p>
   <dl className="promise-facts">
    {facts.map((fact,i)=><div key={fact.label} data-reveal data-reveal-index={i}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
   </dl>
  </div>
  <BrandCarousel/>
 </section>;
}
