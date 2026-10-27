'use client';
import {useEffect,useState} from 'react';
import type {Menu} from '@/lib/menu-types';
import MenuView from './MenuView';
export default function PublishedMenu({slug}:{slug:string}){const [menu,setMenu]=useState<Menu|null>(null),[error,setError]=useState('');useEffect(()=>{let active=true;fetch('/api/public/'+encodeURIComponent(slug)).then(async r=>{const d=await r.json() as {menu:Menu;error?:string};if(!r.ok)throw new Error(d.error||'Menu unavailable');if(active)setMenu(d.menu)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[slug]);if(error)return <div className="loading"><h1 style={{fontSize:38}}>This menu isn’t ready yet.</h1><p style={{margin:'20px 0'}}>{error}</p><a className="button" href="/">Back to Plate</a></div>;if(!menu)return <div className="loading">A good look is on its way…</div>;return <MenuView menu={menu} slug={slug}/>}
