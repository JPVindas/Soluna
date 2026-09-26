import {products,slugify,type Product,type SortOrder} from './catalog';
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

export type CatalogState = {filters:Filters;query:string;sort:SortOrder;page:number};
type SearchParams = Pick<URLSearchParams,'get'|'getAll'|'has'>;
export function readCatalogState(params:SearchParams,initialBrand?:string):CatalogState {
 const choices=(key:string,values:string[])=>[...new Set(params.getAll(key).flatMap(v=>v.split(',')))].map(slug=>values.find(value=>slugify(value)===slugify(slug))).filter((v):v is string=>!!v);
 const price=(key:string,fallback:number)=>{const raw=params.get(key);const n=Number(raw);return raw!==null&&raw.trim()!==''&&Number.isFinite(n)?Math.min(MAX_PRICE,Math.max(0,n)):fallback};
 const low=price('min',0),high=price('max',MAX_PRICE);
 const order=params.get('orden');
 const page=Number(params.get('pagina'));
 return {
  filters:{
   brands:params.has('marca')?choices('marca',[...new Set(products.map(p=>p.brand))]):initialBrand?[initialBrand]:[],
   genders:choices('genero',['Hombre','Mujer']),
   sizes:choices('ml',[...new Set(products.map(sizeOf).filter(Boolean))]),
   concentrations:choices('concentracion',['edp','edt','parfum']),
   priceRange:[Math.min(low,high),Math.max(low,high)],
  },
  query:params.get('q')??'',
  sort:order==='price-asc'||order==='price-desc'||order==='name'?order:'recommended',
  page:Number.isSafeInteger(page)&&page>0?page:1,
 };
}
export function writeCatalogState(state:CatalogState):URLSearchParams {
 const params=new URLSearchParams();
 for(const [key,values] of [['marca',state.filters.brands],['genero',state.filters.genders],['ml',state.filters.sizes],['concentracion',state.filters.concentrations]] as const)for(const value of values)params.append(key,slugify(value));
 const [min,max]=state.filters.priceRange;
 if(min!==0)params.set('min',String(min));
 if(max!==MAX_PRICE)params.set('max',String(max));
 if(state.query)params.set('q',state.query);
 if(state.sort!=='recommended')params.set('orden',state.sort);
 if(state.page>1)params.set('pagina',String(state.page));
 return params;
}
