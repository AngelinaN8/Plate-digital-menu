import type {Dish} from './menu-types';
export type ServingStyle='one'|'sharing'|'unspecified';
// Legacy menus keep only serving information explicitly stated in their source.
export function servingStyle(d:Pick<Dish,'servingStyle'|'portion'|'category'>):ServingStyle{if(d.servingStyle)return d.servingStyle;if(/\b(serves?\s+(one|1)|for one)\b/i.test(d.portion))return 'one';if(/\bto share\b/i.test(d.category)||/\b[2-9]\s*(persons|people)\b|\bserves?\s+[2-9]\b/i.test(d.portion))return 'sharing';return 'unspecified'}

export function portionDetail(portion:string){return portion.replace(/(?:^|[·,]\s*)\s*(?:serves?\s+(?:one|1)(?:\s+person)?|for one)\b[. ]*/gi,'').replace(/^\s*[·,]|[·,]\s*$/g,'').trim()}
