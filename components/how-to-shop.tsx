'use client';
import {Compass,Heart,ShoppingBag,ListChecks,MessageCircle,Smartphone} from 'lucide-react';
import {useLanguage} from './language-provider';
export function HowToShop(){
 const {t}=useLanguage();
 const steps=[
  {Icon:Compass,title:t('Explora','Explore'),text:t('Navega por Hombre y Mujer.','Browse Men and Women.')},
  {Icon:Heart,title:t('Elige tu fragancia','Choose your fragrance'),text:t('Selecciona los perfumes que más te gustan.','Choose the perfumes you love.')},
  {Icon:ShoppingBag,title:t('Agrégalos al carrito','Add to your cart'),text:t('Reúne tu selección en un solo pedido.','Gather your selection in one order.')},
  {Icon:ListChecks,title:t('Revisa tu selección','Review your selection'),text:t('Comprueba los productos y las cantidades de tu consulta.','Check the products and quantities in your enquiry.')},
  {Icon:MessageCircle,title:t('Abre WhatsApp','Open WhatsApp'),text:t('Pulsa Checkout y revisa la consulta antes de enviarla.','Press Checkout and review your enquiry before sending.')},
  {Icon:Smartphone,title:t('Confirma con Soluna','Confirm with Soluna'),text:t('Coordinamos disponibilidad, precio final y pago por SINPE Móvil.','We confirm availability, final price and SINPE Móvil payment instructions.')},
 ];
 return <section className="how-to-shop" aria-labelledby="how-to-title"><div className="content"><h2 id="how-to-title">{t('Cómo comprar en Soluna','How to shop at Soluna')}</h2><ol>{steps.map(({Icon,title,text},i)=><li key={i}><div className="step-top"><Icon size={24} aria-hidden="true"/><span aria-hidden="true">0{i+1}</span></div><h3>{title}</h3><p>{text}</p></li>)}</ol></div></section>;
}
