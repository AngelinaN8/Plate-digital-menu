import {DEFAULT_MENU,type Menu} from './menu-types';
import ar from './sample-ar.json';
import moods from './sample-moods.json';
import type {MoodTags} from './dish-moods';
import {translationSource} from './menu-languages';
export const SAMPLE_MENU:Menu={...DEFAULT_MENU,dishes:DEFAULT_MENU.dishes.map(d=>({...d,moodTags:(moods as Record<string,MoodTags>)[d.id]})),featuredDishIds:[],translations:[{code:'ar',values:ar,sourceText:translationSource(DEFAULT_MENU),reviewed:true}]};
