'use client';
import Link from 'next/link';
import {ArrowDown} from 'lucide-react';
import {useLanguage} from '@/components/language-provider';
import {ResponsiveImage} from '@/components/responsive-image';
import type {Product} from '@/lib/catalog';

export const collectionThemes:Record<string,string>={Hombre:'him',Mujer:'her','Más vendidos':'favourites',Todos:'catalogue'};

const scenes:Record<string,string>={Hombre:'/images/hero-gold-splash.png',Mujer:'/images/hero-rose.png','Más vendidos':'/images/hero-soluna-signature.webp',Todos:'/images/hero-soluna-signature.webp'};

// Every collection opens like the home page: campaign photography, one clear title,
// the facts about what is inside, and a single way down into the list.
export function CollectionHero({category,items,brand}:{category:string;items:Product[];brand?:string;onProduct?:(product:Product)=>void}){
 const {t}=useLanguage();
 const theme=collectionThemes[category];
 const copy={
  Hombre:{label:t('Hombre','Men'),intro:t('Perfumes de','Fragrances for'),title:t('hombre.','him.'),description:t('Fragancias que dejan presencia. Encuentra el aroma que acompaña tu carácter.','Fragrances with presence. Find the scent that complements your character.')},
  Mujer:{label:t('Mujer','Women'),intro:t('Perfumes de','Fragrances for'),title:t('mujer.','her.'),description:t('Sutil, inolvidable y tan tuya como tu forma de ser. Encuentra la fragancia que habla por ti.','Subtle, unforgettable and entirely your own. Find the fragrance that speaks for you.')},
  'Más vendidos':{label:t('Más vendidos','Bestsellers'),intro:t('Los','The'),title:t('favoritos.','favourites.'),description:t('Los perfumes que más nos piden nuestros clientes. Tu próximo imprescindible probablemente está aquí.','The fragrances our customers ask for most. Your next signature is probably here.')},
  Todos:{label:t('Catálogo completo','Full catalogue'),intro:t('Todo el','The whole'),title:t('catálogo.','catalogue.'),description:t('Todas nuestras casas y fragancias en un solo lugar. Filtra por marca, precio o tamaño.','All our houses and fragrances in one place. Filter by brand, price or size.')},
 }[category];
 if(!copy||!theme)return null;
 const inScope=brand?items.filter(p=>p.brand===brand):items;
 const houses=new Set(inScope.map(p=>p.brand)).size;
 function discover(){const target=document.getElementById('coleccion');target?.focus({preventScroll:true});target?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}
 return <section className={`page-hero page-hero-${theme}`} aria-labelledby="collection-title">
  <div className="page-hero-media" aria-hidden="true"><ResponsiveImage src={scenes[category]} alt="" priority sizes="100vw"/></div>
  <div className="page-hero-inner">
   <nav className="page-hero-crumbs" aria-label={t('Ruta de navegación','Breadcrumb')}>
    <Link href="/">{t('Inicio','Home')}</Link><span aria-hidden="true">/</span>
    {brand?<Link href={category==='Hombre'?'/hombre':category==='Mujer'?'/mujer':'/perfumes'}>{copy.label}</Link>:<span aria-current="page">{copy.label}</span>}
    {brand&&<><span aria-hidden="true">/</span><span aria-current="page">{brand}</span></>}
   </nav>
   <h1 id="collection-title">{brand?<>{brand} <em>{category==='Hombre'?t('para hombre.','for men.'):category==='Mujer'?t('para mujer.','for women.'):`${copy.label.toLowerCase()}.`}</em></>:<>{copy.intro} <em>{copy.title}</em></>}</h1>
   <p className="page-hero-description">{copy.description}</p>
   <div className="page-hero-foot">
    <p>{inScope.length} {inScope.length===1?t('fragancia','fragrance'):t('fragancias','fragrances')}{!brand&&houses>1&&<> · {houses} {t('casas','houses')}</>}</p>
    <button className="page-hero-down" type="button" onClick={discover}>{t('Ver fragancias','View fragrances')}<ArrowDown size={16} aria-hidden="true"/></button>
   </div>
  </div>
 </section>;
}
