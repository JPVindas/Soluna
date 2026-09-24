'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {useLanguage} from '@/components/language-provider';

export function PerfumeIntro(){
 const pathname=usePathname();const {t}=useLanguage();const first=useRef(true);
 const [intro,setIntro]=useState({visible:true,cycle:0,route:false});
 useEffect(()=>{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setIntro(current=>({...current,visible:false}));return}
  const route=!first.current;first.current=false;
  setIntro(current=>({visible:true,cycle:current.cycle+1,route}));
  const timer=setTimeout(()=>setIntro(current=>({...current,visible:false})),route?720:1180);
  return()=>clearTimeout(timer);
 },[pathname]);
 if(!intro.visible)return null;
 return <div key={intro.cycle} className={`soluna-intro ${intro.route?'is-route-change':'is-first-load'}`} role="status" aria-label={t('Cargando Soluna Fragrance','Loading Soluna Fragrance')}>
  <div className="intro-glow" aria-hidden="true"/><div className="intro-scene" aria-hidden="true">
   <svg className="intro-bottle" viewBox="0 0 240 310" fill="none"><defs><linearGradient id="introGold" x1="45" y1="28" x2="193" y2="285" gradientUnits="userSpaceOnUse"><stop stopColor="#f6dfb3"/><stop offset=".52" stopColor="#c99654"/><stop offset="1" stopColor="#74502f"/></linearGradient></defs><g className="intro-atomizer"><path d="M102 62V38h45v24M112 38V24h48v14"/><path d="M149 28h28"/></g><g className="intro-mist"><path d="M177 30c22-8 38-7 53-3M176 37c24 1 41 7 55 17M177 22c15-14 27-18 43-20"/></g><path className="intro-glass" d="M85 70h78l26 31v151c0 17-13 30-30 30H79c-17 0-30-13-30-30V101l36-31Z"/><path className="intro-liquid" d="M58 190c26-16 48 16 78 0 22-12 35-4 44 5v57c0 12-9 21-21 21H79c-12 0-21-9-21-21v-62Z"/><rect className="intro-label" x="78" y="121" width="83" height="69" rx="2"/></svg>
   <div className="intro-ripple"/><i className="intro-drop drop-one"/><i className="intro-drop drop-two"/>
  </div>
  <img className="intro-logo" src="/soluna-logo-original.png" width="1580" height="995" alt="" aria-hidden="true"/>
  <p className="intro-tagline">{t('Fragancias que dejan huella','Fragrances that leave an impression')}</p><div className="intro-progress" aria-hidden="true"><span/></div>
 </div>;
}
