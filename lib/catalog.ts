import inventory from './inventory.json';

export type Category='Hombre'|'Mujer';
export type Product={id:string;slug:string;name:string;brand:string;category:Category;volumeMl:number|null;size:string;price:number|null;image:string|null;availability:'on-request'|'available'|'unavailable';featured:boolean;bestseller:boolean;line?:string};
export type Cart=Record<string,number>;
export type SortOrder='recommended'|'price-asc'|'price-desc'|'name';
export const products:Product[]=inventory.map(item=>({...item,category:item.category as Category,availability:item.availability as Product['availability'],size:item.volumeMl===null?'':`${item.volumeMl} ml`}));
export const womenProducts=products.filter(p=>p.category==='Mujer');
export const menProducts=products.filter(p=>p.category==='Hombre');
export const money=(amount:number)=>'₡'+new Intl.NumberFormat('es-CR',{maximumFractionDigits:0}).format(amount).replace(/[\s\u00a0]/g,'.');
export const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').toLowerCase().trim();
export const slugify=(value:string)=>normalize(value).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function productName(product:Product){return normalize(product.name).includes(normalize(product.brand))?product.name:`${product.brand} ${product.name}`}
export function brandsFor(category?:string){return [...new Set(products.filter(p=>!category||category==='Todos'||p.category===category).map(p=>p.brand))].sort((a,b)=>a.localeCompare(b,'es'))}
export function brandHref(brand:string,category?:string){return category==='Hombre'||category==='Mujer'?`/${category==='Hombre'?'hombre':'mujer'}/${slugify(brand)}`:`/perfumes?marca=${slugify(brand)}`}
export function filterProducts(category:string,query=''){
 const words=normalize(query).split(/\s+/).filter(Boolean);
 return products.filter(product=>{
  const categoryMatch=category==='Todos'||(category==='Más vendidos'?product.bestseller:product.category===category);
  const aliases=product.brand==='Jean Paul Gaultier'?'JPG':product.brand==='Yves Saint Laurent'?'YSL':product.brand==='Paco Rabanne'?'Rabanne':'';
  const haystack=normalize(`${product.name} ${product.brand} ${product.line??''} ${aliases}`);
  return categoryMatch&&words.every(word=>haystack.includes(word));
 });
}
export function sortProducts(items:Product[],order:SortOrder):Product[]{
 if(order==='recommended')return [...items].sort((a,b)=>Number(b.featured||b.bestseller)-Number(a.featured||a.bestseller));
 return [...items].sort((a,b)=>{
  if(order==='name')return a.name.localeCompare(b.name,'es');
  if(a.price===null)return b.price===null?0:1;
  if(b.price===null)return -1;
  return order==='price-asc'?a.price-b.price:b.price-a.price;
 });
}
export function updateCart(cart:Cart,id:string,delta:number):Cart{
 if(!products.some(p=>p.id===id)||!Number.isInteger(delta))throw new Error('Producto o cantidad no válido');
 const next={...cart};const quantity=Math.min(99,Math.max(0,(next[id]??0)+delta));
 if(quantity===0)delete next[id];else next[id]=quantity;
 return next;
}
export function cartSummary(cart:Cart){
 const items=products.filter(p=>cart[p.id]>0);
 const subtotal=items.reduce((sum,p)=>sum+(p.price??0)*cart[p.id],0);
 return {items,subtotal,hasUnpriced:items.some(p=>p.price===null)};
}
export function orderMessage(cart:Cart,language:'es'|'en'='es'){
 const es=language==='es';const {items,subtotal,hasUnpriced}=cartSummary(cart);
 const lines=items.map(p=>[`${productName(p)} — ${es?'Cantidad':'Quantity'}: ${cart[p.id]}`,p.size,p.price===null?null:`${es?'Precio unitario':'Unit price'}: ${money(p.price)} · ${es?'Importe':'Amount'}: ${money(p.price*cart[p.id])}`].filter(Boolean).join('\n'));
 const totals=subtotal>0?`${hasUnpriced?(es?'Subtotal de productos con precio':'Subtotal of priced items'):'Subtotal'}: ${money(subtotal)}\n`:'';
 return `${es?'Hola, quiero consultar este pedido en Soluna:':'Hello, I would like to enquire about this order at Soluna:'}\n\n${lines.join('\n\n')}\n\n${totals}${es?'Envío: por coordinar.':'Shipping: to be arranged.'}\n${!hasUnpriced&&items.length?`${es?'Total de productos (sin envío)':'Product total (excluding shipping)'}: ${money(subtotal)}\n`:''}\n${es?'¿Podrían confirmarme la disponibilidad, el precio final y el costo de envío? Deseo pagar por SINPE Móvil.':'Could you confirm availability, the final price and shipping cost? I wish to pay via SINPE Móvil.'}`;
}
