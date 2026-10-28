import {DEFAULT_MENU,type Menu} from './menu-types';
import ar from './sample-ar.json';
import {translationSource} from './menu-languages';
export const SAMPLE_MENU:Menu={...DEFAULT_MENU,featuredDishIds:[],translations:[{code:'ar',values:ar,sourceText:translationSource(DEFAULT_MENU),reviewed:true}]};
