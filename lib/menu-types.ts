export type Nutrition = {
  energyKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  source: "restaurant" | "ai-estimate";
  reviewed: boolean;
  visible: boolean;
  notes: string;
};

export type Dish = {
  id: string;
  name: string;
  category: string;
  price: number | null;
  description: string;
  portion: string;
  preparation: string;
  allergens: string[];
  image: string;
  available: boolean;
  nutrition?: Nutrition | null;
  recipe?: string;
  recipeServings?: number;
};

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type MenuEvent = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  recurrence: "weekly" | "last-weekday-monthly" | "one-off";
  days: Weekday[];
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  image?: string;
  afterCategory?: string;
};

export type Menu = {
  restaurantName: string;
  tagline: string;
  currency: string;
  accent: string;
  template: "editorial" | "gallery" | "classic";
  featuredDishIds: string[];
  promotion: {
    enabled: boolean;
    title: string;
    description: string;
    days: Weekday[];
    image?: string;
    afterCategory?: string;
  };
  events: MenuEvent[];
  dishes: Dish[];
};

export function normalizeMenu(menu: Menu): Menu {
  return {
    ...menu,
    template: menu.template ?? "editorial",
    featuredDishIds: menu.featuredDishIds ?? [],
    dishes: menu.dishes.map(d => ({ ...d, nutrition: d.nutrition ?? null, recipe: d.recipe ?? "", recipeServings: d.recipeServings ?? 1 })),
    events: menu.events ?? [],
    promotion: {
      enabled: menu.promotion?.enabled ?? false,
      title: menu.promotion?.title ?? "",
      description: menu.promotion?.description ?? "",
      days: menu.promotion?.days ?? [],
      image: menu.promotion?.image ?? "",
      afterCategory: menu.promotion?.afterCategory ?? "",
    },
  };
}

// Illustrative sample content. These photographs and generated concept images do not verify a real dish.
export const DEFAULT_MENU: Menu = {
  restaurantName: "Sora Social",
  tagline: "Good plates. Better nights.",
  currency: "AED",
  accent: "#6c4bf4",
  template: "gallery",
  featuredDishIds: ["garden-salad", "steak-rossini"],
  promotion: {
    enabled: false,
    title: "",
    description: "",
    days: [],
  },
  events: [
    {
      id: "wednesday-rose", title: "Wednesday rosé hour",
      description: "Unlimited rosé during our ladies’ happy hour. Ask the team for package details.",
      enabled: true, recurrence: "weekly", days: ["Wed"], date: "",
      startTime: "17:00", endTime: "20:00", timezone: "Asia/Dubai",
      image: "https://images.unsplash.com/photo-1747445666097-79d068882681?auto=format&fit=crop&w=1200&q=85", afterCategory: "Starters",
    },
    {
      id: "tuna-sunday", title: "The Sunday tuna cutting",
      description: "Join us for a live tuna cutting on the last Sunday of each month. Ask the team for details.",
      enabled: true, recurrence: "last-weekday-monthly", days: ["Sun"], date: "",
      startTime: "13:00", endTime: "15:00", timezone: "Asia/Dubai",
      image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=85", afterCategory: "Mains",
    },
  ],
  dishes: [
    {
      id: "garden-salad", name: "Garden salad", category: "Starters", price: 86,
      description: "Garden leaves, chickpeas, avocado, roasted sweet potato and a creamy dressing.",
      portion: "Starter · 180 g · serves one",
      preparation: "Roughly chopped seasonal vegetables and whole leaves, gently dressed. Served cold.",
      allergens: ["Milk"],
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85",
      available: true,
    },
    {
      id: "tomato-pasta", name: "Tomato fusilli", category: "Starters", price: 72,
      description: "Fusilli, slow-cooked tomato sauce, basil and extra virgin olive oil.",
      portion: "Starter · 220 g · serves one",
      preparation: "Spiral pasta tossed in tomato sauce and finished with fresh herbs. Served hot.",
      allergens: ["Wheat"],
      image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=1200&q=85",
      available: true,
    },
    {
      id: "steak-rossini", name: "Steak Rossini", category: "Mains", price: 268,
      description: "Beef fillet, seared foie gras, black truffle and Madeira jus.",
      portion: "Main · example portion · serves one",
      preparation: "Whole beef fillet on brioche, topped with seared foie gras and truffle, with a small potato purée quenelle.",
      allergens: ["Milk", "Wheat", "Sulphites"],
      image: "/images/steak-rossini-concept.webp",
      available: true,
    },
    {
      id: "house-cocktail", name: "House whisky cocktail", category: "Cocktails", price: 48,
      description: "Whisky, orange bitters and a little sweetness. Stirred over ice.",
      portion: "Cocktail · 90 ml before ice · one serving",
      preparation: "Low glass with a large ice cube and citrus garnish. Spirit-forward and aromatic.",
      allergens: [],
      image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=85",
      available: true,
    },
  ],
};
