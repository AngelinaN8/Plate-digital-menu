import {getPlateUser} from '@/lib/supabase-auth';
import {redirect} from 'next/navigation';
import Studio from '@/components/plate/Studio';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getPlateUser();if(!user)redirect('/login');return <Studio displayName={user.displayName}/>}
