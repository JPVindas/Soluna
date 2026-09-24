'use client';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {useLanguage} from './language-provider';
import {ProductPhoto} from './product-photo';
import {products} from '@/lib/catalog';

const categories = [
 {key:'him', href:'/hombre', product:products.find(p=>p.id==='sauvage')!},
 {key:'her', href:'/mujer', product:products.find(p=>p.id==='good-girl-blush')!},
];

export function HomeCategories(){
 const {t}=useLanguage();
 return <section className="home-categories content" aria-labelledby="categories-title">
  <h2 className="section-title" id="categories-title">{t('Explora por categoría','Explore by category')}</h2>
  <div className="home-category-grid">{categories.map(category=><Link key={category.key} href={category.href} className={`home-category home-category-${category.key}`} data-reveal>
   <div className="home-category-image"><ProductPhoto product={category.product} sizes="(max-width: 640px) 42vw, (max-width: 900px) 36vw, 24vw"/></div>
   <div className="home-category-copy">
    <p>{category.key==='him'?t('Carácter y presencia','Character & presence'):t('Elegancia que inspira','Elegance that inspires')}</p>
    <h3>{category.key==='him'?t('Hombre','Men'):t('Mujer','Women')}</h3>
    <span className="gold-button">{t('Explorar colección','Explore collection')}<ArrowUpRight size={16} aria-hidden="true"/></span>
   </div>
  </Link>)}</div>
 </section>;
}
