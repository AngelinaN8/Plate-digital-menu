import ExamplePicker from '@/components/plate/ExamplePicker';
import {AFRICAN_QUEEN_MENU} from '@/lib/examples/african-queen';
import MenuView from '@/components/plate/MenuView';
import {SAMPLE_MENU as DEFAULT_MENU} from '@/lib/sample-menu';
export default async function Demo({searchParams}:{searchParams:Promise<{style?:string;restaurant?:string;embed?:string}>}){const q=await searchParams;if(q.restaurant==='african-queen')return <>{q.embed!=='1'&&<ExamplePicker selected="african-queen"/>}<MenuView menu={AFRICAN_QUEEN_MENU} sample/></>;const style=q.style==='editorial'||q.style==='classic'||q.style==='gallery'?q.style:DEFAULT_MENU.template;return <>{q.embed!=='1'&&<ExamplePicker/>}<MenuView menu={{...DEFAULT_MENU,template:style,featuredDishIds:[],events:DEFAULT_MENU.events.map(e=>({...e,afterCategory:'__top'}))}} sample/></>}
