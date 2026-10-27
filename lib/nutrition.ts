import type { Nutrition } from './menu-types';

export const NUTRITION_DISCLAIMER = 'Approximate values per serving. AI estimates depend on the recipe and portion supplied and have not been laboratory tested. Actual values may vary. Do not use them for medical decisions or allergen safety.';

export function parseNutrition(value: unknown): Nutrition | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('Please check the nutrition values.');
  const n = value as Record<string, unknown>;
  const limits = { energyKcal: 10000, proteinG: 1000, carbsG: 1000, fatG: 1000 };
  for (const [key, max] of Object.entries(limits)) {
    if (typeof n[key] !== 'number' || !Number.isFinite(n[key]) || (n[key] as number) < 0 || (n[key] as number) > max) throw new Error('Enter valid, non-negative nutrition values for one serving.');
  }
  if (n.source !== 'restaurant' && n.source !== 'ai-estimate') throw new Error('Choose the nutrition source.');
  if (typeof n.reviewed !== 'boolean' || typeof n.visible !== 'boolean') throw new Error('Please check nutrition visibility.');
  if (n.visible && !n.reviewed) throw new Error('Review the nutrition values before showing them to guests.');
  if (typeof n.notes !== 'string' || n.notes.length > 1000) throw new Error('Keep nutrition notes under 1,000 characters.');
  return {energyKcal: Math.round(n.energyKcal as number), proteinG: Math.round((n.proteinG as number)*10)/10, carbsG: Math.round((n.carbsG as number)*10)/10, fatG: Math.round((n.fatG as number)*10)/10, source:n.source, reviewed:n.reviewed, visible:n.visible, notes:n.notes.trim()};
}

export function guestNutrition(n: Nutrition | null | undefined) { return n?.reviewed && n.visible ? n : null; }
