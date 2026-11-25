import { getSupabaseServerClient, isSupabaseConfigured } from "./supabase";
import defaultMenuRaw from "@/config/menu-data.json";

export interface MenuItemOptionChoice {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemOptionGroup {
  id: string;
  name: string;
  type: "single" | "multiple";
  required?: boolean;
  choices: MenuItemOptionChoice[];
}

export interface MenuItem {
  id: string;
  category: string;
  categoryName_en?: string;
  categoryName_ar?: string;
  name_en: string;
  name_ar?: string;
  description_en: string;
  description_ar?: string;
  price: number;
  image: string;
  available: boolean;
  options?: MenuItemOptionGroup[];
  sort_order?: number;
  isSignature?: boolean;
  badge?: string;
  calories?: string;
}

// Static lookup maps for presentation metadata not stored in Supabase
const SIGNATURE_IDS = new Set([
  "dish-chicken-biryani",
  "dish-kabsa-mandi",
  "dish-grilled-half-chicken",
  "dish-bbq-grilled-fish",
  "dish-black-pepper-beef-fry",
  "dish-double-chicken-cheese-burger",
]);

const BADGE_MAP: Record<string, string> = {
  "dish-chicken-biryani": "Bestseller",
  "dish-beef-biryani": "Signature",
  "dish-kabsa-mandi": "Royal Special",
  "dish-grilled-half-chicken": "Charcoal Grilled",
  "dish-bbq-grilled-fish": "Catch of the Day",
  "dish-grilled-chicken-spiced-rice": "Popular",
  "dish-black-pepper-beef-fry": "Chef's Special",
  "dish-chicken-65": "Top Starter",
  "dish-chicken-manchurian": "Indo-Chinese",
  "dish-shrimp-noodles": "Seafood Delight",
  "dish-double-chicken-cheese-burger": "Loaded Burger",
  "dish-grilled-chicken-burger": "Healthy Choice",
  "dish-mint-lime-mojito": "Refreshing",
  "dish-egg-biryani": "Vegetarian Option",
};

const CALORIES_MAP: Record<string, string> = {
  "dish-chicken-biryani": "780 kcal",
  "dish-beef-biryani": "860 kcal",
  "dish-egg-biryani": "620 kcal",
  "dish-kabsa-mandi": "910 kcal",
  "dish-grilled-half-chicken": "720 kcal",
  "dish-bbq-grilled-fish": "640 kcal",
  "dish-grilled-chicken-spiced-rice": "790 kcal",
  "dish-black-pepper-beef-fry": "680 kcal",
  "dish-beef-curry": "710 kcal",
  "dish-chicken-kadai": "650 kcal",
  "dish-chicken-65": "520 kcal",
  "dish-chicken-manchurian": "580 kcal",
  "dish-shrimp-noodles": "690 kcal",
  "dish-double-chicken-cheese-burger": "890 kcal",
  "dish-beef-burger": "810 kcal",
  "dish-grilled-chicken-burger": "590 kcal",
  "dish-mint-lime-mojito": "140 kcal",
};

const CATEGORY_NAMES: Record<string, { en: string; ar: string }> = {
  biryani: { en: "Biryani & Rice", ar: "البرياني والأرز" },
  grills: { en: "Grills & Charcoal", ar: "المشاوي والفحم" },
  mains: { en: "Mains & Starters", ar: "الأطباق الرئيسية والمقبلات" },
  chinese: { en: "Indo-Chinese Wok", ar: "الووك الصيني" },
  burgers: { en: "Burgers & Fast Food", ar: "البرغر والوجبات السريعة" },
  drinks: { en: "Mocktails & Drinks", ar: "المشروبات والموخيتو" },
};

/**
 * Fetch all menu items from Supabase ordered by category, sort_order.
 * Gracefully falls back to local config/menu-data.json if Supabase is unconfigured or unreachable.
 */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  if (!isSupabaseConfigured()) {
    return defaultMenuRaw as MenuItem[];
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("Supabase menu_items fetch error, falling back to local menu:", error.message);
      return defaultMenuRaw as MenuItem[];
    }

    if (!data || data.length === 0) {
      return defaultMenuRaw as MenuItem[];
    }

    // Map database rows to MenuItem objects, enriching with presentation metadata
    return data.map((row: any) => ({
      id: row.id,
      category: row.category,
      categoryName_en: CATEGORY_NAMES[row.category]?.en,
      categoryName_ar: CATEGORY_NAMES[row.category]?.ar,
      name_en: row.name_en,
      name_ar: row.name_ar || undefined,
      description_en: row.description_en,
      description_ar: row.description_ar || undefined,
      price: Number(row.price),
      image: row.image || "/images/hero-banner.jpg",
      available: Boolean(row.available),
      options: (row.options as MenuItemOptionGroup[]) || [],
      sort_order: row.sort_order ?? 0,
      isSignature: SIGNATURE_IDS.has(row.id),
      badge: BADGE_MAP[row.id] || undefined,
      calories: CALORIES_MAP[row.id] || undefined,
    }));
  } catch (err: any) {
    console.warn("Exception in getAllMenuItems, falling back to local menu:", err.message);
    return defaultMenuRaw as MenuItem[];
  }
}

/**
 * Update a menu item's availability and/or price by id in Supabase.
 */
export async function updateMenuItem(
  id: string,
  updates: { available?: boolean; price?: number }
): Promise<{ success: boolean; item?: MenuItem; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase not configured — menu updates cannot be persisted in production.",
    };
  }

  try {
    const supabase = getSupabaseServerClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof updates.available === "boolean") {
      updatePayload.available = updates.available;
    }
    if (typeof updates.price === "number") {
      updatePayload.price = updates.price;
    }

    const { data, error } = await supabase
      .from("menu_items")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase updateMenuItem error:", error);
      return { success: false, error: error.message };
    }

    const updatedItem: MenuItem = {
      id: data.id,
      category: data.category,
      categoryName_en: CATEGORY_NAMES[data.category]?.en,
      categoryName_ar: CATEGORY_NAMES[data.category]?.ar,
      name_en: data.name_en,
      name_ar: data.name_ar,
      description_en: data.description_en,
      description_ar: data.description_ar,
      price: Number(data.price),
      image: data.image,
      available: Boolean(data.available),
      options: data.options || [],
      sort_order: data.sort_order,
      isSignature: SIGNATURE_IDS.has(data.id),
      badge: BADGE_MAP[data.id] || undefined,
      calories: CALORIES_MAP[data.id] || undefined,
    };

    return { success: true, item: updatedItem };
  } catch (err: any) {
    console.error("Exception in updateMenuItem:", err);
    return { success: false, error: err.message || "Failed to update menu item" };
  }
}
