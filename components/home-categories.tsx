'use client';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {useLanguage} from './language-provider';
import {ProductPhoto} from './product-photo';
import {products,menProducts,womenProducts} from '@/lib/catalog';

const him=products.find(p=>p.id==='men-jean-paul-gaultier-le-male-elixir')!;
const her=products.find(p=>p.id==='coco-mademoiselle')!;
const affordable=products.filter(p=>p.price!==null&&p.price<=50000).length;

// One place to choose a direction: replaces the old "where to start" row and the
// category cards, which repeated the same two links.
export function HomeCategories(){
 const {t}=useLanguage();
 const tiles=[
  {key:'him',href:'/hombre',product:him,kicker:t('Para él','For him'),title:t('Hombre','Men'),line:t('Maderas, cuero y especias.','Woods, leather and spice.'),count:menProducts.length},
  {key:'her',href:'/mujer',product:her,kicker:t('Para ella','For her'),title:t('Mujer','Women'),line:t('Flores, vainilla y luz.','Florals, vanilla and light.'),count:womenProducts.length},
 ];
 return <section className="paths" aria-labelledby="paths-title">
  <div className="paths-inner">
   <header className="paths-head" data-reveal>
    <p className="eyebrow">{t('Elige tu camino','Choose your path')}</p>
    <h2 id="paths-title">{t('¿Para quién es','Who is it')} <em>{t('la fragancia?','for?')}</em></h2>
   </header>
   <div className="paths-grid">
    {tiles.map((tile,i)=><Link key={tile.key} href={tile.href} className={`path-tile path-${tile.key}`} data-reveal data-reveal-index={i}>
     <span className="path-copy">
      <small>{tile.kicker}</small>
      <strong>{tile.title}</strong>
      <span className="path-line">{tile.line}</span>
     </span>
     <span className="path-media" aria-hidden="true"><ProductPhoto product={tile.product} sizes="(max-width: 700px) 60vw, 30vw"/></span>
     <span className="path-foot">
      <span>{tile.count} {t('fragancias','fragrances')}</span>
      <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true"/>
     </span>
    </Link>)}
    <Link href="/perfumes?max=50000" className="path-tile path-price" data-reveal data-reveal-index={2}>
     <span className="path-copy">
      <small>{t('Grandes casas, buen precio','Great houses, fair prices')}</small>
      <strong><span className="path-price-figure">₡50<span>.000</span></span></strong>
      <span className="path-line">{t('o menos. Originales, como todo el catálogo.','or less. Authentic, like the whole catalogue.')}</span>
     </span>
     <span className="path-foot">
      <span>{affordable} {t('fragancias','fragrances')}</span>
      <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true"/>
     </span>
    </Link>
   </div>
  </div>
 </section>;
}
