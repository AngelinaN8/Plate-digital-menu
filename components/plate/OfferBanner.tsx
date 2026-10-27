import {ArrowUpRight} from 'lucide-react';
export default function OfferBanner({title,description,schedule,image,dates}:{title:string;description:string;schedule:string;image?:string;dates?:string}){
 return <article className={'offer-banner '+(!image?'offer-no-photo':'')}>
  {image&&<img className="offer-photo" src={image} alt="" loading="lazy"/>}
  <div className="offer-shade"/>
  <div className="offer-banner-copy"><span className="offer-schedule">{schedule}</span><h3>{title}</h3><p>{description}</p>{dates&&<small>{dates}</small>}<span className="offer-server">Ask your server <ArrowUpRight size={14}/></span></div>
 </article>
}
