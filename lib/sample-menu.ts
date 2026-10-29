import {DEFAULT_MENU, type Menu, type Nutrition} from './menu-types';
import ar from './sample-ar.json';
import moods from './sample-moods.json';
import type {MoodTags} from './dish-moods';
import {translationSource} from './menu-languages';

// Demonstration values only, never restaurant-verified nutrition data.
// Keep these in the sample fixture so real restaurant menus do not inherit them.
const nutritionExamples: Record<string, [number, number, number, number]> = {
  'tomato-stracciatella': [310, 9, 14, 24],
  'salmon-bowl': [420, 24, 27, 24],
  'garden-salad': [220, 18, 10, 12],
  'tomato-pasta': [340, 10, 57, 8],
  'steak-rossini': [860, 52, 32, 58],
  'tuna-steak': [940, 60, 31, 64],
  'tuna-sashimi': [96, 9, 1, 6],
  'tuna-ceviche': [140, 20, 6, 4],
  'whispering-angel': [120, 0, 3, 0],
  'house-cocktail': [190, 0, 12, 0],
};
const hiddenDishIds = new Set(['tomato-pasta', 'steak-rossini']);

export const SAMPLE_MENU: Menu = {
  ...DEFAULT_MENU,
  dishes: DEFAULT_MENU.dishes.map(d => {
    const [energyKcal, proteinG, carbsG, fatG] = nutritionExamples[d.id];
    const nutrition: Nutrition = {
      energyKcal, proteinG, carbsG, fatG,
      source: 'ai-estimate', reviewed: true, visible: true,
      notes: 'Illustrative sample values only. Not calculated or verified for this dish.',
    };
    return {
      ...d, available: !hiddenDishIds.has(d.id) && d.available, nutrition,
      moodTags: (moods as Record<string, MoodTags>)[d.id],
    };
  }),
  featuredDishIds: [],
  translations: [{code: 'ar', values: ar, sourceText: translationSource(DEFAULT_MENU), reviewed: true}],
};
