import type {Nutrition} from '@/lib/menu-types';
import {NUTRITION_DISCLAIMER} from '@/lib/nutrition';
export default function NutritionFacts({nutrition,sample=false}:{nutrition:Nutrition;sample?:boolean}){
 return <div className="nutrition-facts"><div className="nutrition-facts-heading"><strong>Nutrition</strong><span>{sample?'Illustrative example':nutrition.source==='ai-estimate'?'AI estimate':'Restaurant-provided'} · per serving</span></div><div className="nutrition-values">{[{v:nutrition.energyKcal,u:'kcal',label:'Energy'},{v:nutrition.proteinG,u:'g',label:'Protein'},{v:nutrition.carbsG,u:'g',label:'Carbs'},{v:nutrition.fatG,u:'g',label:'Fat'}].map(n=><div key={n.label}><strong>~{n.v}<small>{n.u}</small></strong><span>{n.label}</span></div>)}</div><p>{sample?'Example numbers showing the layout only. They have not been calculated or verified for this dish.':NUTRITION_DISCLAIMER}</p></div>
}
