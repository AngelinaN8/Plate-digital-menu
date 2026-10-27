import {env} from 'cloudflare:workers';
import {createAdminClient} from '@supabase/server/core';
import {and,eq,gte,isNull,lt,sql} from 'drizzle-orm';
import {getDb} from './index';
import {menus,uploads,menuMetrics,aiUsage} from './schema';

export type MenuRow=typeof menus.$inferSelect;
export type UploadRow=typeof uploads.$inferSelect;
type MetricRow=typeof menuMetrics.$inferSelect;
type PgMenu={owner_id:string;slug:string;draft:unknown;published:unknown|null;updated_at:string;published_at:string|null};
const settings=()=>({provider:env.DATABASE_PROVIDER||process.env.DATABASE_PROVIDER||'d1',url:env.SUPABASE_URL||process.env.SUPABASE_URL,key:env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SECRET_KEY});
export const databaseProvider=()=>settings().provider;
function supabase(){const s=settings();if(!s.url||!s.key)throw new Error('Supabase server credentials are not configured.');return createAdminClient({env:{url:s.url,secretKeys:{default:s.key}}});}
function result<T>(r:{data:T;error:unknown}):T{if(r.error)throw new Error('The database request could not be completed.');return r.data;}
const menuRow=(r:PgMenu):MenuRow=>({ownerId:r.owner_id,slug:r.slug,draft:JSON.stringify(r.draft),published:r.published===null?null:JSON.stringify(r.published),updatedAt:r.updated_at,publishedAt:r.published_at});
const pgMenu=(r:Partial<MenuRow>)=>Object.fromEntries(Object.entries(r).map(([k,v])=>[({ownerId:'owner_id',updatedAt:'updated_at',publishedAt:'published_at'} as Record<string,string>)[k]||k,(k==='draft'||k==='published')&&typeof v==='string'?JSON.parse(v):v]));

