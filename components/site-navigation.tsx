'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowUp,ChevronRight,Menu,Search,ShoppingBag,X} from 'lucide-react';
import {Sheet,SheetTrigger,SheetContent,SheetTitle,SheetDescription,SheetClose} from '@/components/ui/sheet';
import {useLanguage} from '@/components/language-provider';

type NavigationItem={label:string;href:string;active:boolean};
export function SiteNavigation({items,count,onSearch,onCart}:{items:NavigationItem[];count:number;onSearch:()=>void;onCart:()=>void}){
 const {t}=useLanguage();
 const [open,setOpen]=useState(false);
 const [pinned,setPinned]=useState(false);
 const sentinel=useRef<HTMLSpanElement>(null);
 const current=items.find(item=>item.active)?.label??t('Inicio','Home');
 useEffect(()=>{
  if(!sentinel.current||!('IntersectionObserver' in window))return;
  const observer=new IntersectionObserver(([entry])=>setPinned(!entry.isIntersecting&&entry.boundingClientRect.top<0));
  observer.observe(sentinel.current);
  return()=>observer.disconnect();
 },[]);
 function backToTop(){
  document.querySelector<HTMLAnchorElement>('.masthead .brand')?.focus({preventScroll:true});
  window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 return <Sheet open={open} onOpenChange={setOpen}>
  <span ref={sentinel} className="navigation-sentinel" aria-hidden="true"/>
  <nav className={`soluna-navigation ${pinned?'is-pinned':''}`} aria-label={t('Navegación principal','Main navigation')}>
   <div className="navigation-desktop">{items.map(item=><Link key={item.href} href={item.href} className={item.active?'active':undefined} aria-current={item.active?'page':undefined}>{item.label}</Link>)}</div>
   <SheetTrigger className="navigation-menu-button" aria-label={t('Abrir menú de colecciones','Open collections menu')}><Menu size={20}/><span>{t('Menú','Menu')}</span></SheetTrigger>
   <span className="navigation-current">{current}</span>
   <div className="navigation-actions"><button type="button" onClick={onSearch} aria-label={t('Buscar perfumes','Search fragrances')}><Search size={21}/></button><button type="button" className="navigation-cart" onClick={onCart} aria-label={t(`Abrir carrito, ${count} ${count===1?'producto':'productos'}`,`Open cart, ${count} ${count===1?'item':'items'}`)}><ShoppingBag size={21}/><span>{count}</span></button></div>
  </nav>
  {pinned&&<button className="back-to-top" onClick={backToTop} aria-label={t('Volver al inicio de la página','Back to top')} title={t('Volver arriba','Back to top')}><ArrowUp size={20}/></button>}
  <SheetContent side="left" className="navigation-panel" showCloseButton={false}>
   <SheetClose className="modal-close" aria-label={t('Cerrar menú','Close menu')}><X size={20}/></SheetClose>
   <SheetTitle className="panel-title">{t('Explora Soluna','Explore Soluna')}</SheetTitle>
   <SheetDescription>{t('Encuentra tu próxima fragancia.','Find your next fragrance.')}</SheetDescription>
   <div className="navigation-menu-links">{items.map(item=><Link key={item.href} href={item.href} aria-current={item.active?'page':undefined} onClick={()=>setOpen(false)}><span>{item.label}</span><ChevronRight size={16}/></Link>)}</div>
  </SheetContent>
 </Sheet>;
}
