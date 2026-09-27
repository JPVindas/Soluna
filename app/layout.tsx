import type { Metadata, Viewport } from 'next';
import './globals.css';
import './polish.css';
import './catalog.css';
import './collections.css';
import './experience.css';
import './inventory.css';
import './refinements.css';
import './boutique.css';
import './hero.css';
import './design.css';
import './spotlight.css';
import './intro.css';
import './motion.css';
import './transition.css';
import {PerfumeIntro} from '@/components/perfume-intro';
import {RouteTransition} from '@/components/route-transition';
import {LanguageProvider} from '@/components/language-provider';
import {CartProvider} from '@/components/cart-provider';
import {siteMetadata} from '@/lib/site-metadata';
export const metadata: Metadata = siteMetadata('/', 'Soluna Perfumería | Fragancias que dejan huella', 'Perfumes originales para hombre y mujer en Costa Rica. Explora el catálogo de Soluna y consulta tu selección por WhatsApp. Pago por SINPE Móvil.');
// Every page opens on the dark header, so the browser chrome matches it.
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0c0b09' };
// Runs before first paint.
// 1) Motion tier: reduced (user preference) · lite (data saver, slow network, modest CPU/memory) · full.
// 2) Intro: once per session, only when landing on the home page, never on reduced/data-saver.
//    It waits for its photograph, but never more than 600ms: on a slow connection it steps
//    aside and the site shows immediately. Without JS there is simply no intro.
const introDecision=`(function(){var r=document.documentElement,s='off',m='full',c={};try{var n=navigator;c=n.connection||{};if(matchMedia('(prefers-reduced-motion: reduce)').matches)m='reduced';else if(c.saveData||/2g|3g/.test(c.effectiveType||'')||(n.deviceMemory&&n.deviceMemory<4)||(n.hardwareConcurrency&&n.hardwareConcurrency<4))m='lite';if(location.pathname==='/'&&!sessionStorage.getItem('soluna-intro')&&m!=='reduced'&&!c.saveData)s='on'}catch(e){}r.dataset.motion=m;r.dataset.intro=s;if(s==='on'){r.dataset.introWait='';var go=function(ok){if(!('introWait' in r.dataset))return;delete r.dataset.introWait;if(!ok)r.dataset.intro='off'};document.addEventListener('load',function(e){var t=e.target;if(t&&t.closest&&t.closest('.intro-media'))go(1)},true);setTimeout(function(){go(0)},600)}})()`;
export default function RootLayout({ children }: {children: React.ReactNode}) {
 return <html lang="es" suppressHydrationWarning>
  <head>
   <script dangerouslySetInnerHTML={{__html:introDecision}}/>
   <link rel="preconnect" href="https://fonts.googleapis.com"/>
   <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300..500;1,6..72,300..500&display=swap"/>
  </head>
  <body><LanguageProvider><CartProvider><PerfumeIntro/><RouteTransition/>{children}</CartProvider></LanguageProvider></body>
 </html>;
}
