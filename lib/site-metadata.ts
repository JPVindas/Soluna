import type {Metadata} from 'next';

const origin='https://soluna-perfumeria.juanpablo-vindass.chatgpt.site';
export function siteMetadata(path:string,title:string,description:string):Metadata{
 return {title,description,alternates:{canonical:origin+path},openGraph:{type:'website',locale:'es_CR',siteName:'Soluna Fragrance',title,description,url:origin+path}};
}
