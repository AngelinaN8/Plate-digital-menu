import Studio from '@/components/plate/Studio';
import {SAMPLE_MENU} from '@/lib/sample-menu';
import {AFRICAN_QUEEN_MENU} from '@/lib/examples/african-queen';
export default async function Page({searchParams}:{searchParams:Promise<{restaurant?:string}>}){const q=await searchParams;const key=q.restaurant==='african-queen'?'african-queen':'terrace';return <Studio displayName="Sample workspace" sample sampleKey={key} sampleMenu={key==='african-queen'?AFRICAN_QUEEN_MENU:SAMPLE_MENU}/>}
