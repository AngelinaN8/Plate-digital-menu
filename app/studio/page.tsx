import {requireChatGPTUser} from '@/app/chatgpt-auth';
import Studio from '@/components/plate/Studio';
export const dynamic='force-dynamic';
export default async function Page(){const user=await requireChatGPTUser('/studio');return <Studio displayName={user.displayName}/>}
