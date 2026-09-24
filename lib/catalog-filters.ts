import {products,type Product} from './catalog';
export const MAX_PRICE=Math.ceil(Math.max(...products.map(p=>p.price??0))/5000)*5000;
export type Filters={brands:string[];genders:string[];sizes:string[];concentrations:string[];priceRange:[number,number]};
export const emptyFilters=():Filters=>({brands:[],genders:[],sizes:[],concentrations:[],priceRange:[0,MAX_PRICE]});
export const brandOf=(p:Product)=>p.brand;
export function concentrationOf(p:Product):string{
 if(/\bEDP\b|Eau de Parfum/i.test(p.name))return 'edp';
 if(/\bEDT\b|Eau de Toilette/i.test(p.name))return 'edt';
 if(/\bParfum\b/i.test(p.name))return 'parfum';
 return '';
}
export const sizeOf=(p:Product)=>p.volumeMl===null?'':String(p.volumeMl);
export function applyFilters(items:Product[],filters:Filters){
 const fullPrice=filters.priceRange[0]===0&&filters.priceRange[1]===MAX_PRICE;
 return items.filter(p=>(!filters.brands.length||filters.brands.includes(p.brand))&&(!filters.genders.length||filters.genders.includes(p.category))&&(!filters.sizes.length||filters.sizes.includes(sizeOf(p)))&&(!filters.concentrations.length||filters.concentrations.includes(concentrationOf(p)))&&(p.price===null?fullPrice:p.price>=filters.priceRange[0]&&p.price<=filters.priceRange[1]));
}
export const filterCount=(filters:Filters)=>filters.brands.length+filters.genders.length+filters.sizes.length+filters.concentrations.length+(filters.priceRange[0]!==0||filters.priceRange[1]!==MAX_PRICE?1:0);
