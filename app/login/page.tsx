import Login from '@/components/plate/Login';
import {enabledProviders} from '@/lib/supabase-auth';
export const dynamic='force-dynamic';
export default async function Page(){return <Login providers={await enabledProviders()}/>}
