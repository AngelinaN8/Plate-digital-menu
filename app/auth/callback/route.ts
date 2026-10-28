import {authClient} from '@/lib/supabase-auth';
export const dynamic='force-dynamic';
export async function GET(request:Request){const url=new URL(request.url),code=url.searchParams.get('code');if(code){const client=await authClient();const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return Response.redirect(new URL('/studio',request.url),303)}return Response.redirect(new URL('/login?error=confirmation',request.url),303)}
