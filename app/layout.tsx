import type { Metadata } from 'next';
import './globals.css';
import './polish.css';
import './catalog.css';
import './collections.css';
import './experience.css';
import './inventory.css';
import './refinements.css';
import './boutique.css';
import {LanguageProvider} from '@/components/language-provider';
import {CartProvider} from '@/components/cart-provider';
import {siteMetadata} from '@/lib/site-metadata';
export const metadata: Metadata = siteMetadata('/', 'Soluna Perfumería | Fragancias que dejan huella', 'Perfumes originales para hombre y mujer en Costa Rica. Explora el catálogo de Soluna y consulta tu selección por WhatsApp. Pago por SINPE Móvil.');
export default function RootLayout({ children }: {children: React.ReactNode}) { return <html lang="es"><body><LanguageProvider><CartProvider>{children}</CartProvider></LanguageProvider></body></html>; }
