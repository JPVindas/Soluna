'use client';
import {ArrowUpRight} from 'lucide-react';
import {useLanguage} from './language-provider';

// Buying at Soluna is a conversation, so the steps and the contact live together.
export function HowToShop({contactUrl}:{contactUrl:string}){
 const {t}=useLanguage();
 const steps=[
  {title:t('Elige','Choose'),text:t('Explora el catálogo y agrega tus perfumes al carrito.','Browse the catalogue and add your fragrances to the cart.')},
  {title:t('Consulta','Enquire'),text:t('El checkout abre WhatsApp con tu pedido escrito. Lo revisas antes de enviarlo.','Checkout opens WhatsApp with your order written out. Review it before sending.')},
  {title:t('Recibe','Receive'),text:t('Confirmamos disponibilidad, pagas por SINPE Móvil y lo enviamos a todo Costa Rica.','We confirm availability, you pay by SINPE Móvil and we ship across Costa Rica.')},
 ];
 return <section className="how" id="contacto" tabIndex={-1} aria-labelledby="how-title">
  <div className="how-inner">
   <div className="how-intro" data-reveal>
    <p className="eyebrow">{t('Cómo comprar','How to shop')}</p>
    <h2 id="how-title">{t('Comprar aquí es','Shopping here is')} <em>{t('una conversación.','a conversation.')}</em></h2>
    <p>{t('Sin formularios ni cuentas. Te asesoramos por WhatsApp, de persona a persona.','No forms, no accounts. We advise you on WhatsApp, person to person.')}</p>
    <a className="button button-gold" href={contactUrl} target="_blank" rel="noopener noreferrer">{t('Escribir por WhatsApp','Chat on WhatsApp')}<ArrowUpRight size={17} aria-hidden="true"/></a>
   </div>
   <ol className="how-steps">
    {steps.map((step,i)=><li key={step.title} data-reveal data-reveal-index={i}>
     <span className="how-number" aria-hidden="true">{i+1}</span>
     <div><h3>{step.title}</h3><p>{step.text}</p></div>
    </li>)}
   </ol>
  </div>
 </section>;
}
