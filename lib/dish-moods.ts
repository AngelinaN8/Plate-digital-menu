import type {Dish} from './menu-types';
export const MOODS=['Fresh','Light','Rich','Comforting','Spicy'] as const;
export type Mood=typeof MOODS[number];
export type MoodTags={values:Mood[];reviewed:boolean;sourceHash:string};
export async function moodHash(d:Pick<Dish,'name'|'description'|'portion'|'preparation'|'recipe'|'allergens'>){const data=JSON.stringify([d.name,d.description,d.portion,d.preparation,d.recipe||'',d.allergens]);const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(data));return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');}
