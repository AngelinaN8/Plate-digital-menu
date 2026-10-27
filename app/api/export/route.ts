import {env} from 'cloudflare:workers';
import {and,eq} from 'drizzle-orm';
import {getDb} from '@/db';
import {uploads} from '@/db/schema';
import {owner,getOwnMenu,failure,ApiError} from '@/lib/menu-server';
import {normalizeMenu} from '@/lib/menu-types';
import {guestNutrition,NUTRITION_DISCLAIMER} from '@/lib/nutrition';
import {eventScheduleLabel} from '@/lib/event-schedule';
export const dynamic='force-dynamic';
const escape=(value:unknown)=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export async function GET(request:Request){
 try{
  const ownerId=await owner();const row=await getOwnMenu(ownerId);const menu=normalizeMenu(JSON.parse(row.draft));
  if(menu.dishes.length>40)throw new ApiError(400,'The one-time menu export supports up to 40 dishes. Download your full JSON backup from Style & details.');
  const images=new Map<string,string>();let total=0;
  const image=async(path:string|undefined)=>{
   if(!path)return '';if(images.has(path))return images.get(path)!;
   let result=path;
   if(path.startsWith('/api/images/')){
    const id=path.slice('/api/images/'.length);const upload=await getDb().select().from(uploads).where(and(eq(uploads.id,id),eq(uploads.ownerId,ownerId))).get();
    const object=upload&&env.BUCKET?await env.BUCKET.get(upload.objectKey):null;
    if(!object||!upload)return '';
    total+=object.size;if(total>20*1024*1024)throw new ApiError(413,'This export contains more than 20 MB of photos. Use smaller photos or download the JSON backup.');
    const bytes=new Uint8Array(await object.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
    result='data:'+upload.mime+';base64,'+btoa(binary);
   }else if(path.startsWith('/images/'))result=new URL(path,request.url).href;
   else if(!path.startsWith('https://'))return '';
   images.set(path,result);return result;
  };
  const dishes=await Promise.all(menu.dishes.filter(d=>d.available).map(async d=>{const src=await image(d.image);const n=guestNutrition(d.nutrition);return `<article>${src?`<img alt="${escape(d.name)}" src="${escape(src)}">`:''}<div><span class="category">${escape(d.category)}</span><h2>${escape(d.name)} <b>${escape(menu.currency)} ${escape(d.price??'To confirm')}</b></h2><p>${escape(d.description)}</p><p>${escape(d.portion)}</p><p>${escape(d.preparation)}</p>${n?`<p class="nutrition">Approx. per serving: ${n.energyKcal} kcal · Protein ${n.proteinG} g · Carbs ${n.carbsG} g · Fat ${n.fatG} g<br><small>${escape(n.source==='ai-estimate'?'AI estimate. ':'Restaurant-provided. ')}${escape(NUTRITION_DISCLAIMER)}</small></p>`:''}<small>Restaurant allergen notes: ${escape(d.allergens.join(', ')||'Please ask your server.')}</small></div></article>`;}));
  const offers=[...(menu.promotion.enabled?[{title:menu.promotion.title,description:menu.promotion.description,image:menu.promotion.image,schedule:menu.promotion.days.join(' · ')}]:[]),...menu.events.filter(e=>e.enabled).map(e=>({...e,schedule:eventScheduleLabel(e)}))];
  const banners=await Promise.all(offers.map(async o=>{const src=await image(o.image);return `<aside>${src?`<img src="${escape(src)}" alt="">`:''}<div><small>${escape(o.schedule)}</small><h2>${escape(o.title)}</h2><p>${escape(o.description)}</p></div></aside>`;}));
  const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(menu.restaurantName)} — Menu</title><style>*{box-sizing:border-box}body{margin:0;background:#f7f5fa;color:#241b34;font-family:Arial,sans-serif}main{max-width:900px;margin:60px auto;padding:0 24px}header{padding:30px 0 50px}h1{font-size:54px;letter-spacing:-3px;color:${menu.accent}}h2{font-size:25px;letter-spacing:-1px}p{font-size:14px;line-height:1.8;color:#796d86}article{background:white;border-radius:20px;overflow:hidden;margin:24px 0;border:1px solid #e2dbe9;display:grid;grid-template-columns:40% 1fr}article>img{width:100%;height:100%;object-fit:cover;min-height:280px}article>div{padding:26px}article b{display:block;font-size:30px;margin-top:12px;color:${menu.accent}}small,.category{font-size:11px;line-height:1.8}aside{position:relative;background:#251b35;color:white;border-radius:20px;overflow:hidden;margin:24px 0}aside img{width:100%;height:230px;object-fit:cover;opacity:.5}aside>div{padding:25px}aside p{color:#e1d7eb}.nutrition{background:#f1ebfa;padding:15px;border-radius:10px}footer{margin:40px 0;color:#8b7b9c;font-size:11px;line-height:1.8}@media(max-width:600px){h1{font-size:42px}article{grid-template-columns:1fr}article>img{height:230px;min-height:0}}</style><main><header><small>THE VISUAL MENU</small><h1>${escape(menu.restaurantName)}</h1><p>${escape(menu.tagline)}</p></header>${dishes.join('')}${banners.join('')}<footer>Static menu snapshot · ${new Date().toISOString().slice(0,10)}. Availability and offers do not update automatically. Please ask your server about allergies and current offers. Uploaded photos are embedded; externally linked photos require internet access and remain subject to their host’s availability.</footer></main></html>`;
  return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Content-Disposition':'attachment; filename="plate-menu.html"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch(e){return failure(e);}
}
