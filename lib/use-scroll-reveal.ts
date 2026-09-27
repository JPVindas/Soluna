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
  // After an in-site navigation, what is already on screen when the page arrives stays put;
  // only what the visitor scrolls into later is revealed.
  const mountedAt=performance.now();
  const settled=()=>'navigated' in document.documentElement.dataset&&performance.now()-mountedAt<400;
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    observer.unobserve(entry.target);
    if(seen.current.has(entry.target))return;
    seen.current.add(entry.target);
    if(reduced.matches||settled()||!('animate' in entry.target))return;
    const index=Number((entry.target as HTMLElement).dataset.revealIndex??0);
    const transform=getComputedStyle(entry.target).transform;
    const delay=(index%4)*60;
    const animation=entry.target.animate([{opacity:.2,transform:`translateY(18px) ${transform==='none'?'':transform}`},{opacity:1,transform}],{duration:700,delay,easing:'cubic-bezier(.23,1,.32,1)'});
    animations.add(animation);
    animation.onfinish=()=>animations.delete(animation);
    // Section titles rise from behind their own baseline (a mask), the editorial beat
    // that gives each section its entrance; body copy keeps the quieter fade above.
    const title=entry.target.matches('h2')?entry.target:entry.target.querySelector('h2');
    if(title&&document.documentElement.dataset.motion!=='lite'){
     const mask=title.animate([{clipPath:'inset(0 0 100% 0)',transform:'translateY(.28em)'},{clipPath:'inset(-.2em 0 -.3em 0)',transform:'none'}],{duration:900,delay:delay+80,easing:'cubic-bezier(.23,1,.32,1)',fill:'backwards'});
     animations.add(mask);
     mask.onfinish=()=>animations.delete(mask);
    }
   });
  },{threshold:.06});
  surface.querySelectorAll('[data-reveal],.contact-band').forEach(el=>observer.observe(el));
  const cancel=()=>{if(reduced.matches)animations.forEach(animation=>animation.cancel())};
  reduced.addEventListener('change',cancel);
  return()=>{observer.disconnect();animations.forEach(animation=>animation.cancel());reduced.removeEventListener('change',cancel)};
 },[root,contentKey]);
}
