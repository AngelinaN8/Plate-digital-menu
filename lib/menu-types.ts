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
      includedDishes: [{dishId:"tuna-sashimi",price:null,note:"Sliced to order · menu price applies"},{dishId:"tuna-ceviche",price:null,note:"Dressed to order · menu price applies"}],
    },
  ],
  dishes: [
    {
      id: "tomato-stracciatella", name: "Tomatoes & stracciatella", category: "Starters", price: 86,
      description: "Ripe tomatoes, stracciatella, red onion and basil.", portion: "270 g \u00b7 For one",
      preparation: "Cut tomatoes on soft stracciatella, finished with red onion, basil and herb oil.",
      allergens: ["Milk"], image: "/images/13-tomato.jpg", available: true,
    },
    {
      id: "salmon-bowl", name: "Salmon bowl", category: "Mains", price: 118,
      description: "Salmon, quinoa, spinach, edamame, avocado and wakame.", portion: "230 g \u00b7 For one",
      preparation: "A bowl of salmon cubes, quinoa, whole spinach leaves, edamame, seaweed and half an avocado.",
      allergens: ["Fish", "Soy", "Sesame", "Wheat"], image: "/images/13-salmon.jpg", available: true,
    },
    {
      id: "garden-salad", name: "Shrimp, spinach & kale", category: "Starters", price: 86,
      description: "Seared shrimp, baby spinach, kale and sesame.", portion: "153 g \u00b7 For one",
      preparation: "Seared shrimp over whole salad leaves, finished with sesame and a lemon-soy dressing.",
      allergens: ["Crustaceans", "Soy", "Wheat", "Sesame"], image: "/images/tokyo-salad.jpg", available: true,
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
      id: "tuna-steak", name: "Ribeye & potato tarte tatin", category: "Mains", price: 248,
      description: "Grilled ribeye, golden potato tarte tatin and demi-glace.", portion: "400 g \u00b7 Good for sharing",
      preparation: "Grilled ribeye with sliced golden potatoes, herbs and a rich demi-glace.",
      allergens: ["Milk", "Sulphites"], image: "/images/13-ribeye.jpg", available: true,
    },
    {
      id: "tuna-sashimi", name: "Tuna Toro sashimi", category: "Starters", price: 98,
      description: "Fatty tuna Toro, finely sliced and served with daikon.", portion: "40 g \u00b7 For one",
      preparation: "Three thick slices of marbled tuna Toro, served chilled with shredded daikon.",
      allergens: ["Fish"], image: "/images/tokyo-toro.jpg", available: true,
    },
    {
      id: "tuna-ceviche", name: "Akami tuna tiradito", category: "Starters", price: 92,
      description: "Akami tuna, citrus dressing, cucumber, chilli and microgreens.", portion: "100 g \u00b7 For one",
      preparation: "Thin tuna slices dressed on a flat plate, with cucumber, chilli and a citrus-soy sauce.",
      allergens: ["Fish", "Soy", "Wheat"], image: "/images/tokyo-tiradito.jpg", available: true,
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
