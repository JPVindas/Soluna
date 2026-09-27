'use client';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {useLanguage} from '@/components/language-provider';

const whatsappUrl=(text:string)=>'https://wa.me/50686190302?text='+encodeURIComponent(text);

export function SolunaFooter(){
 const {t}=useLanguage();
 return <footer className="site-footer">
  <div className="site-footer-inner">
   <div className="site-footer-lead">
    <Link className="site-footer-logo" href="/" aria-label={t('Soluna, inicio','Soluna, home')}><img src="/soluna-logo-light.webp" width="720" height="453" alt="Soluna Fragrance" loading="lazy" decoding="async"/></Link>
    <p className="site-footer-line">{t('Una fragancia.','One fragrance.')} <em>{t('Mil maneras de ser tú.','A thousand ways to be you.')}</em></p>
    <p className="site-footer-about">{t('Soluna Perfumería nace para ofrecer perfumería 100% original a los mejores precios, para que disfrutar de grandes fragancias sea más accesible.','Soluna was founded to offer 100% authentic perfumery at the best prices, making exceptional scents more accessible.')}</p>
   </div>
   <nav className="site-footer-col" aria-label={t('Explora Soluna','Explore Soluna')}>
    <h2>{t('Explora','Explore')}</h2>
    <Link href="/hombre">{t('Para él','For him')}</Link>
    <Link href="/mujer">{t('Para ella','For her')}</Link>
    <Link href="/mas-vendidos">{t('Más vendidos','Bestsellers')}</Link>
    <Link href="/perfumes">{t('Todo el catálogo','Full catalogue')}</Link>
   </nav>
   <div className="site-footer-col">
    <h2>{t('Tu compra','Your order')}</h2>
    <p>{t('Pago por SINPE Móvil','Payment by SINPE Móvil')}</p>
    <p>{t('Envíos a todo Costa Rica por mensajería privada','Private courier delivery across Costa Rica')}</p>
    <p>{t('Perfumes 100% originales','100% authentic fragrances')}</p>
   </div>
   <div className="site-footer-col">
    <h2>{t('Hablemos','Get in touch')}</h2>
    <a href={whatsappUrl(t('¡Hola, Soluna! Me gustaría recibir asesoría para elegir un perfume.','Hello, Soluna! I would love some help choosing a fragrance.'))} target="_blank" rel="noopener noreferrer">WhatsApp · 8619 0302<ArrowUpRight size={14} aria-hidden="true"/></a>
    <a href="https://www.instagram.com/solunafragancecr/" target="_blank" rel="noopener noreferrer">Instagram · @solunafragancecr<ArrowUpRight size={14} aria-hidden="true"/></a>
   </div>
  </div>
  <div className="site-footer-bottom">
   <span>© {new Date().getFullYear()} Soluna Fragrance · Costa Rica</span>
   <span>{t('Hecho para dejar huella.','Made to leave an impression.')}</span>
  </div>
 </footer>;
}
