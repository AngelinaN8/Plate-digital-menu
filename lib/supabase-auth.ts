import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {env} from 'cloudflare:workers';
export const authSettings=()=>({url:env.SUPABASE_URL||process.env.SUPABASE_URL||'',key:env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_PUBLISHABLE_KEY||''});
export async function authClient(){
 const {url,key}=authSettings();const jar=await cookies();
 return createServerClient(url,key,{cookies:{
  getAll:()=>jar.getAll(),
  setAll:items=>{for(const {name,value,options}of items){try{jar.set(name,value,{...options,sameSite:'lax',secure:process.env.NODE_ENV==='production',httpOnly:true})}catch{/* RSC cannot write cookies; auth routes can. */}}}
 }});
}
export async function getPlateUser(){const client=await authClient();const {data:{user},error}=await client.auth.getUser();if(error||!user||!user.email_confirmed_at)return null;return {userId:user.id,email:user.email||'',displayName:user.user_metadata?.full_name||user.email||'Your restaurant'};}
export async function enabledProviders(){try{const {url,key}=authSettings();const r=await fetch(url+'/auth/v1/settings',{headers:{apikey:key},signal:AbortSignal.timeout(10000)});const data=await r.json() as {external?:Record<string,boolean>};return {google:!!data.external?.google,apple:!!data.external?.apple,email:!!data.external?.email}}catch{return {google:false,apple:false,email:false}}}
