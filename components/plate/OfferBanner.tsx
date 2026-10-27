import {ArrowUpRight} from 'lucide-react';
export default function OfferBanner({title,description,schedule,image,dates,onOpen,buttonTabIndex=0}:{title:string;description:string;schedule:string;image?:string;dates?:string;onOpen?:()=>void;buttonTabIndex?:number}){
 return <article className={'offer-banner '+(!image?'offer-no-photo ':'')+(image?.includes('tuna-cutting-licensed')?'tuna-banner':'')}>
  {image&&<img className="offer-photo" src={image} alt="" loading="lazy"/>}
  <div className="offer-shade"/>
  <div className="offer-banner-copy"><span className="offer-schedule">{schedule}</span><h3>{title}</h3><p>{description}</p>{dates&&<small>{dates}</small>}<span className="offer-server">{onOpen?'See what’s included':'Ask your server'} <ArrowUpRight size={14}/></span></div>
  {onOpen&&<button className="offer-banner-open" type="button" onClick={onOpen} tabIndex={buttonTabIndex} aria-label={'View offer: '+title}/>}
  {image?.includes('tuna-cutting-licensed')&&<div className="offer-photo-credit"><a href="https://commons.wikimedia.org/wiki/File:202408031137_DSCN1854.jpg" target="_blank" rel="noreferrer">Photo: ウィ貴公子</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank" rel="noreferrer">CC BY-SA 4.0</a><span> · cropped</span></div>}
 </article>
}
