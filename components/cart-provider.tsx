'use client';
import {createContext,useContext,useEffect,useState,type Dispatch,type SetStateAction,type ReactNode} from 'react';
import {products,type Cart} from '@/lib/catalog';
const CartContext=createContext<{cart:Cart;setCart:Dispatch<SetStateAction<Cart>>}|null>(null);
export function CartProvider({children}:{children:ReactNode}){
 const [cart,setCart]=useState<Cart>({});
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  try{
   const saved=JSON.parse(localStorage.getItem('soluna-cart')??'{}');
   const restored:Cart={};
   if(saved&&typeof saved==='object'&&!Array.isArray(saved)){
    for(const product of products){const quantity=saved[product.id];if(Number.isInteger(quantity)&&quantity>0)restored[product.id]=Math.min(quantity,99);}
   }
   setCart(restored);
  }catch{/* Storage can be unavailable; the current session still works. */}
  setReady(true);
 },[]);
 useEffect(()=>{if(ready){try{localStorage.setItem('soluna-cart',JSON.stringify(cart));}catch{}}},[cart,ready]);
 return <CartContext.Provider value={{cart,setCart}}>{children}</CartContext.Provider>;
}
export function useCart(){const value=useContext(CartContext);if(!value)throw new Error('CartProvider is required');return value;}
