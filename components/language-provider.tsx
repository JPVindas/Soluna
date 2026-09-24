'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
type Language='es'|'en';
const LanguageContext=createContext<{language:Language;setLanguage:(value:Language)=>void;t:(es:string,en:string)=>string}|null>(null);
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setLanguageState]=useState<Language>('es');
 useEffect(()=>{try{if(localStorage.getItem('soluna-language')==='en')setLanguageState('en')}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=language},[language]);
 function setLanguage(value:Language){setLanguageState(value);try{localStorage.setItem('soluna-language',value)}catch{}}
 return <LanguageContext.Provider value={{language,setLanguage,t:(es,en)=>language==='es'?es:en}}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){const value=useContext(LanguageContext);if(!value)throw new Error('LanguageProvider required');return value}
