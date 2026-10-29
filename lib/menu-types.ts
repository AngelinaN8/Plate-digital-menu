import type {MenuTranslation} from './menu-languages';
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
  servingStyle?: import("./serving-style").ServingStyle;
  marketPrice?: boolean;
  moodTags?: import("./dish-moods").MoodTags;
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
export type OfferItem = { dishId: string; price: number | null; note: string };

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
  includedDishes?: OfferItem[];
};

export type Menu = {
  reference?: {website:string;pdf:string;notice:string;feeNote:string;checkedAt:string};
  headingStyle?: "sans" | "serif";
  languagePlan?: "core" | "pro";
  translations?: MenuTranslation[];
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
    includedDishes?: OfferItem[];
  };
  events: MenuEvent[];
  dishes: Dish[];
};

export function normalizeMenu(menu: Menu): Menu {
  return {
    ...menu,
    template: menu.template ?? "editorial",
    languagePlan: menu.languagePlan ?? "pro",
    translations: menu.translations ?? [],
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
      includedDishes: menu.promotion?.includedDishes ?? [],
    },
  };
}

// Illustrative sample content. Licensed real photographs illustrate a fictional restaurant and do not verify its recipes.
export const DEFAULT_MENU: Menu = {
  restaurantName: "The Terrace",
  tagline: "A little Mediterranean. A little unexpected.",
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
      image: "https://images.unsplash.com/photo-1747445666097-79d068882681?auto=format&fit=crop&w=1200&q=85", afterCategory: "__top",
      includedDishes: [{dishId:"whispering-angel",price:0,note:"150 ml glass · included for ladies during Wednesday happy hour, 17:00–20:00"}],
    },
    {
      id: "tuna-sunday", title: "The Sunday tuna cutting",
      description: "Join us for a live tuna cutting on the last Sunday of each month. Ask the team for details.",
      enabled: true, recurrence: "last-weekday-monthly", days: ["Sun"], date: "",
      startTime: "13:00", endTime: "15:00", timezone: "Asia/Dubai",
      image: "/images/tuna-cutting-licensed.jpg", afterCategory: "__top",
      includedDishes: [{dishId:"tuna-steak",price:null,note:"Fresh from the live cutting · menu price applies"},{dishId:"tuna-sashimi",price:null,note:"Sliced to order · menu price applies"},{dishId:"tuna-ceviche",price:null,note:"Citrus-cured · menu price applies"}],
    },
  ],
  dishes: [
    {
      id: "garden-salad", name: "Burrata & heritage tomatoes", category: "Starters", price: 86,
      description: "Burrata, colourful tomatoes, avocado, basil and extra virgin olive oil.",
      portion: "Starter · 180 g · serves one",
      preparation: "Creamy burrata with cut tomatoes, avocado and basil, served on a ceramic plate.",
      allergens: ["Milk"],
      image: "/images/terrace-burrata-editorial.jpg",
      available: true,
    },
    {
      id: "tomato-pasta", name: "Tomato fusilli", category: "Starters", price: 72,
      description: "Fusilli, slow-cooked tomato sauce, basil and extra virgin olive oil.",
      portion: "Starter · 220 g · serves one",
      preparation: "Spiral pasta tossed in tomato sauce and finished with fresh herbs. Served hot.",
      allergens: ["Wheat"],
      image: "/images/terrace-tomato-fusilli.jpg",
      available: true,
    },
    {
      id: "steak-rossini", name: "Steak Rossini", category: "Mains", price: 268,
      description: "Beef fillet, seared foie gras, black truffle and Madeira jus.",
      portion: "Main · example portion · serves one",
      preparation: "Beef fillet topped with foie gras and shaved truffle, with Madeira sauce and vegetables.",
      allergens: ["Milk", "Wheat", "Sulphites"],
      image: "/images/steak-rossini-real.jpg",
      available: true,
    },
    {
      id: "whispering-angel", name: "Whispering Angel Rosé", category: "Wine", price: 30,
      description: "A pale, dry rosé. One glass, a little sunshine, no rush.",
      portion: "150 ml glass", preparation: "Served chilled in a stemmed wine glass.",
      allergens: ["Sulphites"], image: "https://images.unsplash.com/photo-1747445666097-79d068882681?auto=format&fit=crop&w=1200&q=85", available: true,
    },
    {
      id: "tuna-steak", name: "Sesame-seared tuna steak", category: "Mains", price: 148,
      description: "Seared tuna, sesame, citrus and seasonal greens.", portion: "Main · example portion · serves one",
      preparation: "Sesame-crusted tuna steak, seared outside with a pink centre, sliced and served with wasabi-lime dressing.",
      allergens: ["Fish", "Sesame", "Soy", "Tree nuts"], image: "/images/tuna-offer-real.jpg", available: true,
    },
    {
      id: "tuna-sashimi", name: "Sashimi & cucumber", category: "Starters", price: 98,
      description: "Fresh sashimi, ribbons of cucumber and delicate herbs.", portion: "Starter · example serving",
      preparation: "Neatly arranged fish slices with cucumber ribbons and fresh herbs. Served chilled.",
      allergens: ["Fish", "Soy", "Wheat"], image: "/images/terrace-sashimi-editorial.jpg", available: true,
    },
    {
      id: "tuna-ceviche", name: "Citrus ceviche", category: "Starters", price: 92,
      description: "Citrus-cured fish, avocado, crisp garnishes and edible flowers.", portion: "Starter · example portion · serves one",
      preparation: "Thin fish slices in a citrus dressing, plated with avocado, crisp garnishes and edible flowers.",
      allergens: ["Fish"], image: "/images/terrace-ceviche-editorial.jpg", available: true,
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
