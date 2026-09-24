'use client';
import {useState} from 'react';
import type {Product} from '@/lib/catalog';
import {ResponsiveImage} from './responsive-image';

export function ProductPhoto({product,eager=false,sizes}:{product:Product;eager?:boolean;sizes?:string}){
 const [failed,setFailed]=useState(false);
 if(!product.image||failed)return <div className="perfume-identity" role="img" aria-label={product.name}><span>SOLUNA</span><i aria-hidden="true"/><strong>{product.name}</strong></div>;
 return <div className="product-image"><ResponsiveImage src={product.image} alt={product.name} priority={eager} sizes={sizes} onError={()=>setFailed(true)}/></div>;
}
