'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Pause,Play} from 'lucide-react';
import OfferBanner from './OfferBanner';
export type OfferSlide={id:string;title:string;description:string;schedule:string;image?:string;dates?:string};
export default function OfferCarousel({offers,onSelect,suspended=false}:{offers:OfferSlide[];onSelect?:(id:string)=>void;suspended?:boolean}){
 const track=useRef<HTMLDivElement>(null);
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false),[hidden,setHidden]=useState(false),[reduced,setReduced]=useState(false);
 const stopped=paused||hovered||focused||hidden||reduced||suspended;
 useEffect(()=>{const m=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(m.matches);update();m.addEventListener('change',update);const visibility=()=>setHidden(document.hidden);visibility();document.addEventListener('visibilitychange',visibility);return()=>{m.removeEventListener('change',update);document.removeEventListener('visibilitychange',visibility);};},[]);
 function go(next:number){const n=(next+offers.length)%offers.length;if(track.current)track.current.scrollTo({left:n*track.current.clientWidth,behavior:reduced?'auto':'smooth'});setIndex(n);}
 useEffect(()=>{if(stopped||offers.length<2)return;const timer=window.setTimeout(()=>go(index+1),20000);return()=>window.clearTimeout(timer);},[index,stopped,offers.length]);
 if(!offers.length)return null;
 return <section className="offer-carousel" aria-label="Restaurant offers" aria-roledescription="carousel" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setFocused(false);}}>
  <div className="offer-carousel-heading"><span>GOOD REASONS TO STAY A LITTLE LONGER</span><small>Swipe to explore</small></div>
  <div className="offer-carousel-track" ref={track} onScroll={e=>{const el=e.currentTarget;const n=Math.round(el.scrollLeft/el.clientWidth);if(n!==index&&n>=0&&n<offers.length)setIndex(n);}} aria-live={stopped?'polite':'off'}>
   {offers.map((o,i)=><div className="offer-carousel-slide" key={o.id} role="group" aria-roledescription="slide" aria-label={(i+1)+' of '+offers.length} aria-hidden={i!==index}><OfferBanner {...o} onOpen={onSelect?()=>onSelect(o.id):undefined} buttonTabIndex={i===index?0:-1}/></div>)}
  </div>
  {offers.length>1&&<div className="offer-carousel-controls"><button type="button" className="offer-arrow" aria-label="Previous offer" onClick={()=>go(index-1)}><ArrowLeft size={17}/></button><div className="offer-carousel-dots">{offers.map((o,i)=><button type="button" key={o.id} aria-label={'Show '+o.title} aria-pressed={i===index} onClick={()=>go(i)}><span/></button>)}</div><button className="offer-pause" type="button" aria-label={paused?'Resume automatic offers':'Pause automatic offers'} aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused?<Play size={13}/>:<Pause size={13}/>}<span>{paused?'Play':'Pause'}</span></button><button className="offer-arrow" type="button" aria-label="Next offer" onClick={()=>go(index+1)}><ArrowRight size={17}/></button></div>}
 </section>
}
