'use client';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {useLanguage} from '@/components/language-provider';
import type {SortOrder} from '@/lib/catalog';

export function CatalogSort({value,onChange}:{value:SortOrder;onChange:(value:SortOrder)=>void}){
 const {t}=useLanguage();
 const options=[{value:'recommended',label:t('Recomendados','Recommended')},{value:'price-asc',label:t('Precio: menor a mayor','Price: low to high')},{value:'price-desc',label:t('Precio: mayor a menor','Price: high to low')},{value:'name',label:t('Nombre A–Z','Name A–Z')}];
 return <div className="catalog-sort"><span>{t('Ordenar por','Sort by')}</span><Select value={value} items={options} onValueChange={next=>{if(next)onChange(next as SortOrder)}}><SelectTrigger aria-label={t('Ordenar productos','Sort products')}><SelectValue/></SelectTrigger><SelectContent className="catalog-sort-options">{options.map(option=><SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>;
}
