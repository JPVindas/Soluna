import type {ImgHTMLAttributes} from 'react';
import variants from '@/lib/image-variants.json';

type Props=ImgHTMLAttributes<HTMLImageElement>&{src:string;alt:string;priority?:boolean};
export function ResponsiveImage({src,alt,priority=false,sizes='(max-width: 640px) 45vw, (max-width: 1100px) 32vw, 340px',...props}:Props){
 const asset=variants[src as keyof typeof variants];
 const image=asset?.variants;
 return <img {...props} src={image?.[1]?.src??image?.[0]?.src??src} alt={alt}
  width={asset?.width} height={asset?.height}
  srcSet={image?.map(item=>`${item.src} ${item.width}w`).join(', ')} sizes={sizes}
  loading={priority?'eager':'lazy'} fetchPriority={priority?'high':undefined} decoding="async"/>;
}
