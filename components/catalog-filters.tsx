'use client';
import {useState} from 'react';
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from '@/components/ui/accordion';
import {Checkbox} from '@/components/ui/checkbox';
import {Slider} from '@/components/ui/slider';
import {Search,SlidersHorizontal} from 'lucide-react';
import {useLanguage} from '@/components/language-provider';
import {brandOf,concentrationOf,filterCount,emptyFilters,MAX_PRICE,type Filters} from '@/lib/catalog-filters';
import {products,money,normalize,type Product} from '@/lib/catalog';

export function CatalogFilters({filters,onChange,items=products}:{filters:Filters;onChange:(f:Filters)=>void;items?:Product[]}){
 const {t}=useLanguage();const [brandQuery,setBrandQuery]=useState('');
 const brands=Array.from(new Set(items.map(brandOf))).sort((a,b)=>a.localeCompare(b));
 const count=(test:(p:Product)=>boolean)=>items.filter(test).length;
 const sizes=[...new Set(items.map(p=>p.volumeMl).filter((v):v is number=>v!==null))].sort((a,b)=>a-b);
 const genders=[...new Set(items.map(p=>p.category))];
 const matches=brands.filter(b=>normalize(b).includes(normalize(brandQuery)));
 type ChoiceKey='brands'|'genders'|'sizes'|'concentrations';
 function toggle(key:ChoiceKey,value:string){onChange({...filters,[key]:filters[key].includes(value)?filters[key].filter(v=>v!==value):[...filters[key],value]})}
 const options=(key:ChoiceKey,values:[string,string,number][])=>values.filter(([, ,total])=>total>0).map(([value,label,total])=><label className="filter-choice" key={value}><Checkbox checked={filters[key].includes(value)} onCheckedChange={()=>toggle(key,value)}/><span>{label}</span><small>({total})</small></label>);
 function clear(){onChange(emptyFilters());setBrandQuery('')}
 return <div className="catalog-filters"><div className="filters-heading"><h2><SlidersHorizontal size={17}/>{t('Filtros','Filters')} <span>({filterCount(filters)})</span></h2></div><p className="filter-catalog-label">{t('Encuentra tu esencia','Find your essence')}</p><Accordion defaultValue={['price','brands','sizes','gender']} multiple>
 <AccordionItem value="price"><AccordionTrigger>{t('Rango de precio','Price range')}</AccordionTrigger><AccordionContent><div className="price-values"><span>{money(filters.priceRange[0])}</span><span>{money(filters.priceRange[1])}</span></div><Slider thumbLabels={[t('Precio mínimo','Minimum price'),t('Precio máximo','Maximum price')]} min={0} max={MAX_PRICE} step={500} value={filters.priceRange} onValueChange={value=>{if(Array.isArray(value))onChange({...filters,priceRange:[Number(value[0]),Number(value[1])]})}}/></AccordionContent></AccordionItem>
 {brands.length>1&&<AccordionItem value="brands"><AccordionTrigger>{t('Marcas','Brands')}</AccordionTrigger><AccordionContent><div className="brand-search"><Search size={15}/><input aria-label={t('Buscar una marca','Find a brand')} placeholder={t('Buscar una marca','Find a brand')} value={brandQuery} onChange={e=>setBrandQuery(e.target.value)}/></div><div className="filter-scroll">{options('brands',matches.map(b=>[b,b,count(p=>p.brand===b)]))}</div>{matches.length===0&&<p>{t('No encontramos esa marca.','No matching brands.')}</p>}</AccordionContent></AccordionItem>}
 <AccordionItem value="sizes"><AccordionTrigger>{t('Presentación','Size')}</AccordionTrigger><AccordionContent><div className="filter-scroll">{options('sizes',sizes.map(v=>[String(v),`${v} ml`,count(p=>p.volumeMl===v)]))}</div></AccordionContent></AccordionItem>
 {genders.length>1&&<AccordionItem value="gender"><AccordionTrigger>{t('Categoría','Category')}</AccordionTrigger><AccordionContent>{options('genders',genders.map(g=>[g,g==='Hombre'?t('Hombre','Men'):t('Mujer','Women'),count(p=>p.category===g)]))}</AccordionContent></AccordionItem>}
 {items.some(p=>concentrationOf(p))&&<AccordionItem value="base"><AccordionTrigger>{t('Concentración','Concentration')}</AccordionTrigger><AccordionContent>{options('concentrations',[['edp','Eau de Parfum · EDP',count(p=>concentrationOf(p)==='edp')],['edt','Eau de Toilette · EDT',count(p=>concentrationOf(p)==='edt')],['parfum','Parfum',count(p=>concentrationOf(p)==='parfum')]])}</AccordionContent></AccordionItem>}
 </Accordion><button className="filter-clear" onClick={clear}>{t('Limpiar filtros','Clear filters')}</button></div>;
}
