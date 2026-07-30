/* ── Supabase Data Helpers ──
 * Shared mapping functions and mock data for settings/users/reviews.
 * Components use supabaseClient directly for queries instead of base44.
 */

export const DEFAULT_SETTINGS = {
  name: "Wabz Foods",
  phone: "+256 700 123 456",
  address: "Plot 15, Kampala Road, Kampala, Uganda",
  delivery_fee: "5000",
  delivery_radius: "10",
  opening_time: "08:00",
  closing_time: "22:00",
  footer_accent: "#e34234",
  footer_accent_secondary: "#fbbf24",
  stat_menu_items: "150+",
  stat_orders_delivered: "12K+",
  stat_avg_delivery_time: "30m",
  stat_expert_chefs: "15+",
};

export const MOCK_USERS = [
  { id: "1", phone_number: "+256 700 000 001", email: "admin@wabzfoods.com", created_at: "2026-01-15T08:00:00Z" },
  { id: "2", phone_number: "+256 700 000 002", email: "sarah@example.com", created_at: "2026-02-20T10:30:00Z" },
  { id: "3", phone_number: "+256 700 000 003", email: "james@example.com", created_at: "2026-03-05T14:15:00Z" },
];

export const MOCK_REVIEWS = [
  {
    id: "r1",
    author: "Sarah N.",
    rating: 5,
    text: "The Ugandan Rolex from Wabz Foods is absolutely incredible! Tastes just like home. Delivery is always on time and the food arrives hot.",
    date: "2026-03-10T18:30:00Z",
  },
  {
    id: "r2",
    author: "James M.",
    rating: 5,
    text: "I order from Wabz at least twice a week. The menu variety is fantastic — from local dishes to fast food, they have it all. Highly recommended!",
    date: "2026-03-12T12:00:00Z",
  },
  {
    id: "r3",
    author: "Grace A.",
    rating: 4,
    text: "Great online ordering experience. The tracking feature lets me know exactly when my food will arrive. The chicken and chips are a must-try!",
    date: "2026-03-15T09:45:00Z",
  },
  {
    id: "r4",
    author: "Peter K.",
    rating: 5,
    text: "Best Katogo in Kampala! The groundnut sauce is rich and authentic. My go-to breakfast place.",
    date: "2026-03-18T07:20:00Z",
  },
  {
    id: "r5",
    author: "Faith O.",
    rating: 4,
    text: "The Family Feast Bucket is amazing value. Feeds my whole family for under 70k. Will definitely order again!",
    date: "2026-03-22T19:00:00Z",
  },
];

/* ── Product mapping helpers ── */
function mapCategory(code) {
  if (code === "local") return "local";
  if (code === "drinks") return "drinks";
  return "fast";
}

function mapSubcategory(code) {
  switch (code) {
    case "breakfast": return "sides";
    case "lunch": return "sides";
    case "dinner": return "grilled";
    case "local": return "local";
    case "junk": return "fried";
    case "drinks": return "sides";
    default: return "sides";
  }
}

function defaultPrep(code) {
  if (code === "local") return "20-25 mins";
  if (code === "breakfast") return "10-15 mins";
  if (code === "drinks") return "5 mins";
  return "15-20 mins";
}

function defaultKcal(code) {
  if (code === "drinks") return "~180 kcal";
  if (code === "local") return "~580 kcal";
  if (code === "breakfast") return "~350 kcal";
  return "~450 kcal";
}

/**
 * Map a Supabase food_items row (with categories joined) to the UI product model.
 * Uses the new unified food_items schema:
 *   price, image_url, is_available, is_featured, prep_time, calories
 *   + categories(category_code) from the JOIN
 */
export function mapFoodProduct(item) {
  const catCode = item.categories?.category_code || "fast";
  return {
    id: item.item_id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    image_url: item.image_url || "",
    category: mapCategory(catCode),
    subcategory: mapSubcategory(catCode),
    featured: !!item.is_featured,
    available: item.is_available !== false,
    prep: item.prep_time || defaultPrep(catCode),
    kcal: item.calories || defaultKcal(catCode),
  };
}

/**
 * Map a Supabase menu_items row to the UI product model (legacy — old table).
 */
export function mapProduct(item) {
  return {
    id: item.item_id,
    name: item.name,
    description: item.description,
    price: Number(item.base_price),
    image_url: item.image || "",
    category: mapCategory(item.category_code),
    subcategory: mapSubcategory(item.category_code),
    featured: !!item.badge,
    available: item.is_active !== false,
    prep: defaultPrep(item.category_code),
    kcal: defaultKcal(item.category_code),
  };
}

/**
 * Map a Supabase orders row (with order_items joined) to the UI order model.
 */
export function mapOrder(o) {
  return {
    id: o.order_id,
    order_type: o.order_type,
    status: o.status || "pending",
    payment_status: o.payment_status || "unpaid",
    created_date: o.created_at,
    created_at: o.created_at,
    total: o.total_amount,
    total_amount: o.total_amount,
    customer_name: o.customer_name || "Guest",
    phone: o.phone || "",
    address: o.address || "",
    notes: o.notes || "",
    items: (o.order_items || []).map((i) => ({
      qty: i.quantity,
      name: i.item_id || "Item",
      price: i.price,
      customizations: i.customizations,
    })),
  };
}