export async function findMenu(ownerId:string):Promise<MenuRow|undefined>{
 if(databaseProvider()!=='supabase')return getDb().select().from(menus).where(eq(menus.ownerId,ownerId)).get();
 const r=result(await supabase().from('plate_menus').select('*').eq('owner_id',ownerId).maybeSingle()) as PgMenu|null;return r?menuRow(r):undefined;
}
export async function findPublishedMenu(slug:string):Promise<MenuRow|undefined>{
 if(databaseProvider()!=='supabase')return getDb().select().from(menus).where(eq(menus.slug,slug)).get();
 const r=result(await supabase().from('plate_menus').select('*').eq('slug',slug).maybeSingle()) as PgMenu|null;return r?menuRow(r):undefined;
}
export async function createMenu(row:MenuRow){
 if(databaseProvider()!=='supabase'){await getDb().insert(menus).values(row).onConflictDoNothing();return;}
 result(await supabase().from('plate_menus').upsert(pgMenu(row),{onConflict:'owner_id',ignoreDuplicates:true}));
}
export async function updateMenu(ownerId:string,patch:Partial<MenuRow>,expected?:{draft:string;published:string|null}):Promise<MenuRow|undefined>{
 if(databaseProvider()!=='supabase')return getDb().update(menus).set(patch).where(expected?and(eq(menus.ownerId,ownerId),eq(menus.draft,expected.draft),expected.published===null?isNull(menus.published):eq(menus.published,expected.published)):eq(menus.ownerId,ownerId)).returning().get();
 if(expected){
  const rows=result(await supabase().rpc('plate_compare_and_swap_menu',{p_owner_id:ownerId,p_expected_draft:JSON.parse(expected.draft),p_expected_published:expected.published===null?null:JSON.parse(expected.published),p_draft:JSON.parse(patch.draft!),p_published:patch.published===null?null:JSON.parse(patch.published!),p_updated_at:patch.updatedAt,p_published_at:patch.publishedAt})) as PgMenu[];
  return rows[0]?menuRow(rows[0]):undefined;
 }
 const row=result(await supabase().from('plate_menus').update(pgMenu(patch)).eq('owner_id',ownerId).select('*').maybeSingle()) as PgMenu|null;return row?menuRow(row):undefined;
}
export async function findUpload(id:string,ownerId?:string):Promise<UploadRow|undefined>{
 if(databaseProvider()!=='supabase')return getDb().select().from(uploads).where(ownerId?and(eq(uploads.id,id),eq(uploads.ownerId,ownerId)):eq(uploads.id,id)).get();
 let q=supabase().from('plate_uploads').select('*').eq('id',id);if(ownerId)q=q.eq('owner_id',ownerId);
 const r=result(await q.maybeSingle()) as {id:string;owner_id:string;object_key:string;mime:string;rights_confirmed_at:string;rights_source:string;created_at:string}|null;
 return r?{id:r.id,ownerId:r.owner_id,objectKey:r.object_key,mime:r.mime,rightsConfirmedAt:r.rights_confirmed_at,rightsSource:r.rights_source,createdAt:r.created_at}:undefined;
}
export async function createUpload(row:UploadRow){
 if(databaseProvider()!=='supabase'){await getDb().insert(uploads).values(row);return;}
 result(await supabase().from('plate_uploads').insert({id:row.id,owner_id:row.ownerId,object_key:row.objectKey,mime:row.mime,rights_confirmed_at:row.rightsConfirmedAt,rights_source:row.rightsSource,created_at:row.createdAt}));
}
export async function uploadCount(ownerId:string){
 if(databaseProvider()!=='supabase')return (await getDb().select({count:sql<number>`count(*)`}).from(uploads).where(eq(uploads.ownerId,ownerId)).get())?.count||0;
 const r=await supabase().from('plate_uploads').select('id',{count:'exact',head:true}).eq('owner_id',ownerId);if(r.error)throw new Error('Photo count unavailable.');return r.count||0;
}
export async function recordMetric(row:Omit<MetricRow,'count'>){
 if(databaseProvider()!=='supabase'){await getDb().insert(menuMetrics).values({...row,count:1}).onConflictDoUpdate({target:menuMetrics.key,set:{count:sql`${menuMetrics.count} + 1`},setWhere:sql`${menuMetrics.count} < 10000`});return;}
 result(await supabase().rpc('plate_increment_metric',{p_key:row.key,p_slug:row.slug,p_day:row.day,p_kind:row.kind,p_dish_id:row.dishId}));
}
export async function listMetrics(slug:string,since:string):Promise<MetricRow[]>{
 if(databaseProvider()!=='supabase')return getDb().select().from(menuMetrics).where(and(eq(menuMetrics.slug,slug),gte(menuMetrics.day,since)));
 const rows=result(await supabase().from('plate_menu_metrics').select('*').eq('slug',slug).gte('day',since)) as {key:string;slug:string;day:string;kind:string;dish_id:string;count:number}[];
 return rows.map(r=>({...r,dishId:r.dish_id}));
}
export async function pruneMetrics(cutoff:string){
 if(databaseProvider()!=='supabase'){await getDb().delete(menuMetrics).where(lt(menuMetrics.day,cutoff));return;}
 result(await supabase().from('plate_menu_metrics').delete().lt('day',cutoff));
}
export async function reserveAi(key:string,day:string,limit:number):Promise<boolean>{
 if(databaseProvider()!=='supabase'){const rows=await getDb().insert(aiUsage).values({key,day,count:1}).onConflictDoUpdate({target:aiUsage.key,set:{count:sql`${aiUsage.count} + 1`},setWhere:sql`${aiUsage.count} < ${limit}`}).returning({count:aiUsage.count});return rows.length>0;}
 const count=result(await supabase().rpc('plate_reserve_ai',{p_key:key,p_day:day,p_limit:limit})) as number;return count>0;
}
export async function pruneAi(cutoff:string){
 if(databaseProvider()!=='supabase'){await getDb().delete(aiUsage).where(lt(aiUsage.day,cutoff));return;}
 result(await supabase().from('plate_ai_usage').delete().lt('day',cutoff));
}
