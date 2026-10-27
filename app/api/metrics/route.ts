import {findPublishedMenu,recordMetric,listMetrics,uploadCount,pruneMetrics} from '@/db/store';
import { owner, checkOrigin, getOwnMenu, readLimitedBody, failure, json, ApiError } from '@/lib/menu-server';
import type { Menu } from '@/lib/menu-types';
export const dynamic='force-dynamic';

export async function POST(request:Request) {
  try {
    checkOrigin(request);
    const body=JSON.parse(new TextDecoder().decode(await readLimitedBody(request,2048,'This activity message is too large.')));
    if(typeof body.slug!=='string'||!/^menu-[a-z0-9]{16}$/.test(body.slug)||!['menu_open','dish_view','dish_save'].includes(body.kind)) throw new ApiError(400,'Invalid menu activity.');
    const row=await findPublishedMenu(body.slug);
    if(!row?.published) throw new ApiError(404,'Menu not found.');
    const dishId=body.kind==='menu_open'?'':body.dishId;
    if(typeof dishId!=='string'||(body.kind!=='menu_open'&&!dishId)||(dishId&&!(JSON.parse(row.published) as Menu).dishes.some(d=>d.id===dishId&&d.available))) throw new ApiError(400,'Dish not found.');
    const day=new Date().toISOString().slice(0,10);
    await recordMetric({key:[body.slug,day,body.kind,dishId].join(':'),slug:body.slug,day,kind:body.kind,dishId});
    if(body.kind==='menu_open') await pruneMetrics(new Date(Date.now()-90*86400000).toISOString().slice(0,10));
    return json({recorded:true});
  } catch(e) { return failure(e); }
}

export async function GET() {
  try {
    const ownerId=await owner();const row=await getOwnMenu(ownerId);
    const since=new Date(Date.now()-29*86400000).toISOString().slice(0,10);
    const data=await listMetrics(row.slug,since);
    const photos=await uploadCount(ownerId);
    const count=(kind:string)=>data.filter(d=>d.kind===kind).reduce((s,d)=>s+d.count,0);
    const dishes=(JSON.parse(row.draft) as Menu).dishes.map(d=>({id:d.id,name:d.name,views:data.filter(m=>m.kind==='dish_view'&&m.dishId===d.id).reduce((s,m)=>s+m.count,0),saves:data.filter(m=>m.kind==='dish_save'&&m.dishId===d.id).reduce((s,m)=>s+m.count,0)})).sort((a,b)=>b.views-a.views);
    return json({since,menuOpens:count('menu_open'),dishViews:count('dish_view'),dishSaves:count('dish_save'),dishes,uploadedPhotos:photos,updatedAt:row.updatedAt,publishedAt:row.publishedAt,published:Boolean(row.published)});
  } catch(e) { return failure(e); }
}
