'use client';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import {Pagination,PaginationContent,PaginationItem} from '@/components/ui/pagination';
import {useLanguage} from '@/components/language-provider';

export const CATALOG_PAGE_SIZE=12;

export function CatalogPagination({page,total,onPageChange}:{page:number;total:number;onPageChange:(page:number)=>void}){
 const {t}=useLanguage();
 const pageCount=Math.max(1,Math.ceil(total/CATALOG_PAGE_SIZE));
 const firstPage=Math.max(1,Math.min(page-2,pageCount-4));
 const pages=Array.from({length:Math.min(5,pageCount)},(_,index)=>firstPage+index);
 return <div className="catalog-pagination-wrap">
  <p className="pagination-summary" role="status" aria-atomic="true">{(page-1)*CATALOG_PAGE_SIZE+1}–{Math.min(page*CATALOG_PAGE_SIZE,total)} {t('de','of')} {total} {total===1?t('fragancia','fragrance'):t('fragancias','fragrances')}</p>
  {pageCount>1&&<Pagination className="catalog-pagination" aria-label={t('Páginas del catálogo','Catalogue pages')}>
   <PaginationContent>
    <PaginationItem><button type="button" aria-label={t('Página anterior','Previous page')} disabled={page===1} onClick={()=>onPageChange(page-1)}><ChevronLeft size={17}/></button></PaginationItem>
    {pages.map(number=><PaginationItem key={number} className={Math.abs(page-number)>1?'extra-page':undefined}><button type="button" aria-current={number===page?'page':undefined} aria-label={t(`Página ${number}`,`Page ${number}`)} onClick={()=>onPageChange(number)}>{number}</button></PaginationItem>)}
    <PaginationItem><button type="button" aria-label={t('Página siguiente','Next page')} disabled={page===pageCount} onClick={()=>onPageChange(page+1)}><ChevronRight size={17}/></button></PaginationItem>
   </PaginationContent>
  </Pagination>}
  {pageCount>1&&<p className="pagination-position">{t(`Página ${page} de ${pageCount}`,`Page ${page} of ${pageCount}`)}</p>}
 </div>;
}
