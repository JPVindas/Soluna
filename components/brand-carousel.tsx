'use client';
import Link from 'next/link';
import {useLanguage} from './language-provider';
import {brandsFor,brandHref} from '@/lib/catalog';

const brandLogos:Record<string,string>={Chanel:'chanel',Dior:'dior','Yves Saint Laurent':'ysl',Prada:'prada',Valentino:'valentino'};
const brands=brandsFor().map(name=>[brandLogos[name]??'word',name]);

export function BrandCarousel(){
 const {t}=useLanguage();
 return <section className="brand-ribbon" aria-label={t('Marcas de nuestro catálogo','Brands in our catalogue')}>
  <p>{t('Las marcas que definen tu esencia','The brands that define your essence')}</p>
  <div className="brand-window"><div className="brand-track">
   {[0,1].map(copy=><div className="brand-group" key={copy} aria-hidden={copy===1?true:undefined}>{brands.map(([slug,name])=><Link tabIndex={copy? -1:0} href={brandHref(name)} className={`brand-logo brand-logo-${slug}`} aria-label={`${t('Ver perfumes de','View fragrances by')} ${name}`} key={name}>{slug==='word'?<span>{name}</span>:<img src={`/brands/${slug}.svg`} alt={copy?'':name} width="160" height="54" loading="lazy"/>}</Link>)}</div>)}
  </div></div>
 </section>;
}
