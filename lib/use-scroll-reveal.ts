'use client';
import {useEffect,useRef,type RefObject} from 'react';

// Animate once on entry. Content stays visible if JS, observers or motion are unavailable.
export function useScrollReveal(root:RefObject<HTMLElement|null>,contentKey:string){
 const seen=useRef(new WeakSet<Element>());
 useEffect(()=>{
  const surface=root.current;
  if(!surface||!('IntersectionObserver' in window))return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations=new Set<Animation>();
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    observer.unobserve(entry.target);
    if(seen.current.has(entry.target))return;
    seen.current.add(entry.target);
    if(reduced.matches||!('animate' in entry.target))return;
    const index=Number((entry.target as HTMLElement).dataset.revealIndex??0);
    const transform=getComputedStyle(entry.target).transform;
    const animation=entry.target.animate([{opacity:.35,transform:`translateY(12px) ${transform==='none'?'':transform}`},{opacity:1,transform}],{duration:460,delay:(index%3)*40,easing:'cubic-bezier(.2,.7,.2,1)'});
    animations.add(animation);
    animation.onfinish=()=>animations.delete(animation);
   });
  },{threshold:.06});
  surface.querySelectorAll('[data-reveal],.benefit,.brand-ribbon>p,.how-to-shop h2,.how-to-shop li,.categories .section-title,.category,.catalog-heading,.contact-strip').forEach(el=>observer.observe(el));
  const cancel=()=>{if(reduced.matches)animations.forEach(animation=>animation.cancel())};
  reduced.addEventListener('change',cancel);
  return()=>{observer.disconnect();animations.forEach(animation=>animation.cancel());reduced.removeEventListener('change',cancel)};
 },[root,contentKey]);
}
